# esm-bundle

Bundle library as ESModule


## installation 

```sh
yarn add -D esm-bundle
# use webpack as bundler
yarn add -D webpack
# use esbuild as bundler
yarn add -D esbuild
```

## usage

```sh
esm react react-dom
```

## faq

### why

`esm-bundle` design used for browser native esmodule. when you load some library
like `lodash`, it will send many requests. it not useful for develop, we
usually always focus on exports of library. so bundle this modules into one and
cache it forever could helpful for develop mode.

### nodejs library

the config of bundler not setup for nodejs, so some module may not resolved, you
will see the errors when you bundle a nodejs library.

### externals

when you bundle mulit libraries, it will set externals each other. like:

```sh
esm react react-dom
```

`react-dom` depends on `react`, the react-dom bundle will set react as external
dependency that append a import statment on top of file.

### bundler

custom bundler are not supports but easy to add.
