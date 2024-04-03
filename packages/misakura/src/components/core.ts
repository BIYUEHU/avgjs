import Stage from './stage';
import { Context } from '../context';
import State from '../tools/state';
import Config from './config';
import { Method } from './method';
import { Parser } from './parser';

declare module '../context' {
  interface Context {
    state: State;
    config: Config['config'];
    parser: Parser;
  }
}

export class Core extends Context {
  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super();
    this.provide('stte', new State());
    this.inject('state');
    this.provide('config', new Config(config));
    this.mixin('config', ['config']);
    this.provide('parser', new Parser());
    this.inject('parser');
    this.provide('stage', new Stage(this));
    this.mixin('stage', ['app', 'height', 'width', 'calcX', 'calcY']);
    this.provide('method', new Method(this));
    this.mixin('method', ['els', 'ctn', 'play', 'view', 'background', 'text', 'pause', 'character']);
  }
}

export default Core;
