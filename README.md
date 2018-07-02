<div align="center">
  <img align="center" src="visuals/logo.png" height="300px" />
  <h1></h1>
 </div>

Pando is distributed [versioning control system](https://en.wikipedia.org/wiki/Version_control) enforcing [DAO-based](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) versioning, contribution tracking and governance. It is built on top of [IPFS](https://ipfs.io), [ethereum](https://ethereum.org) and [aragonOS](https://aragon.on/ose).

This repository is a monorepo including pando related smart contracts, libraries and tools. Each public sub-package is independently published to NPM.

### Published Packages

| Package                                           | Description                           |
| ------------------------------------------------- | ------------------------------------- |
| [`@pando/cli`](/packages/cli)                     | Pando CLI tool                        |
| [`@pando/pando.js`](/packages/pando.js)           | Pando typescript / javascript library |
| [`@pando/core`](/packages/core)                   | Pando solidity smart contracts        |
| [`@pando/js-ipld-pando`](/packages/js-ipld-pando) | Pando javascript IPLD resolver        |

## Background

This software is in a **very** alpha stage and is not meant to be used in production yet.

### Who are we ?

Pando is currently developed by the [ryhope network](https://www.ryhope.network) team. Its development is backed by a grant from the [Aragon Nest](https://github.com/aragon/nest) program. However, pando intends to become a public library and infrastructure developed by the whole web3 / ethereum community: feel free to fork, open issues and send pull requests.

### Why pando ?

[Pando](<https://en.wikipedia.org/wiki/Pando_(tree)>) (Latin for "spread out") is a clonal colony of a single male quaking aspen determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares and is estimated to weigh collectively 6.000.000 kilograms, making it the heaviest known organism. The root system of Pando, at an estimated 80.000 years old, is among the oldest known living organisms.

## Usage

Dedicated documentation pages:

- [CLI](/packages/cli)
- [Library](/packages/pando.js)
- [Smart contracts](/packages/core)
- [IPLD resolver](/packages/js-ipld-pando)

## Contribute

Feel free to fork, open issues and send pull requests. Read our [contribution guidelines](/github/CONTRIBUTING.md).

## License

MIT © 2018 Ryhope Network
