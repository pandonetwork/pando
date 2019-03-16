# git-pando

git extension for pando

## Install

```bash
npm install -g @pando/git-remote-pando @pando/git-pando
```


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

0. If you want to test `pando` first make sure you have an `aragon devchain` and `ipfs` running.

```bash
aragon devchain& && ipfs daemon&
```

1. Configure pando.

```bash
git pando config
```

2. Deploy an pando-ready Aragon DAO

```bash
git pando dao deploy
```

3. Copy the address of this DAO and deploy a repository into it.

```bash
git pando repository deploy <name> --dao <address>
```

4. Copy the address of this repository and add it as a remote in your git repo.

```bash
git remote add origin pando://<address>
```

5. You can then use git as you're used to.

