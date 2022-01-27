import { createRequire } from 'node:module'
import { get_exports, print_entry } from './entry.js'
import { use_bundle, Bundler } from './bundle.js'

type BuildOptions = {
  readonly bundler?: Bundler,
  readonly output: string
}

export async function build(modules: string[], options: BuildOptions) {
  const require = createRequire(import.meta.url)
  const entry = await get_exports(modules, require)
  print_entry(entry)
  const bundle = await use_bundle(require, options.bundler)
  await bundle(entry, options.output ?? './dist')
}
