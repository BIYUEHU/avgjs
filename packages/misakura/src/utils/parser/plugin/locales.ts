export default {
  'corei18n.template.args_error': 'The type of argument "{0}" is incorrect, expected type: {1}, actual type: {2}',
  'corei18n.template.args_few': 'Fewer arguments than expected were provided. Expected number: {0}, actual number: {1}',
  'corei18n.template.args_many':
    'More arguments than expected were provided. Please reduce the number of arguments. Expected number: {0}, actual number: {1}',
  'corei18n.template.option_error': 'The type of option "{0}" is incorrect, expected type: {1}, actual type: {2}',
  'corei18n.template.syntax': 'Syntax error in command. Unexpected character "{1}" at position {0}',
  'corei18n.template.unknown': 'Unknown command "{0}". Please check if the command is entered correctly',
  'corei18n.template.error': 'An unexpected error has occurred!\nCaptured information: {0}',
  'corei18n.template.res_error': 'Error in response data format!\nError message: {0}',
  'corei18n.template.num_error': 'Incorrect sequence number, please resend',
  'corei18n.template.exists': 'The target argument "{0}" already exists, do not execute repeatedly',
  'corei18n.template.no_exists': 'The target argument "{0}" does not exist, please confirm and resend',
  'corei18n.template.data_error.args': 'Error in data passed to argument "{0}"',
  'corei18n.template.data_error.options': 'Error in data passed to option "{0}"',
  'corei18n.template.scope': 'This command can only be used in group chats or private chats!',
  'corei18n.template.no_access_manger': 'This command can only be used by group managers and group BOT administrators!',
  'corei18n.template.no_access_admin': 'This command can only be used by the highest administrator of the BOT!',
  'corei18n.template.empty': 'None',
  'corei18n.template.unsupported': 'The current platform does not support this message element',
  'corei18n.template': 'The current platform does not support this message element',
  'corei18n.template.prompt': 'Please enter a value:',
  'corei18n.template.confirm': 'Are you sure? (Yes/No)',
  'corei18n.template.confirm.sure': 'Yes',
  'core.descr.core': 'View instance statistics information',
  'core.descr.bot': 'View information and status of the current bot',
  'core.descr.bots': 'View information and status of all bots',
  'core.descr.about': 'View about information',
  'core.descr.locale': 'Set the display language',
  'core.descr.module': 'View the list of modules',
  'core.msg.bot':
    'ID: %identity%\nLanguage: %lang%\nPlatform: %platform%\nID: %self_id%\nConnection time: %create_time%\nNumber of received messages: %received_msg%\nNumber of sent messages: %sent_msg%\nNumber of instance shutdowns: %offline_times%\nLast message time: %last_msg_time%',
  'core.msg.core':
    'Global language: %lang%\nInstance directory: %root%\nRunning mode: %mode%\nNumber of modules: %modules%\nNumber of services: %services%\nNumber of bot instances: %bots%\nNumber of middlewares: %midwares%\nNumber of commands: %commands%\nNumber of regular expressions: %regexps%',
  'core.msg.bots': 'Instance list: %list%',
  'core.msg.bots.list': '\n----------\nID: %identity%\nLanguage: %lang%\nPlatform: %platform%\nStatus: %status%',
  'core.msg.about':
    'Kotori version: %version%\nCore version: %core_version%\nLoader version: %loader_version%\nLicense: %license%\nNodeJS version: %node_version%',
  'core.msg.locale': 'Successfully set the display language for the current instance to: %lang%',
  'core.msg.locale.global': 'Successfully set the global display language to: %lang%',
  'core.msg.locale.invalid': 'Parameter is invalid, must be one of the following values: en_US, ja_JP, zh_CN, zh_TW',
  'core.msg.module': 'Module list: %list%',
  'core.msg.module.list': '\n----------\nName: %name%\nDescription: %description%\nVersion: %version%',
  'core.msg.module.not_found': 'Module %name% not found',
  'core.descr.restart': 'Restart the Kotori program',
  'core.msg.restart': 'Kotori is restarting...',
  'core.msg.restart.not_daemon': 'Error, need daemon environment'
}
