import type DialogPage from '../Pages/DialogPage'
import CommandError from './parser/commandError'

function commander(dialog: DialogPage) {
  const { parser: ctx } = dialog

  ctx.command('background <image>').action(({ args: [image] }) => {
    dialog.currentPromise = dialog.background(image)
    return `Update background to ${image}`
  })

  ctx
    .command('character <identity>')
    .option('N', 'name:string')
    .option('F', 'figure:string')
    .action(({ args: [identity], options }) => {
      dialog.currentPromise = dialog.character(identity, options)
      return `Update character ${identity} with options: ${JSON.stringify(options, null, 2)}`
    })

  ctx
    .command('show <identity>')
    .option('H', 'hide:boolean')
    .option('F', 'figure:string')
    .action(({ args: [identity], options: { figure, hide } }) => {
      dialog.currentPromise = dialog.character(identity, { show: !hide, figure })
      return `Update character ${identity} name to ${figure} and state to ${hide ? 'hide' : 'show'}`
    })

  ctx
    .command('say <message>')
    .option('S', 'speaker:string')
    .action(({ args: [message], options: { speaker } }) => {
      let handleSpeaker = speaker ? dialog.els.chars.get(speaker)?.name ?? speaker : ''
      handleSpeaker = handleSpeaker === 'think' ? '' : handleSpeaker === 'unknown' ? '未知的声音' : handleSpeaker
      if (!handleSpeaker) {
        dialog.currentPromise = dialog.text(message, handleSpeaker)
        return `Self thinking: ${message}`
      }
      dialog.currentPromise = dialog.text(`⌈${message}⌋`, handleSpeaker)
      return `The character ${handleSpeaker} said: ${message})`
    })

  ctx.command('pause [time:number]').action(({ args: [time] }) => {
    dialog.currentPromise = dialog.pause(undefined, time || undefined)
    return time ? `Paused for ${time} seconds` : 'Paused util to next click'
  })

  ctx.command('music [name]').action(({ args: [name] }) => {
    dialog.music(name)
    return name ? `Playing music ${name}` : 'Stop music'
  })

  ctx.command('voice <name>').action(({ args: [name] }) => {
    dialog.ctx.media.voice(name)
    return `Playing voice ${name}`
  })

  ctx.command('sound <name> [volume:number=1]').action(({ args: [name, volume] }) => {
    dialog.ctx.media.sound(name, volume)
    return `Playing sound ${name} with volume ${volume}`
  })

  ctx.command('const <name> <value>').action(({ args: [name, value] }) => {
    if (dialog.ctx.store.getDialogConstant(name) !== undefined)
      throw new CommandError(`Constant ${name} already exists`)
    dialog.ctx.store.setDialogConstant(name, value)
    return `Set constant ${name} to ${value}`
  })

  const setVariable = (name: string, raw: string | number | boolean) => {
    const variableType = typeof dialog.ctx.store.getDialogVariable(name)
    const value = (() => {
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return raw
      }
    })()
    const valueType = typeof value
    if (variableType !== 'undefined' && typeof origin !== 'undefined' && variableType !== valueType) {
      throw new CommandError(`Type of variable ${name} is ${variableType}, but type of value is ${valueType}`)
    }
    dialog.ctx.store.setDialogVariable(name, value)
    return `Set variable ${name} to ${value}`
  }

  ctx.command('let <name> <value>').action(({ args: [name, raw] }) => setVariable(name, raw))

  const handleCalc = (exprs: string) => {
    try {
      // biome-ignore lint:
      return JSON.stringify(eval(exprs.replaceAll(' == ', ' === ')))
    } catch (e) {
      throw new CommandError(`Expression ${exprs} is invalid: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  ctx.command('calc <name> <expr>').action(({ args: [name, expr] }) => {
    const variableType = typeof dialog.ctx.store.getDialogVariable(name)
    if (typeof variableType === 'undefined') throw new CommandError(`Variable ${name} not found`)
    const result = handleCalc(expr)
    setVariable(name, result)
    return `Calculate ${expr} to ${result} and set variable ${name} to ${result}`
  })

  ctx.command('if <condition> <command>').action(({ args: [condition, command] }) => {
    if (handleCalc(condition) === 'true') {
      ctx.exec(command)
      return `If ${condition} is true, execute commands: ${command}`
    }
    return `If ${condition} is false, skip commands: ${command}`
  })

  ctx.command('prompt <name>').action(({ args: [name] }) => {
    dialog.currentPromise = dialog.input(name, '')
    return 'Show prompt dialog with message'
  })

  ctx.command('confirm <name> <sure> <cancel>').action(({ args: [name, sure, cancel] }) => {
    dialog.currentPromise?.then(() => {
      ctx.exec(`options ${JSON.stringify(`${name}_temp`)} ${JSON.stringify(sure)} ${JSON.stringify(cancel)}`)
      dialog.currentPromise?.then(() => setVariable(name, !dialog.ctx.store.getDialogVariable(`${name}_temp`)))
    })
    return 'Show confirm dialog with message'
  })

  ctx.command('options <name> <...text>').action(({ args: [name, ...text] }) => {
    dialog.currentPromise = dialog.options(name, ...text)
    return `Show options ${name} with text: ${text.join(', ')}`
  })

  ctx.command('label <tag>').action(({ args: [tag] }) => {
    setVariable(`label_${tag}`, dialog.ctx.store.getDialogLine())
    return `Set label ${tag} to current line`
  })

  ctx.command('goto <tag>').action(({ args: [tag] }) => {
    const line = dialog.ctx.store.getDialogVariable(`label_${tag}`)
    if (typeof line === 'undefined') throw new CommandError(`Label ${tag} not found`)
    dialog.ctx.store.setDialogLine(Number(line))
    return `Jump to label ${tag}`
  })

  ctx.command('apply <file>').action(({ args: [file] }) => {
    dialog.setActive(false)
    dialog.ctx.store.setDialogScript({ entry: file, line: 0 }, true)
    dialog.setActive()
    return `Apply misakura script ${file}`
  })

  ctx.command('call <file>').action(({ args: [file] }) => {
    dialog.currentPromise = dialog.call(file)
    return `Call javascript ${file}`
  })

  ctx.command('final').action(() => {
    dialog.ctx.store.openFinalPlot()
    return 'Open final plot'
  })

  ctx.command('exit').action(() => dialog.ctx.emit('exit'))

  ctx.midware((next, session) => {
    const raw = session.message.toString()
    if (raw.includes(':')) {
      const arr = raw.split(':')
      const speaker = arr[0] || dialog.ctx.store.getDialogSpeaker()
      const msg = arr.slice(1).join(':')
      session.message = `say ${JSON.stringify(msg)} -S ${speaker ? JSON.stringify(speaker) : ''}`
    }

    session.message = session.message.replace(/\$(\w+)/g, (_, variable) => {
      const value = dialog.ctx.store.getDialogVariable()[variable] ?? dialog.ctx.store.getDialogConstant()[variable]
      if (value === undefined) {
        console.log(dialog.ctx.store.getDialogVariable())
        throw new CommandError(`Undefined variable: ${variable}`)
      }
      return JSON.stringify(value)
    })

    return next()
  }, 1)
  // ctx.command('music <filename>').action(({ args: [filename] }) => {
  //   Media.playMusic(filename)
  // })
}

export default commander
