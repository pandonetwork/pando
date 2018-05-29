# IPLD for Pando

JavaScript implementation of the [IPLD format spec](https://github.com/ipld/interface-ipld-format) for Pando objects.

## Install

### npm

```sh
> npm install ipld-pando
```

### Use in Node.js

```JavaScript
const IpldBitcoin = require('ipld-bitcoin')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favorite bundler without having to adjust asset management process.

```JavaScript
let IPLDPando = require('ipld-pando')
```

### Use in a browser with a <script> tag 

TBD

## Usage

```js-ipld-pando``` is an implementation of the [IPLD format spec](https://github.com/ipld/interface-ipld-format) meant to be used through the [IPLD resolver](https://github.com/ipld/js-ipld). However, it can also be used as a standalone module:

```JavaScript
const IPLDPando = require('ipld-pando')

IPLDPando.util.serialize(pandoNode, (err, binary) => {
  if (err) {
    throw err
  }
  console.log(binary)
})
```

## Contribute

Feel free to join in or open an [issue](https://github.com/wespr/js-ipld-pando/issues)!

## License

[MIT](LICENSE) © 2018 wespr
