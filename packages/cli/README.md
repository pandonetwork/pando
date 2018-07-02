<div align="center">
  <img align="center" src="https://github.com/wespr/pando/blob/master/visuals/logo.png" height="300px" />
  <h1>pando cli</h1>
</div>

Pando is distributed [versioning control system](https://en.wikipedia.org/wiki/Version_control) enforcing [DAO-based](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) versioning, contribution tracking and governance. It is built on top of [IPFS](https://ipfs.io), [ethereum](https://ethereum.org) and [aragonOS](https://aragon.on/ose).

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

This software is in a **very** alpha stage and is not meant to be used in production yet.

## Install

```zsh
npm install -g @pando/cli
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

Feel free to fork, open issues and send pull requests. Read our [contribution guidelines](https://github.com/wespr/pando/blob/master/github/CONTRIBUTING.md).

## License

MIT © 2018 Ryhope Network
