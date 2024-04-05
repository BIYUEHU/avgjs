import { Assets, Sprite } from 'PIXI.js';

export async function loadAssets(
  assets: string,
  option?: Partial<Pick<Sprite, 'width' | 'height' | 'x' | 'y' | 'filters' | 'filterArea'>>
) {
  const texture = await Assets.load(assets);
  if (!option) return new Sprite(texture);
  const sprite = new Sprite(texture);
  Object.keys(option).forEach((k) => {
    const key = k as keyof typeof option;
    (sprite as unknown as Record<string, unknown>)[key] = option[key]!;
  });
  return sprite;
}

export default loadAssets;
