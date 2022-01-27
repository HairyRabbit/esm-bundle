import { Entry } from './entry.js'

export const enum Bundler {
  ESBuild = 'esbuild',
  WebPack = 'webpack',
}

export const Bundlers = [ Bundler.WebPack, Bundler.ESBuild ]

export type Bundle = (entry: Entry, output: string) => Promise<void>

export async function use_bundle(require: NodeRequire, bundler?: Bundler): Promise<Bundle> {
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
      const resolved = find_bundler(require)
      if(undefined === resolved) {
        throw new Error(`Unknown bundler "${bundler}"`)
      }

      return use_bundle(require, resolved)
    }
  }
}

function find_bundler(require: NodeRequire) {
  return Bundlers.find(bundler => {
    try {
      require.resolve(bundler)
      return true
    }
    catch(e) {
      console.log(e)
      return false
    }
  })
}
