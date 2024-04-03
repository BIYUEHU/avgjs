import Core from './components/core';

(globalThis as unknown as { process: { pid: number } }).process = {
  pid: new Date().getTime(),
};

export * from './components';

export default Core;
