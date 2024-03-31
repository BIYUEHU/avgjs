import { parseArgs } from '@kotori-bot/tools';
import minimist from 'minimist';

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
  private static readonly list: Map<string, Command> = new Map();

  public static handle(input: string | string[]) {
    /* find start string */
    let starts = '';
    this.list.forEach((cmd) => {
      if (starts || !cmd.meta.action) return;
      const { root } = cmd.meta;
      if (typeof input === 'string' ? input.startsWith(`${root} `) : input[0] === root) starts = root;
    });
    if (!starts) return new Error(`Uknown command "${input}"`);
    const cmd = this.list.get(starts)!;
    const parsed = typeof input === 'string' ? parseArgs(input.slice(starts.length).trim()) : input.slice(1);
    if (!Array.isArray(parsed)) return new Error(`语法错误，在 ${parsed.index} 处的 "${parsed.char}" 字符`);
    if (parsed.length === cmd.meta.args)
      return new Error(`参数数量不匹配，应为 ${cmd.meta.args} 个 实际为 ${parsed.length} 个`);
    return [minimist(parsed, cmd.meta), cmd] as const;
  }

  public static async run(data: ReturnType<typeof minimist>, cmd: Command) {
    if (!cmd.meta.action) return;
    await cmd.meta.action(data._, data);
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
    if (!Command.list.has(arr[0])) Command.list.set(cmd.meta.root, cmd);
    return cmd;
  }

  private readonly meta: CommandData;

  private constructor(meta: CommandData) {
    this.meta = meta;
  }

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
