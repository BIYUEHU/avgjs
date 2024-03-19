import { Assets, Sprite } from 'PIXI.js';

export async function loadAssets(assets: string) {
  const texture = await Assets.load(assets);
  return new Sprite(texture);
}

export default loadAssets;
