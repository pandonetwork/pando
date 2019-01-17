## Pando contribution guide

Thank you for your interest in contributing to pando! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

### How to contribute

If you'd like to contribute to pando, please fork the repo, fix, commit and send a pull request against the `development` branch for the maintainers to review and merge into the main code base. Please make sure your contributions adhere to our coding guidelines:

- Pull requests adding features or refactoring should be opened against the `development` branch
- Pull requests fixing bugs in the latest release version should be opened again the `master` branch
- Write [good commit messages](https://chris.beams.io/posts/git-commit/)

### Code quality

Please follow the existing code standards and conventions. `tslint` and `prettier` (described below) will help you.

If you're adding functionality, please also add tests and make sure they pass.

If you're adding a new public function/member, make sure you document it with Java doc-style comments. We use typedoc to generate documentation from the comments within our source code.

### Styleguide

We use [Prettier](https://prettier.io/), [TSLint](https://palantir.github.io/tslint/) and [ESLint](https://eslint.org) with recommended configs to keep our code style consistent.

Be sure to either add a [text editor integration](https://prettier.io/docs/en/editors.html) or a [pre-commit hook](https://prettier.io/docs/en/precommit.html) to properly format your code changes.

To lint your code just run: `npm run lint`

### Branch structure & versioning

We use [semantic versioning](http://semver.org/), but before a package reaches v1.0.0 all breaking changes as well as new features will be minor version bumps.

We have two main branches: `master` and `development`.

`master` represents the most recent released (published on npm) version.

`development` represents the development state and is a default branch to which you will submit a PR. We use this structure so that we can push hotfixes to the currently released version without needing to publish all the changes made towards the next release. If a hotfix is implemented on `master`, it is back-ported to `development`.
