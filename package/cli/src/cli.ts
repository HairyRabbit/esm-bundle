import { createRequire } from 'node:module'
import path from 'node:path'
import yargs from 'yargs'
import { build, Bundler, Bundlers } from './index.js'

const args = await yargs(process.argv.slice(2))
  // .usage('$0', true, {}, handler)  
  .option('bundler', {
    alias: 'b',
    description: 'used bundler',
    type: 'string',
    choices: Bundlers,
    group: 'Build Options:'
  })
  .option('output', {
    alias: 'o',
    description: 'output directory',
    type: 'string',
    default: 'esm',
    group: 'Build Options:'
  })
  .option('print', {
    description: 'print module exports',
    type: 'boolean',
    default: false,
    group: 'Build Options:'
  })
  .example('esm','build from dependencies')
  .example('esm -b webpack react','use webpack to build react')
  .example('esm -b esbuild react react-dom -o ./dist','use esbuild to build react and react-dom output to "./dist" directory')
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .epilog('Copyright © Rabbit')
  .argv

const { _: modules, output, bundler } = args
const root = process.cwd()

if(0 === modules.length) {
  const require = createRequire(root)
  const resolved = require.resolve(path.join(root, 'package.json'))
  const pkg = require(resolved)

  if(undefined === pkg.dependencies) {
    console.log('No module found')
    process.exit(2)
  }

  const deps: string[] = Object.keys(pkg.dependencies)
  deps.forEach(dep => modules.push(dep))
}

build(modules.map(mod => mod.toString()), {
  bundler: bundler as Bundler,
  output: path.resolve(root, output),
})
