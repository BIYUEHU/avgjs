import type DialogPage from '../pages/dialogPage'

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
      if (!speaker || speaker === 'think') {
        dialog.currentPromise = dialog.text(message, speaker)
        return speaker ? `Self thinking: ${message}` : `Unknown said: ${message}`
      }
      dialog.currentPromise = dialog.text(`⌈${message}⌋`, dialog.els.chars.get(speaker)?.name ?? speaker)
      return `The character ${speaker} said: ${message})`
    })

  ctx.command('pause [time:number]').action(({ args: [time] }) => {
    dialog.currentPromise = dialog.pause(undefined, time || undefined)
    return time ? `Paused for ${time} seconds` : 'Paused util to next click'
  })

  ctx.midware((next, session) => {
    const raw = session.message.toString()
    if (!raw.includes(':')) return next()
    const arr = raw.split(':')
    const speaker = arr[0]
    const msg = arr.slice(1).join(':')
    session.message = `say "${msg}" -S "${speaker}"`
    return next()
  }, 1)
  // ctx.command('music <filename>').action(({ args: [filename] }) => {
  //   Media.playMusic(filename)
  // })
}

export default commander
