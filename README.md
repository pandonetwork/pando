<div align="center">
  <img align="center" src=".github/visuals/logo.png" height="300px" />
  <h1></h1>
</div>

Pando is distributed [versioning control system](https://en.wikipedia.org/wiki/Version_control) enforcing [DAO-based](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) versioning, contribution tracking and governance. It is built on top of [IPFS](https://ipfs.io), [ethereum](https://ethereum.org) and [aragonOS](https://aragon.one/os).

This repository is a monorepo including pando related smart contracts, libraries and tools. Each public sub-package is independently published to NPM.

## Published Packages

| Package                                                 | Description                                            |
| ------------------------------------------------------- | ------------------------------------------------------ |
| [`@pando/cli`](/packages/cli)                           | CLI tool                                               |
| [`@pando/core`](/packages/core)                         | Smart contracts interface and library                  |
| [`@pando/organism`](/packages/organism)                 | Aragon app for organisms [on-chain repositories]       |
| [`@pando/colony`](/packages/colony)                     | Aragon app for colonies [DAO-wide organism management] |
| [`@pando/factory`](/packages/factory)                   | Aragon DAOKit for pando DAOs                           |
| [`@pando/scheme-democracy`](/packages/scheme-democracy) | Governance scheme for pando DAOs                       |
| [`@pando/pando.js`](/packages/pando.js)                 | Typescript / javascript library                        |
| [`@pando/types`](/packages/types)                       | Typescript typings for pando                           |
| [`@pando/helpers`](/packages/helpers)                   | Smart contracts interface and library                  |

## Background

This software is still in alpha stage and is not meant to be used in production yet.

Pando's development is backed by a grant from the [Aragon Nest](https://github.com/aragon/nest) program. However, pando intends to become a public library and infrastructure developed by the whole web3 / ethereum community: feel free to fork, open issues and send pull requests.

### Why pando ?

Pando [Latin for "spread out"] is a clonal colony of a single male quaking aspen determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares and is estimated to weigh collectively 6.000.000 kilograms, making it the heaviest known organism. The root system of Pando, at an estimated 80.000 years old, is among the oldest known living organisms.

## Usage

### Clone the monorepo

```
git clone https://github.com/pandonetwork/pando.git
```

### Bootstrap the monorepo

```
cd pando
lerna bootstrap
```

### Launch devtools

In two different terminal windows:

```
aragon devchain
aragon ipfs
```

### Compile contracts and build libraries

```
lerna run compile
lerna run build
```

### Publish aragonPM packages locally

```
lerna run publish
```


### Run tests
```
lerna run test
```

## Contribute

Feel free to fork, open issues and send pull requests. Read our [contribution guidelines](.github/CONTRIBUTING.md).

## License

MIT © 2018 Pando Network
