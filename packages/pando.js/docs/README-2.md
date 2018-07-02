<h1 align="center">
  <br>
  Pando
  <br>
</h1>

A cooperation and versioning system based on [IPFS](https://ipfs.io) and [AragonOS](https://github.com/aragon/aragonOS).

## Notes

This software is in a **very** alpha stage, is likely to evolve quickly and is not meant to be used in production yet.

pando is currently developed by the [wespr](http://www.wespr.cp) team and backed by a grant from the [Aragon Nest](https://github.com/aragon/nest) program. However, pando intends to become a public library and infrastructure developed by the whole web3 / ethereum community: feel free to fork, open PR and open issues :purple_heart:.

## Why Pando ?

[Pando](<https://en.wikipedia.org/wiki/Pando_(tree)>) (Latin for "spread out"), also known as the Trembling Giant is a clonal colony of a single male quaking aspen (Populus tremuloides) determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares (106 acres) and is estimated to weigh collectively 6,000,000 kilograms (6,600 short tons), making it the heaviest known organism. The root system of Pando, at an estimated 80,000 years old, is among the oldest known living organisms.

## Installation

pando.js **will** ship as a CommonJS package. However the library **has not been pushed to npm yet**.

### Install

```
npm install @wespr/pando.js --save
```

### Import

```javascript
import { Pando } from '@wespr/pando.js'
```

## Async

pando.js is a promise-based library. This means that whenever an asynchronous call is required, the library method will return a native Javascript promise. You can therefore choose between using promise or async/await syntax when calling our async methods.

## Constructor

The `Pando` class is the entry-point into the pando.js library. It allows you to create new and / or load existing local repositories and remote DAOs.

```typescript
new Pando(configuration: IConfiguration): Pando
```

Refactor Branch

Pando.create()
Pando.load(repositoryPath)

let repository = await pando.repository.create()
let repository = await pando.repository.load()

let remote = await pando.remote.deploy()
let remote = await pando.remote.at()

### Configuration

The configuration parameter passed to the constructor must look like this:

```typescript
interface IConfiguration {
  user: IUser
  ethereum: IEthereum
}
```

```typescript
interface IUser {
  account: string
}
```

```typescript
interface IEthereum {
  gateway?: string
  networkId?: string
}
```

### Example

```typescript
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

## Repositories

```typescript
let repository = await pando.repository.create(path?: string)
```

```typescript
let repository = await pando.repository.load(path?: string)
```

<!-- repository.stage(files: string[])

repository.history()

repository.status()

repository.stage()

repository.commit()

repository.dao.issues.new(opts)

repository.dao.issues.list(opts)

-->
