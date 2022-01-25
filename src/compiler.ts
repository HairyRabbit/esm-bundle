import fs from 'fs/promises'
import path from 'path'
import webpack from 'webpack'
import { createFsFromVolume, IFs, Volume } from 'memfs'

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


export async function compile(files: string[], require: NodeRequire, output: string) {
  const exports: [string, string[]][] = files.map(file => {
    const resolved = require.resolve(file)
    const instance = require(resolved)
    return [file, Object.keys(instance)]
  })

  const vfs = createFsFromVolume(new Volume())

  const entry = generate_esm_entry(exports)
  await bundle(config, files, entry, vfs)
  const contents = await get_contents(files, vfs)
  await emit(contents, output)
}

function emit(contents: [string, string][], output: string): Promise<void[]> {
  return Promise.all(contents.map(async ([name, content]) => {
    const filepath = path.join(output ?? './dist', `${name}.mjs`)
    const dir = path.dirname(filepath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filepath, content, 'utf-8')
  }))
}

async function bundle(
  config: webpack.Configuration,
  files: string[],
  entries: [string, string][],
  vfs: IFs,
) {
  const configs: webpack.Configuration[] = []

  entries.forEach(([name, entry]) => {
    let webpack_config: webpack.Configuration = {
      ...config,
      entry: { [name]: entry },
      externals: files.filter(file => file !== name)
    }

    configs.push(webpack_config)
  })

  const compiler = webpack(configs)
  compiler.outputFileSystem = vfs
  await run(compiler)
}

function get_contents(files: string[], vfs: IFs): Promise<[string, string][]> {
  return Promise.all(files.map(async name => {
    const content = await vfs.promises.readFile('./dist/' + name + '.mjs', 'utf-8')
    return [name, content.toString()]
  }))
}

function generate_esm_entry(contents: [string, string[]][]): [string, string][] {
  return contents.map(([name, exports]) => {
    const esm = create_entry(name, exports.filter(name => !~['__esModule'].indexOf(name)))
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

function create_entry(name: string, exports: string[]) {
  const str_exports = exports.join(',')
  let code = 'data:text/javascript,'
  code += `import {${str_exports}} from "${name}";`
  code += `export {${str_exports}};`
  code += `export default {${str_exports}};`
  return code
}
