# Fronts V2

- [Fronts V2](#fronts-v2)
  * [Setup](#setup)
  * [Developing](#developing)
    + [Technologies](#technologies)
  * [Building](#building)
  * [Testing](#testing)
  * [Linting](#linting)

> _Tip:_ Run `yarn markdown-toc README.md` to regenerate the TOC.

## Motivations

Fronts Client V2 looks to rebuild the Fronts tool with modern technologies, develop reusable patterns for content curation and build shareable components for across the tools.

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

### Technologies

V2 is a ReactRedux Javascript application hooking into the existing Fronts API and CAPI.

| Uses        | For         | Config |
| ------------|------------- |--- |
| [React](https://jestjs.io/docs/en/getting-started.html)      | Components ||
| [Redux](https://github.com/airbnb/enzyme)      | State management ||
| [Redux Thunk](https://github.com/reduxjs/redux-thunk)      | Redux Thunk middleware allows you to write action creators that return a function instead of an action.  ||
| [Redux Forms](https://redux-form.com/7.4.2/)      | Form state management for Redux apps ||
| [React Router](https://reacttraining.com/react-router/)      | Routing for React apps ||
| [Styled Components](https://www.styled-components.com/)      | Styling for components ||
| [Typescript](https://www.typescriptlang.org/)      | JS Types | [tsconfig](tsconfig.json), [tslint](tslint.json), [modules.d.ts](modules.d.ts), [global.d.ts](global.d.ts)|
| [Lodash](https://lodash.com/)      | JS helper utilities ||
| [Date Fns](https://date-fns.org/)      | JS Date functions ||
| [Raven](https://github.com/getsentry/sentry-javascript)      | Sentry error reporting ||
| [Panda Session](https://github.com/guardian/panda-session)      | Pan Domain (cross-gutools) session management ||

## Building



| Uses        | For         |Config |
| ------------|------------- |---|
| [Yarn]()      | Yarning | [package.json](package.json) |
| [Babel]()      | Compile Typescript etc | [babel.config.json](babel.config.json) |

## Testing

Tests are being run with Jest and can be run using:

```bash
yarn test
```

| Uses        | For         | Config |
| ------------|------------- |--- |
| [Jest](https://jestjs.io/docs/en/getting-started.html)      | Testing library | [jest.config.js](jest.config.js)|
| [Enzyme](https://github.com/airbnb/enzyme)      | JavaScript Testing utilities for React  ||
| [React Test Renderer](https://reactjs.org/docs/test-renderer.html)      | Render Components to JSON (e.g for Jest Snapshotting) ||

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
