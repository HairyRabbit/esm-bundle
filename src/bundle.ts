import { createRequire } from 'node:module'
import { Entry } from './entry.js'

export const enum Bundler {
  ESBuild = 'esbuild',
  WebPack = 'webpack',
}

export const Bundlers = [ Bundler.WebPack, Bundler.ESBuild ]

export type Bundle = (entry: Entry, output: string) => Promise<void>

export async function use_bundle(bundler?: Bundler): Promise<Bundle> {
  switch(bundler){
    case Bundler.WebPack: {
      const mod = await import('./bundler/webpack.js')
      return mod.default
    }
    case Bundler.ESBuild: {
      const mod = await import('./bundler/esbuild.js')
      return mod.default
    }
    
    default: {
      if(undefined === bundler) {
        const resolved = find_bundler()
        if(undefined === resolved) {
          throw new Error(`No bundler found, you should install one of bundler ${Bundlers.join(', ')}.`)
        }

        return use_bundle(resolved)
      }
      else {
        throw new Error(`Unknown bundler: "${bundler}", custom bundler are not supports yet.`)
      }
    }
  }
}

function find_bundler() {
  const require = createRequire(import.meta.url)

  return Bundlers.find(bundler => {
    try {
      require.resolve(bundler)
      return true
    }
    catch(e) {
      return false
    }
  })
}
