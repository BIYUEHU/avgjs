export class Symbols {
  static readonly container = Symbol.for('misakura.context.container');

  static readonly table = Symbol.for('misakura.context.table');

  static readonly containerKey = (prop: string) => Symbol.for(`misakura.context.container.${prop}`);

  /* custom */
  static readonly command = Symbol.for('misakura.core.command');
}

export default Symbols;
