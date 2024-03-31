/* TODO: base dir handle that is similar to node.js path module */
/* TODO: audio: music, voice and sound */

import { State } from '../components/state';

export function playMusic(filename: string) {
  const audio = new Audio(filename);
  const step = 0.01;
  /* TODO: max volume extends game volume setting */
  const maxVolume = 0.5;
  const faceTime = 5;
  const interval = (faceTime / maxVolume) * step * 1000;
  audio.volume = 0;
  audio.loop = true;
  let isSet = false;
  const setFunc = (duration: number) => {
    isSet = true;
    const lastTime = State.getMusicTime();
    if (lastTime && lastTime < duration) audio.currentTime = lastTime;
  };
  audio.onplaying = () => {
    if (!isSet) setFunc(audio.duration);
    const fadeInInterval = setInterval(() => {
      if (audio.volume >= maxVolume) {
        clearInterval(fadeInInterval);
        return;
      }
      const result = audio.volume + step;
      audio.volume = result > maxVolume ? maxVolume : result;
    }, interval);
    const setTimeInterval = setInterval(() => State.setMusicTime(audio.currentTime), 5000);
    const endTimer = setTimeout(() => {
      clearTimeout(endTimer);
      State.setMusicTime();
      clearInterval(setTimeInterval);
      const fadeOutInterval = setInterval(() => {
        if (audio.volume <= 0) {
          clearInterval(fadeOutInterval);
          return;
        }
        const result = audio.volume - step;
        audio.volume = result < 0 ? 0 : result;
      }, interval);
    }, (audio.duration - faceTime) * 1000);
  };
  audio.play();
}

export function playVoice() {}
