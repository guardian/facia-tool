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

View [setup.sh](scripts/setup.sh).

## Developing

To start developing just run:

```bash
./scripts/client-dev.sh
```

The v2 application will be running here:
[https://fronts.local.dev-gutools.co.uk/v2](https://fronts.local.dev-gutools.co.uk/v2)

View [client-dev.sh](scripts/client-dev.sh).

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

## File Structure

```
src
├── actions
├── bundles
├── components
│   ├── CAPI
│   ├── FrontsCAPIInterface
│   ├── FrontsEdit
│   ├── clipboard
│   ├── inputs
│   ├── layout
│   └── util
├── constants
├── containers
├── fixtures
├── fonts
│   ├── headline
│   └── text
├── images
│   └── icons
├── lib
│   └── dnd
├── reducers
├── selectors
├── services
├── shared
│   ├── actions
│   ├── bundles
│   ├── components
│   ├── constants
│   ├── fixtures
│   ├── images
│   ├── reducers
│   ├── selectors
│   ├── types
│   └── util
├── types
└── util
    └── sharedStyles
```

- Components, Actions, Reducers and Selectors are top level.
    - The [App component](src/components/App.tsx) is the application entry point
    - All reducers are combined in the [Root Reducer](src/reducers/rootReducer.ts) as per standard convention
- `bundles` **what is the concept of a bundle?**
- `constants` store high-level application constants such as theme styles and image paths
- `services` contains the modules for requests to APIs such as CAPI and FaciaAPI
- `lib` contains modules designed to be reusable such as the Drag N' Drop (dnd) module
- `shared` **contains ??**
- `types` at the top level store types for ??
- `types` and `__tests__` are co-located with their modules at the folder level 

