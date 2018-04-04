# Fronts V2

## Developing

To start developing just run:

```bash
yarn dev
```

This will install all of the dependencies, boot up a dev server and, when this
is complete, will open a browser at `index.html`.

While we are developing separately to the main app the dev server will be
useful but it may not be easy to integrate with the Play app. If this is the
case then in future we may need to just watch a normal webpack build. This is
runnable with:

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

If you want to run flow to check for type errors, run `yarn flow`.
