import { Container, type DisplayObject, Text } from 'pixi.js'
import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'
import { createAutoLayout } from '../Ui/utils/layout'
import { SpriteButton } from '../Ui/button/SpriteButton'
import type { LevelsData } from '../class/levels/LevelsAdapter'
import type DialogPage from './DialogPage'

type LevelsPageType = 'SAVE' | 'LOAD'

export abstract class LevelsPageAbstract extends SidebarPageAbstract {
  private isRender = false

  private pageIndex = 0

  private levelsPageType: LevelsPageType

  private displayObjectCache: DisplayObject[] = []

  private async loadLevel(level: LevelsData) {
    if (this.ctx.store.getHistoryPage().includes('dialog') && !(await confirm('Are you sure to load this level?')))
      return
    this.ctx.store.setDialogScript(level.data.script, level.data)
    this.ctx.pages.dialog.setActive()
    return
  }

  private async saveLevel(position: number, isEmpty: boolean) {
    if (!isEmpty && !(await confirm('Are you sure to save this level?'))) return

    this.ctx.levels.set(position, {
      position,
      name: 'Misakura Level',
      date: Date.now(),
      data: this.ctx.store.getDialogAll(),
      icon: (this.ctx.pages.dialog as DialogPage).iconData
    })
    this.setActive(false)
    this.isRender = true
    this.setActive(true)
  }

  public constructor(ctx: Context, type: LevelsPageType) {
    super(ctx, type, `${type.charAt(0)}${type.slice(1).toLowerCase()}`)
    this.levelsPageType = type
  }

  public async load() {
    if (this.isRender) {
      this.isRender = false
    } else {
      this.pageIndex = 0
    }

    const levels = await this.ctx.levels.getAll()
    const handleLevels = new Array(5 * 3 * 20)
      .fill(null)
      .map((_, index) => levels.find(({ position }) => position === index) ?? null)

    const getStartsRow = (row: number) => this.pageIndex * 15 + row * 5

    const levelsGroup = createAutoLayout(
      [0, 1, 2],
      {
        pos: [670, 235],
        direction: 'down'
      },
      (row, index) =>
        createAutoLayout(
          handleLevels.slice(getStartsRow(row), getStartsRow(row + 1)),
          { pos: [0, index * 250], spacing: 25, direction: 'right', size: { width: 250, height: 250 } },
          (level, col) => {
            const icon = new SpriteButton(
              '',
              (type) => {
                if (type !== 'down') return
                if (this.levelsPageType === 'LOAD' && level) this.loadLevel(level)
                else if (this.levelsPageType === 'SAVE') this.saveLevel(getStartsRow(row) + col, !level)
              },
              { button: level?.icon || '/gui/levels/empty.png' }
            ).view
            const text = new Text(level?.date ? new Date(level.date).toLocaleString() : 'No Data', {
              fontSize: level ? 27 : 37,
              fill: 0x232323
            })
            text.position.set(...(level ? [-120, 90] : [-105, 80]))
            const ctn = new Container()
            ctn.addChild(icon, text)
            return ctn
          }
        )
    )

    const buttonsGroup = createAutoLayout(
      new Array(20),
      { pos: [1070, 990], direction: 'row', spacing: 20 },
      (_, index) => {
        const isSelf = this.pageIndex === index
        return new SpriteButton(
          (index + 1).toString(),
          (type) => {
            if (type !== 'down') return
            this.setActive(false)
            this.pageIndex = index
            this.isRender = true
            this.setActive(true)
          },
          {
            style: { fontSize: 43, fill: isSelf ? 0x0064ff : 0x00b4ff },
            hoverStyle: { fill: isSelf ? 0x0064ff : 0x0099ff },
            pressedStyle: { fill: 0x0064ff }
          }
        ).view
      }
    )

    for (const obj of this.displayObjectCache) this.layer.remove(obj, LayerLevel.BEFORE)
    this.displayObjectCache = [levelsGroup, buttonsGroup]
    this.layer.add([levelsGroup, buttonsGroup], LayerLevel.BEFORE)
  }
}
