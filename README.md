# pando

<!-- ![banner]() -->

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A distributed VCS based on IPFS, Ethereum and AragonOS

Pando is a distributed cooperation and versioning system built on top of IPFS, AragonOS and the Ethereum blockchain. Its goal is to become a de facto standard. Pando’s specification and implementation are thus intended to be open-source and community-driven.

One way to understand what pando is to think about it as a distributed version of a traditional versioning system like git. Another one is to think about it as a tool to track and govern the evolution of contents the same way an ecosystem works. A last one is to think about pando as a universal infrastructure to cooperatively create, link and archive contents: software, writing, music, video, etc. 


## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

This software is in a **very** alpha stage and is not meant to be used in production yet.

### Who are we ?

Pando is currently developed by the ryhope network and [wespr](http://www.wespr.co) teams.


Its development is backed by a grant from the [Aragon Nest](https://github.com/aragon/nest) program. However, pando intends to become a public library and infrastructure developed by the whole web3 / ethereum community: feel free to open issues, fork and open PR.

### Why pando ?

[Pando](https://en.wikipedia.org/wiki/Pando_(tree)) (Latin for "spread out") is a clonal colony of a single male quaking aspen determined to be a single living organism by identical genetic markers and assumed to have one massive underground root system. The plant occupies 43 hectares and is estimated to weigh collectively 6.000.000 kilograms, making it the heaviest known organism. The root system of Pando, at an estimated 80.000 years old, is among the oldest known living organisms.


## Install

```zsh
npm install -g @ryhope/pando
```

## Usage

```
~ ❯❯❯ pando --help

pando <command>

Commands:
  pando configure            Configure pando                   [aliases: config]
  pando initialize           Initialize repository               [aliases: init]
  pando stage <files...>     Stage modifications                  [aliases: add]
  pando snapshot             Snapshot modifications            [aliases: commit]
  pando branch <subcommand>  Handle branches

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
```

## Maintainers

[@osarrouy](https://github.com/osarrouy)

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2018 Ryhope Network
