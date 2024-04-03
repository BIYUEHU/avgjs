import { parseArgs } from '@kotori-bot/tools';
import { Command } from './command';

export async function loadScript(script: string) {
  let handle = script;
  if (script.charAt(script.length - 1) === '/') handle = `${script}/main.mrs`;
  else if (script.split('.')[script.split('.').length - 1] !== 'mrs') handle = `${script}.mrs`;
  const text = await (await fetch(handle)).text();
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
    const parsed = Command.handle(result);
    if (parsed instanceof Error) throw Error;
    return parsed;
  });
}

export default loadScript;
