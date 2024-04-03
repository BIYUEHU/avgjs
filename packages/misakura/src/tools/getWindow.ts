export function getWindow() {
  const { innerWidth: windowW, innerHeight: windowH } = window;
  if (windowW / windowH < 16 / 9) return { width: windowW, height: (windowW * 9) / 16 };
  return { width: (windowH * 16) / 9, height: windowH };
}

export default getWindow;
