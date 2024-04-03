/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2024-02-07 13:44:38
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-04-03 18:32:02
 */
import { Events } from '@kotori-bot/tools';
import Symbols from './symbols';
import { EventsMapping } from './events';

interface obj {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [propName: string | number | symbol]: any;
}

interface ContextOrigin {
  readonly [Symbols.container]: Map<string, obj>;
  readonly [Symbols.table]: Map<string, string[]>;
  root: Context;
  get(prop: string): obj | undefined;
  inject<T extends Keys>(prop: T): void;
  provide<T extends obj>(prop: string, value: T): void;
  mixin<K extends Keys>(prop: string, keys: K[]): void;
  extends<T extends obj>(meta?: T, identity?: string): Context;
}

interface ContextImpl extends ContextOrigin {}

declare module './context' {
  interface Context {
    identity?: string;
  }
}

type Keys = keyof Omit<Context, keyof ContextOrigin> & string;

const handler = <T>(value: T, ctx: Context): T => {
  if (!value || typeof value !== 'object' || !((value as T & { ctx: unknown }).ctx instanceof Context)) return value;
  return new Proxy(value, {
    get(target, prop, receiver) {
      if (prop === 'ctx') return ctx;
      return Reflect.get(target, prop, receiver);
    },
  });
};

export class Context implements ContextImpl {
  readonly [Symbols.container]: Map<string, obj> = new Map();

  readonly [Symbols.table]: Map<string, string[]> = new Map();

  root: Context;

  constructor(root?: Context) {
    this.root = root || this;
    this.provide('events', root ? root.get('events')! : new Events<EventsMapping>());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll']);
  }

  get<T = obj | undefined>(prop: string) {
    return this[Symbols.container].get(prop) as T;
  }

  inject<T extends Keys>(prop: T) {
    if (this[prop] && !this[Symbols.container].has(prop)) return;
    this[prop] = this.get(prop) as (typeof this)[T];
  }

  provide<T extends obj>(prop: string, value: T) {
    if (this[Symbols.container].has(prop)) return;
    this[Symbols.container].set(prop, value);
  }

  mixin<K extends Keys>(prop: string, keys: K[]) {
    this[Symbols.table].set(prop, keys);
    const instance = this.get(prop);
    if (!instance) return;
    this[Symbols.table].set(prop, keys);
    keys.forEach((key) => {
      if (this[key] || !instance[key]) return;
      this[key] = instance[key] as this[K];
      if (typeof this[key] === 'function') {
        this[key] = (this[key] as () => unknown)?.bind(instance) as unknown as this[K];
      }
    });
  }

  extends<T extends obj = object>(meta?: T, identity?: string) {
    const metaHandle = meta ?? ({} as T);
    /* clear function */
    Object.keys(metaHandle).forEach((key) => {
      if (typeof this[key as keyof this] === 'function') delete metaHandle[key];
    });
    /* set proxy */
    const ctx: Context = new Proxy(new Context(this.root), {
      get: <T extends Context>(target: T, prop: keyof T) => {
        if (prop === 'identity') return identity ?? this.identity ?? 'sub';
        if (target[prop]) return handler(target[prop], ctx);
        let value: unknown;
        this[Symbols.table].forEach((keys, key) => {
          if (value || (typeof prop === 'string' && !keys.includes(prop))) return;
          const instance = ctx[Symbols.container].get(key);
          if (!instance) return;
          value = instance[prop];
          if (typeof value === 'function') value = value.bind(instance);
        });
        if (value !== undefined) return value;
        if (metaHandle[prop]) return handler(metaHandle[prop], ctx);
        return handler(this[prop as keyof this], ctx);
      },
    });
    /* set table */
    this[Symbols.table].forEach((value, key) => ctx[Symbols.table].set(key, value));
    /* set container */
    this[Symbols.container].forEach((value, key) => {
      if (!value.ctx) return ctx[Symbols.container].set(key, value);
      return ctx[Symbols.container].set(key, handler(value, ctx));
    });
    return ctx;
  }
}

export default Context;
