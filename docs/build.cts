import { cd, exec, mv } from 'shelljs'
import { resolve } from 'node:path'

const runningDir = process.cwd()

cd(resolve(runningDir, '..'))
exec('pnpm install')
exec('pnpm --filter misakura build')

cd('./packages/demo')
exec('pnpm run build')

cd('dist')
mv('index.html', 'demo.html')
mv('./*', resolve(runningDir, './.vitepress/dist/'))
