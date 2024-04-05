/* TODO: base dir handle that is similar to node.js path module */
/* TODO: audio: music, voice and sound */
type MusicType = [number[], HTMLAudioElement];

class Media {
  private static readonly musicList: Map<string, MusicType> = new Map();

  private static deleteMusic(key: string, audio: MusicType) {
    audio[0].forEach((timer) => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    audio[1].pause();
    this.musicList.delete(key);
  }

  public static stopMusic(filename?: string) {
    if (filename) {
      if (!this.musicList.has(filename)) return;
      this.deleteMusic(filename, this.musicList.get(filename)!);
      return;
    }
    this.musicList.forEach((audio, key) => this.deleteMusic(key, audio));
  }

  public static playMusic(filename: string) {
    if (this.musicList.has(filename)) return;
    this.stopMusic();
    const audio = new Audio(filename);
    const timers: number[] = [];
    const step = 0.01;
    /* TODO: max volume extends game volume setting */
    const maxVolume = 0.5;
    const faceTime = 5;
    const interval = (faceTime / maxVolume) * step * 1000;
    audio.volume = 0;
    audio.onplaying = () => {
      const fadeInInterval = setInterval(() => {
        if (audio.volume >= maxVolume) {
          clearInterval(fadeInInterval);
          return;
        }
        const result = audio.volume + step;
        audio.volume = result > maxVolume ? maxVolume : result;
      }, interval);
      const endTimer = setTimeout(() => {
        clearTimeout(endTimer);
        const fadeOutInterval = setInterval(() => {
          if (audio.volume <= 0) {
            clearInterval(fadeOutInterval);
            return;
          }
          const result = audio.volume - step;
          audio.volume = result < 0 ? 0 : result;
        }, interval);
        const loopTimer = setTimeout(() => [this.playMusic(filename), clearTimeout(loopTimer)], faceTime * 1000);
        timers.push(loopTimer, fadeOutInterval);
      }, (audio.duration - faceTime) * 1000);
      timers.push(fadeInInterval, endTimer);
    };
    audio.play();
    this.musicList.set(filename, [timers, audio]);
  }
}

export default Media;
