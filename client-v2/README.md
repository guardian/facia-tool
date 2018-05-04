# Fronts V2

## Setup

To setup the Fronts V2 project:

```bash
./scripts/setup.sh
```

## Developing

To start developing just run:

```bash
./scripts/client-dev.sh
```

The v2 application will be running here:
[https://fronts.local.dev-gutools.co.uk/v2](https://fronts.local.dev-gutools.co.uk/v2)

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

If you want to run flow to check for type errors, run `yarn flow`.

To check for flow coverage, run `yarn flow-coverage`.

If the flow coverage command hangs and does not finish, try killing any running flow processes.
