import type { CoreOption } from '../types'

export const DEFAULT_CORE_OPTION: Required<CoreOption> & { styles: Required<CoreOption['styles']> } = {
  entry: '/scripts/main.mrs',
  element: document.body,
  styles: {
    background: '/gui/dialog/background.png',
    dialog: '/gui/dialog/dialog.png',
    dialogX: 1,
    dialogY: 768,
    dialogNameX: 160,
    dialogNameY: 768,
    dialogNameSize: 47,
    dialogMsgX: 96,
    dialogMsgY: 843,
    dialogMsgWrap: 1728,
    dialogMsgSize: 39,
    margin: 48,
    characterHeight: 718
  },
  render: {}
}

export default DEFAULT_CORE_OPTION
