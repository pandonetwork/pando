<div align="center">
  <img align="center" src=".github/images/logo.png" height="300px" />
  <h1></h1>
</div>

pando is a remote protocol for `git` repositories enforcing [DAO-based](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) versioning, contribution tracking and governance. It is built on top of [IPFS](https://ipfs.io), [ethereum](https://ethereum.org) and [aragonOS](https://aragon.one/os).

This repository is a monorepo including all pando-related smart contracts, apps and CLI tools. Each public sub-package is independently published to NPM.

## Published Packages

| Package                                                 | Description                                |
| ------------------------------------------------------- | ------------------------------------------ |
| [`@pando/git-pando`](/packages/git-pando)               | Git extension for pando                    |
| [`@pando/git-remote-pando`](/packages/git-remote-pando) | git-remote-helper for pando                |
| [`@pando/pando-colony`](/packages/pando-colony)         | Aragon app implementing pando colonies     |
| [`@pando/pando-kit`](/packages/pando-kit)               | Aragon DAOKit for pando organizations      |
| [`@pando/pando-repository`](/packages/pando-repository) | Aragon app implementing pando repositories |

## Background

This software is still in beta stage and is not meant to be used in production yet. The testnet version is expected for Q2 2019. The mainnet version is expected for Q3 2019.

### Why pando ?

Pando [Latin for "spread out"] is a clonal colony of a single male quaking aspen determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares and is estimated to weigh collectively 6.000.000 kilograms, making it the heaviest known organism. The root system of Pando, at an estimated 80.000 years old, is among the oldest known living organisms.

## Installation

### Clone

```
git clone https://github.com/pandonetwork/pando.git && cd pando
```

### Install

```
npm run install:all
```

### Compile contracts

```
npm run compile:all
```

### Build CLIs

```
npm run build:all
```

### Link binaries

```
npm run link:all
```

### Spawn IPFS & devchain

In two different terminal windows, run:

```
aragon devchain
aragon ipfs
```

### Publish aragonPM packages

```
lerna run publish:devnet
```

## Usage

See the `git-pando` [README](packages/git-pando).

## Contribute

Feel free to fork, open issues and send pull requests.

## License

MIT © 2019 Pando Network
