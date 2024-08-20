import type Context from './core'
import { Howl } from 'howler'

class Media {
  private readonly musicList: Map<string, Howl> = new Map()

  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  // TODO: Game config and program default config
  private createAudio(src: string, loop = false, volume = /* this.ctx.config. */ 1) {
    const song = new Howl({ src, loop, volume })
    return song
  }

  public play(src: string, seconds?: number) {
    if (this.musicList.has(src)) {
      return this.musicList.get(src) as Howl
    }
    const audio = this.createAudio(src, true)
    audio.play()
    if (seconds) /* audio.seek( */ seconds
    this.musicList.set(src, audio)
    return audio
  }

  public stop(src: string) {
    if (!this.musicList.has(src)) return
    ;(this.musicList.get(src) as Howl).stop()
    this.musicList.delete(src)
  }

  public stopAll() {
    for (const audio of this.musicList.values()) audio.stop()
  }

  // public load(src: string) {
  //   const audio = this.createAudio(src)
  //   audio.load()
  //   this.musicList.set(src, audio)
  //   return audio
  // }

  public playOnce(src: string) {
    const audio = this.createAudio(src)
    audio.play()
    audio.once('end', () => audio.unload())
    return audio
  }
}

export default Media
