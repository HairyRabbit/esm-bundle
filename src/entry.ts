import { createRequire } from 'node:module'
import process from 'node:process'

export function get_entry(modules: string[], require: NodeRequire) {  
  return modules.map(mod => {
    return get_module_files(mod, require)
  }).flat()
}

function get_module_files(mod: string, require: NodeRequire) {
  const resolved = require.resolve(`${mod}/package.json`)
  const pkg = require(resolved)
  const exports = pkg.exports
  const files = [mod]

  if (undefined === exports) return files

  for (const name in exports) {
    if (Object.prototype.hasOwnProperty.call(exports, name)) {
      /**@TODO add excludes to filter export names */
      if (~['.', './index', './', './build-info.json'].indexOf(name)) continue

      const export_name = mod + '/' + name.replace(/^\.\//, '')
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
