import webpack from 'webpack'
import { Bundle } from '../bundle.js'
import { create_entry_code, flat_entry, ModuleExport } from '../entry.js'

const config: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    module: true,
    library: {
      type: 'module',
    },
    environment: {
      module: true
    }
  },
  experiments: {
    outputModule: true,
  },
  externalsType: 'module'
}


const compile: Bundle = async (entry, output) => {
  const entries = flat_entry(entry)
  const config_entries = generate_entries(entries)
  await bundle(config, config_entries, output)
}

export default compile

async function bundle(
  config: webpack.Configuration,
  entries: [string, string][],
  output: string,
) {
  const modules = entries.map(([ file ]) => file)
  const configs: webpack.Configuration[] = entries.map(([name, entry]) => {
    return {
      ...config,
      entry: { [name]: entry },
      output: {
        ...config.output,
        path: output,
      },
      externals: modules.filter(file => file !== name)
    }
  })

  const compiler = webpack(configs)
  await run(compiler)
}

function generate_entries(entries: [string, ModuleExport][]): [string, string][] {
  return entries.map(([name, exports]) => {
    const esm = 'data:text/javascript,' + create_entry_code(name, exports)
    return [name, esm]
  })
}


function run(compiler: webpack.MultiCompiler): Promise<void> {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err)
        return
      }

      if (stats) {
        const info = stats.toJson()

        if (stats.hasErrors()) {
          console.error(info.errors)
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings)
        }
      }

      compiler.close(close_err => {
        if (close_err) {
          reject(close_err)
          return
        }

        resolve()
      })
    })
  })
}
