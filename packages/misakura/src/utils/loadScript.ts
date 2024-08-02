import { parseArgs } from '@kotori-bot/tools';
import minimist from 'minimist';
import { Command } from './command';
import {Tokens } from '../components';

function handle(input: string | string[]) {
  /* find start string */
  let starts = '';
  Command[Tokens.command].forEach((cmd) => {
    if (starts || !cmd.meta.action) return;
    const { root } = cmd.meta;
    if (typeof input === 'string' ? input.startsWith(`${root} `) : input[0] === root) starts = root;
  });
  if (!starts) return new Error(`未知的指令 "${input}"`);
  const cmd = Command[Tokens.command].get(starts)!;
  const parsed = typeof input === 'string' ? parseArgs(input.slice(starts.length).trim()) : input.slice(1);
  if (!Array.isArray(parsed)) return new Error(`语法错误，在 ${parsed.index} 处的 "${parsed.char}" 字符`);
  if (parsed.length === cmd.meta.args)
    return new Error(`参数数量不匹配，应为 ${cmd.meta.args} 个 实际为 ${parsed.length} 个`);
  return [minimist(parsed, cmd.meta), cmd] as const;
}

export async function loadScript(script: string) {
  let file = script;
  if (script.charAt(script.length - 1) === '/') file = `${script}/main.mrs`;
  else if (script.split('.')[script.split('.').length - 1] !== 'mrs') file = `${script}.mrs`;
  const text = await (await fetch(file)).text();
  const lines = text
    .split(text.includes('\r\n') ? '\r\n' : '\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'));
  let lastSpeaker: string;
  return lines.map((line) => {
    let result = parseArgs(line.trim());
    if (!Array.isArray(result)) {
      throw new Error(JSON.stringify(result));
    }
    if (result[0].charAt(result[0].length - 1) === ':') {
      let speaker = result[0].substring(0, result[0].length - 1);
      if (speaker) lastSpeaker = speaker;
      else speaker = lastSpeaker;
      delete result[0];
      result = ['say', result.join(' ').trim(), '--speaker', speaker];
    }
    const parsed = handle(result);
    if (parsed instanceof Error) throw Error;
    return parsed;
  });
}

export default loadScript;
