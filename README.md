# pando.js

![banner]()
<img align="center" src="https://github.com/wespr/pando/blob/master/logo.png" height="80px" />

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
TODO: Put more badges here.

> The library for the distributed pando CVS 

TODO: Fill out this long description.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

This software is in a **very** alpha stage and is not meant to be used in production yet.

### Who are we ?

Pando is currently developed by the ryhope network and [wespr](http://www.wespr.co) teams.


Its development is backed by a grant from the [Aragon Nest](https://github.com/aragon/nest) program. However, pando intends to become a public library and infrastructure developed by the whole web3 / ethereum community: feel free to open issues, fork and open PR.

### Why pando ?

[Pando](https://en.wikipedia.org/wiki/Pando_(tree)) (Latin for "spread out") is a clonal colony of a single male quaking aspen determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares and is estimated to weigh collectively 6,000,000 kilograms, making it the heaviest known organism. The root system of Pando, at an estimated 80,000 years old, is among the oldest known living organisms.


## Install

```zsh
npm install @ryhope/pando.js --save
```

## Usage

```javascript
import Pando from '@ryhope/pando.js'
```

## API

> ```pando.js``` follows the spec defined by pando-interface which is still under active development and prone to evolve quickly.

### Pando constructor

```javascript
const opts = {
  user: {
    account: '0x2d6ef21eb58f164841b41a7b749d0d957790620a'
  },
  ethereum: {
    gateway: 'http://localhost:8545'
  }
}

let pando = new Pando(opts)
```

### Repository

> Repositories handle the local versions of your projects.

#### Create a new repository

```javascript
let repository = await pando.repository.new(path?: string)
```

> default ```path``` parameter: ```'.'```

#### Load an existing repository

```javascript
let repository = await pando.repository.load(path?: string)
```

> default ```path``` parameter: ```'.'```

#### Create a new branch

```javascript
let branch = await repository.branch.new(branchName: string)
```

#### Checkout from one branch to another

```javascript
let branch = await repository.checkout(branchName: string)
```

#### Stage files for snapshot

```javascript
await repository.stage([filePath: string, filePath: string, ...])
```

#### Snapshot (commit) modifications

```javascript
await repository.snapshot(message: string)
```

## Maintainers

[@osarrouy](https://github.com/osarrouy)

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2018 Ryhope Network
