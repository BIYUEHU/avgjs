import type DialogPage from '../Pages/DialogPage'
import { getDialogConstant, getDialogSpeaker, getDialogVariable, setDialogConstant, setDialogVariable } from '../store'
import CommandError from './parser/plugin/commandError'

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
    .option('C', 'color:string')
    .action(({ args: [message], options: { speaker } }) => {
      let handleSpeaker = speaker ? dialog.els.chars.get(speaker)?.name ?? speaker : getDialogSpeaker()
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

  ctx.command('const <name> <value>').action(({ args: [name, value] }) => {
    if (getDialogConstant(name) !== undefined) throw new CommandError(`Constant ${name} already exists`)
    setDialogConstant(name, value)
    return `Set constant ${name} to ${value}`
  })

  const setVariable = (name: string, raw: string, global = false) => {
    const variableType = typeof getDialogVariable(name)
    const value = (() => {
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    })()
    const valueType = typeof value
    if (typeof origin !== 'undefined' && variableType !== valueType) {
      throw new CommandError(`Type of variable ${name} is ${variableType}, but type of value is ${valueType}`)
    }
    setDialogVariable(name, value, global)
    return `Set variable ${name} to ${value}`
  }

  ctx
    .command('let <name> <value>')
    .option('G', 'global:boolean')
    .action(({ args: [name, raw], options: { global } }) => setVariable(name, raw, global))

  const handleCalc = (exprs: string) => {
    try {
      // biome-ignore lint:
      return JSON.stringify(eval(exprs))
    } catch (e) {
      throw new CommandError(`Expression ${exprs} is invalid: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  ctx.command('calc <name> <...expr>').action(({ args: [name, ...expr] }) => {
    const variableType = typeof getDialogVariable(name)
    if (typeof variableType === 'undefined') throw new CommandError(`Variable ${name} not found`)
    const exprs = expr.join(' ')
    const result = handleCalc(exprs)
    setVariable(name, result)
    return `Calculate ${exprs} to ${result} and set variable ${name} to ${result}`
  })

  ctx.command('if <...args>').action(({ args }) => {
    const thenIndex = args.findIndex((arg) => arg === 'then')
    if (thenIndex === -1) throw new CommandError('Missing if commands: no "then" command')
    const exprs = args.slice(0, thenIndex).join(' ')
    const commands = args.slice(thenIndex + 1).join(' ')
    if (handleCalc(exprs) === 'true') {
      ctx.exec(commands)
      return `If ${exprs} is true, execute commands: ${commands}`
    }
    return `If ${exprs} is false, skip commands: ${commands}`
  })

  ctx.midware((next, session) => {
    const raw = session.message.toString()
    if (!raw.includes(':')) return next()
    const arr = raw.split(':')
    const speaker = arr[0]
    const msg = arr.slice(1).join(':')
    session.message = `say ${JSON.stringify(msg)} -S ${JSON.stringify(speaker)}`
    return next()
  }, 1)
  // ctx.command('music <filename>').action(({ args: [filename] }) => {
  //   Media.playMusic(filename)
  // })
}

export default commander
