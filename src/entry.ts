import { pathToFileURL } from 'node:url'

export type Entry = { [key: string]: { [key: string]: ModuleExport } }
export type ModuleExport = { default: boolean, named: string[] }

export async function get_exports(modules: string[], require: NodeRequire) {
  const entry: Entry = {}

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    entry[mod] = {}

    const sub_mods = get_package_exports(mod, require)

    for (let j = 0; j < sub_mods.length; j++) {
      const sub_mod = sub_mods[j]
      const exports = await get_module_exports(sub_mod, require)
      entry[mod][sub_mod] = exports
    }
  }

  return entry
}

function get_package_exports(module: string, require: NodeRequire) {
  const resolved = require.resolve(`${module}/package.json`)
  const pkg = require(resolved)
  const exports = pkg.exports
  const files = [module]

  if (undefined === exports) return files

  for (const name in exports) {
    if (Object.prototype.hasOwnProperty.call(exports, name)) {
      if (~['.', './index', './'].indexOf(name)) continue

      const export_name = module + '/' + name.replace(/^\.\//, '')
      
      /** some reason, file defined in exports but not exists, should test first */
      try {
        require.resolve(export_name)
        files.push(export_name)
      }
      catch (e) {
        console.error(`Resolve failed: ${export_name}`)
      }
    }
  }

  return files
}

async function get_module_exports(module: string, require: NodeRequire): Promise<ModuleExport> {
  const resolved = require.resolve(module)
  const instance = await import(pathToFileURL(resolved).pathname)
  const { default: _default, ...named } = instance
  return {
    default: Boolean(_default),
    named: Object.keys(named),
  }
}


export function create_entry_code(name: string, exports: ModuleExport) {
  let code = ''

  const DefaultExport = '__DEFAULT_EXPORT__'

  code += 'import '
  if(exports.default) code += `${DefaultExport}`
  if(0 !== exports.named.length) {
    if(exports.default) code += ','
    code += `{${exports.named.map(name => `${name} as __${name}__`).join(',')}}`
  }
  else {
    code += ' '
  }
  code += `from "${name}";`

  if(exports.default) code += `export default ${DefaultExport};`
  if(0 !== exports.named.length) {
    code += `export{${exports.named.map(name => `__${name}__ as ${name}`).join(',')}};`
  }
  
  return code
}

export function flat_entry(entry: Entry) {
  const entries: [ string, ModuleExport ][] = []
  for (const i in entry) {
    if (Object.prototype.hasOwnProperty.call(entry, i)) {
      const mod = entry[i]
      for (const j in mod) {
        if (Object.prototype.hasOwnProperty.call(mod, j)) {
          const exports = mod[j]
          entries.push([ j, exports ])
        }
      }
    }
  }
  return entries
}

export function print_entry(entry: Entry): void {
  let out = '\n'
  for (const i in entry) {
    if (Object.prototype.hasOwnProperty.call(entry, i)) {
      out += `${i}:\n`
      const mod = entry[i]
      
      for (const j in mod) {
        if (Object.prototype.hasOwnProperty.call(mod, j)) {
          out += `${indent(1)}- ${j}:\n`
          const exports = mod[j]
          out += `${indent(3)}default: ${exports.default.toString()}\n`
          out += `${indent(3)}named: `
          if(0 === exports.named.length) {
            out += 'no member\n'
          }
          else {
            out += '\n'
            exports.named.map(item => {
              out += `${indent(4)}- ${item}\n`
            })
          }
        }
      }
    }
  }
  out += `\n`
  console.log(out)

  function indent(length: number) {
    return ' '.repeat(length * 2)
  }
}
