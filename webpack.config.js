const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    react: { import: './index.js' }
  },
  devtool: 'inline-source-map',
  // output: {
  //   module: false,
  //   library: {
  //     type: 'commonjs2',
  //   }
  // },
  output: {
    iife: false,
    module: true,
    library: {
      type: 'module',
    }
  },
  experiments: {
    futureDefaults: true,
    outputModule: true,
  },
  recordsPath: path.join(__dirname, 'dist', 'record.json'),
  optimization: {
    providedExports: true,
  },
}
