import { createRequire } from 'node:module'
import { get_exports, print_entry } from './entry.js'
import { use_bundle, Bundler } from './bundle.js'

type BuildOptions = {
  readonly output: string
  readonly bundler?: Bundler,
  readonly context?: string,
  readonly print?: boolean
}

export async function build(modules: string[], options: BuildOptions) {
  const require = createRequire(options.context ?? import.meta.url)
  const entry = await get_exports(modules, require)
  if(true === options.print) print_entry(entry)
  const bundle = await use_bundle(options.bundler)
  await bundle(entry, options.output)
}
