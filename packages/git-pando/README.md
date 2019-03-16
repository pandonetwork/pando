# git-pando

git extension for pando

## Install

```bash
npm install -g @pando/git-remote-pando @pando/git-pando
```

## Deploy a test environment

See the pando [README](../..) to see how to deploy a test environment. 


## Usage

```bash
git pando
```

```bash
pando <command>

Commands:
  git pando configure                   Configure pando                [aliases: config]
  git pando organization <subcommand>   Manage pando organizations     [aliases: dao]
  git pando repository <subcommand>     Manage pando repositories      [aliases: repo]

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]

```

## Examples

### Configure pando.

```bash
git pando config
```

### Deploy a pando-ready Aragon DAO

```bash
git pando dao deploy
```

### Copy the address of this DAO and deploy a repository

```bash
git pando repository deploy <name> --dao <address>
```

### Copy the address of this repository and add it as a remote in your git repo

```bash
git remote add origin pando://<address>
```

### You can then use git as you're used to!

