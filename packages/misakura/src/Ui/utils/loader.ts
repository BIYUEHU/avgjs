import { Assets } from 'PIXI.JS'

export async function preload(assets: string[]): Promise<void> {
  if (assets.length === 0) return
  await Assets.load(assets)
}
