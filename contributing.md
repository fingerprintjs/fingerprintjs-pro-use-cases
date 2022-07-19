# Contributing to Fingerprint Pro use cases

## Working with code

We prefer using [yarn](https://yarnpkg.com/) for installing dependencies and running scripts.

The `main` branch is locked for the push action. For proposing changes, use the standard [pull request approach](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). It's recommended to discuss fixes or new functionality in the Issues, first.

### How to build
Just run:
```shell
yarn build
```

### Code style

The code style is controlled by [ESLint](https://eslint.org/). Run to check that the code style is ok:
```shell
yarn lint
```

### How to publish

- Project is deployed to [fingerprinthub.com](https://fingerprinthub.com) with each merge into the `main` branch.
