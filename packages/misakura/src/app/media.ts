import type Context from './core'
import { Howl } from 'howler'

class Media {
  private readonly musicList: Map<string, Howl> = new Map()

  private lastVoice?: Howl

  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  // TODO: Game config and program default config
  private createAudio(src: string, loop = false, volume = /* this.ctx.config. */ 1) {
    const song = new Howl({ src, loop, volume })
    return song
  }

  public music(name: string, seconds?: number, volume = 0.12) {
    if (this.musicList.has(name)) {
      return this.musicList.get(name) as Howl
    }
    const audio = this.createAudio(this.ctx.path('music', name), true, volume)
    audio.play()
    if (seconds) /* audio.seek( */ seconds
    this.musicList.set(name, audio)
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

  public voice(name: string) {
    this.lastVoice?.stop().unload()
    this.lastVoice = this.createAudio(this.ctx.path('voice', name), false, 1)
    this.lastVoice.play()
    // return audio
    return this.lastVoice
  }

  public sound(name: string, volume?: number) {
    const audio = this.createAudio(this.ctx.path('sound', name), false, volume)
    audio.play()
    audio.once('end', () => audio.unload())
    return audio
  }
}

export default Media
