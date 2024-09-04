import { cd, exec, mv } from 'shelljs'
import { resolve } from 'node:path'

const runningDir = process.cwd()

cd(resolve(runningDir, '../packages/demo'))
exec('npm run build')

cd('dist')
mv('index.html', 'demo.html')
mv('./dist', resolve(runningDir, './.vitepress/dist/'))
