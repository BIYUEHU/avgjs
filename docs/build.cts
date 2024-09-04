import { cd, exec, mv } from 'shelljs'
import { resolve } from 'node:path'

const runningDir = process.cwd()

cd(resolve(runningDir, '../packages/demo'))
exec('pnpm --filter misakura build')
exec('pnpm run build')

cd('dist')
mv('index.html', 'demo.html')
mv('./*', resolve(runningDir, './.vitepress/dist/'))
