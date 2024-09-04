/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-09-04 16:05:01
 */

import { UserAccess, CommandError, type Context, MessageScope, TsuError, ModuleError } from '@kotori-bot/core'
import locales from './locales'
import { logger } from '../../tools/logger'

export function main(ctx: Context) {
  ctx.i18n.use(locales, 'en_US')

  ctx.on('before_command', (data) => {
    const quick = (arg: Parameters<typeof data.session.quick>[0]) => {
      if (!arg) return
      let text: string
      if (Array.isArray(arg)) {
        text = data.session.format(data.session.i18n.locale(arg[0]), arg[1] as string[])
      } else {
        text = data.session.i18n.locale(arg.toString())
      }
      logger.label('CommandError').error(text, 'at: ', data.raw)
    }
    if (!(data.result instanceof CommandError)) {
      const { scope, access } = data.command.meta
      if (scope && scope !== 'all' && data.session.type !== scope) {
        quick('corei18n.template.scope')
        data.cancel()
      } else if (String(data.session.userId) !== String(data.session.api.adapter.config.master)) {
        if (access === UserAccess.ADMIN) {
          quick('corei18n.template.no_access_admin')
          data.cancel()
        } else if (
          access === UserAccess.MANGER &&
          (data.session.type === MessageScope.PRIVATE ||
            (data.session.type === MessageScope.GROUP && !['owner', 'admin'].includes(data.session.sender.role)))
        ) {
          quick('corei18n.template.no_access_manger')
          data.cancel()
        }
      }
      return
    }
    data.cancel()
    const { value } = data.result
    switch (value.type) {
      case 'arg_error':
        quick(['corei18n.template.args_error', [value.index, value.expected, value.reality]])
        break
      case 'arg_few':
        quick(['corei18n.template.args_few', [value.expected, value.reality]])
        break
      case 'arg_many':
        quick(['corei18n.template.args_many', [value.expected, value.reality]])
        break
      case 'option_error':
        quick(['corei18n.template.option_error', [value.target, value.expected, value.reality]])
        break
      case 'syntax':
        quick(['corei18n.template.syntax', [value.index, value.char]])
        break
      default:
    }
  })

  ctx.on('command', ({ result, session }) => {
    if (!(result instanceof CommandError)) return
    const { value } = result
    const quick = session.quick.bind(session)
    switch (value.type) {
      case 'unknown':
        quick(['corei18n.template.unknown', [value.input]])
        break
      case 'res_error':
        quick(['corei18n.template.res_error', [value.error.message]])
        break
      case 'num_error':
        quick('corei18n.template.num_error')
        break
      case 'no_access_manger':
        quick('corei18n.template.no_access_manger')
        break
      case 'no_access_admin':
        quick('corei18n.template.no_access_admin')
        break
      case 'disable':
        quick('corei18n.template.disable')
        break
      case 'exists':
        quick(['corei18n.template.exists', [value.target]])
        break
      case 'no_exists':
        quick(['corei18n.template.no_exists', [value.target]])
        break
      case 'error':
        ctx.emit('error', value.error instanceof Error ? value.error : new ModuleError(String(value.error)))
        if (value.error instanceof CommandError) {
          logger.label(value.error.name).error(value.error.message)
        } else if (value.error instanceof TsuError) {
          quick(['corei18n.template.res_error', [value.error.message]])
        } else if (value.error instanceof Error) {
          quick(['corei18n.template.error', [`${value.error.name} ${value.error.message}`]])
        } else if (typeof value.error === 'object') {
          quick(['corei18n.template.error', [JSON.stringify(value.error)]])
        } else {
          quick(['corei18n.template.error', [String(value.error)]])
        }
        break
      case 'data_error':
        quick([`corei18n.template.data_error.${typeof value.target === 'string' ? 'options' : 'args'}`, [value.target]])
        break
      default:
    }
  })
}

export default main
