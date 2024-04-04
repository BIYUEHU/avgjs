import type minimist from 'minimist';
// import logger from '../tools/logger';
import { Symbols } from '../context';
import logger from '../tools/logger';

interface CommandData {
  root: string;
  args: number;
  alias: Record<string, string>;
  string: string[];
  boolean: string[];
  default: Record<string, unknown>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  action?: (args: string[], options: Record<string, any>) => void | Promise<void>;
}

export class Command {
  private static readonly [Symbols.command]: Map<string, Command> = new Map();

  public static async run(data: ReturnType<typeof minimist>, cmd: Command) {
    if (!cmd.meta.action) return;
    const result = cmd.meta.action(data._, data);
    if (!(result instanceof Promise)) return;
    await result.catch((e) => logger.error(e));
  }

  public static set(template: string, config?: Pick<CommandData, 'alias' | 'string' | 'boolean'>) {
    const arr = template.trim().split(' ');
    const cmd = new Command({
      root: arr[0],
      args: arr.length > 0 ? 0 : arr.length - 1,
      alias: {},
      string: [],
      boolean: [],
      default: {},
      ...(config || {}),
    });
    if (!Command[Symbols.command].has(arr[0])) Command[Symbols.command].set(cmd.meta.root, cmd);
    return cmd;
  }

  public static isuseful(input: string) {
    let starts = false;
    this[Symbols.command].forEach((cmd) => {
      if (starts) return;
      const { root } = cmd.meta;
      if (typeof input === 'string' ? input.startsWith(`${root} `) : input[0] === root) starts = true;
    });
    return starts;
  }

  private constructor(meta: CommandData) {
    this.meta = meta;
  }

  public readonly meta: CommandData;

  public action(callback: Exclude<CommandData['action'], undefined>) {
    this.meta.action = callback;
    return this;
  }

  public option(name: string, template: string) {
    const [str, value] = `${template.trim()}=`.split('=');
    const [realname, type] = str.trim().split(':');
    this.meta.alias[realname] = name;
    if (type === 'string') this.meta.string.push(realname);
    else if (type === 'boolean') this.meta.boolean.push(realname);
    if (value !== undefined) this.meta.default[realname] = type === 'boolean' ? Boolean(value) : value;
    return this;
  }
}

export default Command;
