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

We are also running integration tests based around [TestCafe](http://devexpress.github.io/testcafe/).

```bash
yarn test-integration [--dev]
```

Our integration tests are client side only, so in order to handle the API calls we set up a small [express](https://expressjs.com/) server that returns fixtures for the various endpoints.

They run on `chromium`, which has been added to our `node_modules` so the tests can be run anywhere, including CI, without any extra dependencies being required. By default the tests will run in `headless` mode, i.e. you won't see the browser running. If you want to see the tests running locally you can pass the `--dev` flag and a chromium browser will appear to inspect. If you need to debug anything then TestCafe provides [ways to do this](http://devexpress.github.io/testcafe/documentation/test-api/debugging.html), primarily `t.debug()` will keep the browser open to inspect the state at a certain point.

Additionally you can use `node ./integration/server/run-server.js` to launch the integration server outside of the tests to have a click around and check things manually.

If you want to select anything in the page for integration tests it is encouraged to add `data-testid="some-id"` to DOM nodes that the tests need a handle to. There is a helper method - `select` - that uses this `data-testid`, avoiding CSS selecting, which is flakier, more susceptible to change and also harder with `styled-components`.

Calling the helper like `select('clipboard', 'drop-zone')` will create a TestCafe `selector` equivalent to `[data-testid="clipboard"] [data-testid="drop-zone"]` allowing you to select, say, drop zones under the clipboard.

It's also encouraged to abstract these selectors (and their strings) into one place where possible so that they are easier to refactor if they need to change in future.

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
