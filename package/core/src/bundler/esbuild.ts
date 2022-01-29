import esbuild from 'esbuild'
import { Bundle } from '../bundle.js'
import { create_entry_code, flat_entry, ModuleExport } from '../entry.js'

const compile: Bundle = async (entry, output) => {
  const entries = flat_entry(entry)
  const config_entries = generate_entries(entries)
  await bundle(config_entries, output)
}

export default compile

function generate_entries(entries: [string, ModuleExport][]): [string, string][] {
  return entries.map(([name, exports]) => {
    const esm = create_entry_code(name, exports)
    return [name, esm]
  })
}

async function bundle(entries: [string, string][], output: string) {
  const configs: esbuild.BuildOptions[] = entries.map(([ name, contents ]) => {
    return {
      stdin: {
        contents,
        loader: 'js',
        resolveDir: process.cwd(),
      },
      bundle: true,
      format: 'esm',
      outfile: output + '/' + name + '.mjs',
      platform: 'node'
    }
  })
  return Promise.all(configs.map(esbuild.build))
}

