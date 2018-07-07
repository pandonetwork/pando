<div align="center">
  <img align="center" src="https://github.com/wespr/pando/blob/master/visuals/logo-noname.png" height="300px" />
  <h1>pando cli</h1>
</div>

Pando is distributed [versioning control system](https://en.wikipedia.org/wiki/Version_control) enforcing [DAO-based](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) versioning, contribution tracking and governance. It is built on top of [IPFS](https://ipfs.io), [ethereum](https://ethereum.org) and [aragonOS](https://aragon.one/os).

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

### Initialization

#### `pando init`

```
$ pando init
```

Creates a new repository in the current working directory.

#### `pando config`

```
$ pando config [--global]
```

Configures pando either globally or locally. This command will allow you to choose for an ethereum node, an ethereum account and an IPFS node.

### Remotes

#### `pando remote deploy`

```
$ pando remote deploy <name>
```

Deploy an new aragonOS-based remote DAO named `name` in the current repository. This command also grants full administration rights over this DAO to the current user.

#### `pando remote add`

```
$ pando remote add <name> <address>
```

#### `pando remote show`

```
$ pando remote show <name>
```

#### `pando remote grant`

```
$ pando remote grant <name> <role> <address>
```

## Maintainers

[@osarrouy](https://github.com/osarrouy)

## Contribute

Feel free to fork, open issues and send pull requests. Read our [contribution guidelines](https://github.com/wespr/pando/blob/master/github/CONTRIBUTING.md).

## License

MIT © 2018 Ryhope Network
