import { Context } from '../context';

export abstract class Page {
  protected readonly ctx: Context;

  public constructor(ctx: Context) {
    this.ctx = ctx;
  }

  public abstract load(...args: unknown[]): void;
}

export default Page;
