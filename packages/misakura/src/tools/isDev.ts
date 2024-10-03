export default function isDev() {
  return !!import.meta && 'env' in import.meta && !!(import.meta as unknown as { env: { DEV: boolean } }).env?.DEV
}
