import type DialogPage from '../pages/dialogPage'
import Media from '../tools/media'

function commander(dialog: DialogPage) {
  const { parser: ctx } = dialog

  ctx.command('background <image>').action(({ args: [image] }) => {
    dialog.background(image)
    return `Update background to ${image}`
  })

  ctx
    .command('character <identity>')
    .option('N', 'name:string')
    .option('F', 'figure:string')
    .action(({ args: [identity], options }) => {
      dialog.character(identity, options)
      return `Update character ${identity} with options: ${JSON.stringify(options, null, 2)}`
    })

  ctx
    .command('show <identity>')
    .option('H', 'hide:boolean')
    .option('F', 'figure:string')
    .action(({ args: [identity], options: { figure, hide } }) => {
      dialog.character(identity, { show: !hide, figure })
      return `Update character ${identity} name to ${figure} and state to ${hide ? 'hide' : 'show'}`
    })

  ctx
    .command('say <message>')
    .option('S', 'speaker:string')
    .option('C', 'color:string')
    .action(({ args: [message], options: { speaker } }) => {
      if (!speaker || speaker === 'think') {
        dialog.text(message)
        return speaker ? `Self thinking: ${message}` : `Unknown said: ${message}`
      }
      dialog.text(`⌈${message}⌋`, dialog.els.chars.get(speaker)?.name ?? speaker)
      return `The character ${speaker} said: ${message})`
    })

  ctx.command('pause [time:number]').action(({ args: [time] }) => {
    dialog.pause(undefined, time || undefined)
    return time ? `Paused for ${time} seconds` : 'Paused util to next click'
  })

  ctx.command('music <filename>').action(({ args: [filename] }) => {
    Media.playMusic(filename)
  })
}

export default commander
