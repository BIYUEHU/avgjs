export type PageType = 'home' | 'dialog';

interface State {
  page: PageType;
  script: string;
  index: number;
  musicTime: number;
}

class StateOrigin {
  private static readonly DEFAULT: State = {
    page: 'home',
    script: '',
    index: 0,
    musicTime: 0,
  };

  private static readonly KEY = 'MISAKURA';

  private static readonly storage = /* localStorage */ sessionStorage;

  public static set<T extends keyof State>(key: T, value: State[T]) {
    const data = this.storage.getItem(this.KEY);
    const obj = { ...(data ? JSON.parse(data) : {}), [key]: value };
    this.storage.setItem(this.KEY, JSON.stringify(obj));
  }

  public static get<T extends keyof State>(key: T): State[T] {
    if (!this.storage.getItem(this.KEY)) this.storage.setItem(this.KEY, JSON.stringify(this.DEFAULT));
    const obj = JSON.parse(this.storage.getItem(this.KEY)!);
    return obj[key];
  }

  public static readonly debug = true;
}

export const State = new Proxy(StateOrigin, {
  get<T extends keyof State>(target: typeof StateOrigin, propName: T, receiver: unknown) {
    if (propName in target || typeof propName === 'symbol') return Reflect.get(target, propName, receiver);
    const result = target.get(propName);
    if (propName !== 'page' || result) return result;
    target.set('page', 'home');
    return 'home';
  },
  set<T extends keyof State>(target: typeof StateOrigin, propName: T, newValue: State[T], receiver: unknown) {
    if (propName in target || typeof propName === 'symbol') return Reflect.set(target, propName, newValue, receiver);
    target.set(propName, newValue);
    return true;
  },
}) as unknown as typeof StateOrigin & State;

export default State;
