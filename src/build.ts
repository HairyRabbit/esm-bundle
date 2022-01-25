import { createRequire } from 'node:module'
import { get_entry } from './entry.js'
import { compile } from './compiler.js'

type BuildOptions = {
  readonly context?: string,
  readonly output?: string
}

export async function build(modules: string[], options: BuildOptions = {}) {
  const require = createRequire(options.context ?? import.meta.url)
  const entry = get_entry(modules, require)
  await compile(entry, require, options.output ?? './dist')
}
