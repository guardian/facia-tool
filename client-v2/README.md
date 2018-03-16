# Fronts V2

## Developing

To start developing with this first install the dependencies:

```bash
yarn install
```

Then run the dev server:

```bash
yarn dev-server
```

While we are developing slightly separate to the main app the dev server will be
useful but it may not be easy to integrate with the Play app. If this is the
case then in future we may need to just watch a normal webpack build:

```bash
yarn watch
```

## Testing

Tests are being run with Jest and can be run using:

```bash
yarn test
```

## Linting
For the time being we're being pretty aggressive regarding linting / style
(webpack will fail the build). If this proves to get in the way of people's
workflow then we can discuss / remove as needs be. To lint manually run:

```bash
yarn lint
```

And to fix any issues that are automatically resolvable by eslint run:

```bash
yarn lint-fix
```

## Flow
We are using flow for typing in Fronts V2. In order to install types for new
libraries added run:

```bash
yarn update-types
```

If you would like to overwrite types that are previously installed to newer
versions that have been updated in the project pass the `--overwrite` flag to
the above command.
