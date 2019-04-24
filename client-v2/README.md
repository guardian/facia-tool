# Fronts V2

- [Fronts V2](#fronts-v2)
  * [Motivations](#motivations)
  * [Setup](#setup)
  * [Developing](#developing)
    + [Technologies](#technologies)
  * [Building and Compiling](#building-and-compiling)
  * [Testing](#testing)
  * [Linting](#linting)
  * [Typescript](#typescript)

> _Tip:_ Run `yarn markdown-toc README.md` to regenerate the TOC.

## Motivations

Fronts Client V2 looks to rebuild the Fronts tool with modern technologies, develop reusable patterns for content curation and build shareable components for across the tools.

## Setup

To setup the Fronts V2 project:

```bash
./scripts/setup.sh
```

View [setup.sh](scripts/setup.sh).

## Developing

To start developing, first get [Janus credentials](https://janus.gutools.co.uk/multi-credentials?&permissionIds=cmsFronts-dev,capi-api-gateway,frontend-dev) then run:

```bash
./scripts/client-dev.sh
```

The v2 application will be running here:
[https://fronts.local.dev-gutools.co.uk/v2](https://fronts.local.dev-gutools.co.uk/v2)

View [client-dev.sh](scripts/client-dev.sh).

If you wish to use git grep to search the code base you can use [fronts-find.sh](scripts/fronts-find.sh)

### Technologies

V2 is a ReactRedux Javascript application hooking into the existing Fronts API and CAPI.

You'll need to understand the concepts of Thunks and Selectors.

| Uses        | For         | Config |
| ------------|------------- |--- |
| [React](https://jestjs.io/docs/en/getting-started.html)      | Components ||
| [Redux](https://github.com/airbnb/enzyme)      | State management ||
| [Redux Thunk](https://github.com/reduxjs/redux-thunk)      | Redux Thunk middleware allows you to write action creators that return a function instead of an action.  ||
| [Reselect](https://github.com/reduxjs/reselect)      | Selectors can compute derived data, allowing Redux to store the minimal possible state.  ||
| [Redux Forms](https://redux-form.com/7.4.2/)      | Form state management for Redux apps ||
| [React Router](https://reacttraining.com/react-router/)      | Routing for React apps ||
| [Styled Components](https://www.styled-components.com/)      | Styling for components ||
| [Typescript](https://www.typescriptlang.org/)      | JS Types | [tsconfig](tsconfig.json), [tslint](tslint.json), [modules.d.ts](modules.d.ts), [global.d.ts](global.d.ts)|
| [Lodash](https://lodash.com/)      | JS helper utilities ||
| [Date Fns](https://date-fns.org/)      | JS Date functions ||
| [Raven](https://github.com/getsentry/sentry-javascript)      | Sentry error reporting ||
| [Panda Session](https://github.com/guardian/panda-session)      | Pan Domain (cross-gutools) session management ||

## Building and Compiling

| Uses        | For         |Config |
| ------------|------------- |---|
| [Yarn](https://yarnpkg.com/en/)      | Yarning | [package.json](package.json) |
| [Babel](https://babeljs.io/)      | Compile Typescript etc | [babel.config.json](babel.config.json) |
| [Webpack](https://webpack.js.org/)      | Bundle your assests | [webpack.config.common.js](config/webpack.config.common.js), [webpack.config.prod.js](config/webpack.config.prod.js), [webpack.config.dev.js](config/webpack.config.dev.js) |

## Testing

| Uses        | For         | Config |
| ------------|------------- |--- |
| [Jest](https://jestjs.io/docs/en/getting-started.html)      | Testing library | [jest.config.js](jest.config.js)|
| [Enzyme](https://github.com/airbnb/enzyme)      | JavaScript Testing utilities for React  ||
| [react-testing-library](https://github.com/kentcdodds/react-testing-library)     | JavaScript Testing utilities for React Components |
| [React Test Renderer](https://reactjs.org/docs/test-renderer.html)      | Render Components to JSON (e.g for Jest Snapshotting) ||
| [Test Cafe](https://testcafe.devexpress.com/)      | Integration testing - see below ||

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

| Uses        | For         | Config |
| ------------|------------- |--- |
| [Prettier](https://github.com/prettier/prettier)      | Anti-bikeshed Auto syntax formatting | [.prettierrc](.prettierrc)|
| [.editorconfig](https://editorconfig.org/)      | Standard Editor formatting  |[.editorconfig](.editorconfig)|
| [TSLint](https://palantir.github.io/tslint/)      | Typescript Linting | [tslint](tslint.json)|

## Typescript
We are using Typescript for typing in Fronts V2.

## File Structure

- Components, Actions, Reducers and Selectors are top level.
    - The [App component](src/components/App.tsx) is the application entry point
    - All reducers are combined in the [Root Reducer](src/reducers/rootReducer.ts) as per standard convention
- `bundles`
    - A bundle exports a reducer and all of the related things a reducer needs to function in an app - selectors, actions and action names. It's a bit like an index.ts for a single redux module. This is especially useful when you're generating the actions, reducer and selectors rather than writing them manually, for example with the `createAsyncResourceBundle` utility in shared/util.
- `constants` store high-level application constants such as theme styles and image paths
- `services` contains the modules for requests to APIs such as CAPI and FaciaAPI
- `lib` contains modules designed to be reusable such as the Drag N' Drop (dnd) module
- `shared` is a library written using React and Redux and Typescript for typing designed to make it easier to develop tools which need to provide the ability to curate collections of content. [Read more.](src/shared/.README)
- `types` at the top level contains types that have no obvious home: e.g. Action which is a union of things that are split across a few files.
- `types` and `__tests__` are co-located with their modules at the folder level

## Tech debt

There are a few areas that we'd like to address in the medium to long term for the purposes of reliability and maintainability.

### Persistent UUIDs

At the moment, we create UUIDs for groups and article fragments at any level within a collection at the moment it's ingested by the client. This lets us reference them with confidence -- until the next reingestion! As soon as an update from the server is applied, we need create new UUIDs for the new data, and any client-side state that referred to the updated data loses its reference.

For example, the article meta form references an article by its UUID. At the moment, if anything in the article's parent collection changes, our polling logic replaces the entire collection, along with a new set of UUIDs for its child articles. As a result, the form is now pointing to an article fragment that no longer exists, and becomes read only, limiting the ability of users to concurrently edit different articles in the same collection.

One strategy to add UUIDS: add UUIDs to the server model where necessary as optional fields, and alter the client to ensure that UUIDs aren't added if they already exist. Then, run a script to add UUIDs across all collections where they don't exist, updating last edit times to ensure client polling picks up the change. It's possible that users might be holding on to old models in open instances of the client application, so we could consider running this script at a time when it's unlikely many users are using the tool.

### Reading our own writes

We don't currently read our writes back from the server when we save collections. This can mean that users are unaware of bugs until they preview launched changes, receive polling updates, or refresh the page, because the client model differs from the server model. It would be great to read the canonical version of the collection from the response of edit calls to ensure odd behaviour surfaces immediately. Implementing this would depend on 'Persistent UUIDs' above.

### Collection Persistence

At the moment, it is possible, although unlikely, for collection updates to go missing. This scenario is made more likely because in V2 we update entire collections in one go, regardless of the changes that are made to them:

1. User makes Edit A to a collection, e.g. a move operation, and a POST request is sent to the server
2. User makes Edit B to a collection, e.g. a change to article metadata, and a POST request is sent to the server
3. Edit B reaches the server before Edit A, and Edit A replaces Edit B. Edit B is now lost.

We already handle all of our persistence calls for collections in one place -- the persistCollection redux middleware. One solution would be to chain and debounce persistence calls. This would

- Ensure that the latest changes to collections are always persisted for a single client
- Keep the number of calls to the server low, especially important if we're chaining calls

