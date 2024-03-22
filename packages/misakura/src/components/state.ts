interface Statelist {
  home: null;
  dialog: {
    script: string;
    index: number;
  };
  settings: null;
  illustration: null;
}

export type StateType = {
  [K in keyof Statelist]: (Statelist[K] extends null ? object : Statelist[K]) & { state: K };
};

export class State {
  private static readonly KEY = 'MISAKURA';

  private static readonly storage = /* localStorage */ sessionStorage;

  public static set<K extends keyof Statelist>(state: K, data: Statelist[K]) {
    this.storage.setItem(this.KEY, JSON.stringify({ state, ...data }));
  }

  public static get() {
    if (!this.storage.getItem(this.KEY)) this.set('home', null);
    const obj = JSON.parse(this.storage.getItem(this.KEY)!) as StateType[keyof StateType];
    return new Proxy(obj, {
      set: (target, property, newValue, receiver) => {
        const result = Reflect.set(target, property, newValue, receiver);
        (this.set as (arg1: string, arg2: object) => void)(obj.state, obj);
        return result;
      },
    });
  }

  public static getMusicTime() {
    const result = Number(this.storage.getItem('musicTime'));
    return Number.isNaN(result) || !result ? undefined : result;
  }

  public static setMusicTime(time: number = 0) {
    this.storage.setItem('musicTime', String(time));
  }

  public static readonly debug = true;
}

export default State;
