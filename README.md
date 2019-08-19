# Facia Tool [![Build Status](https://travis-ci.org/guardian/facia-tool.svg?branch=master)](https://travis-ci.org/guardian/facia-tool)

The Guardian front pages editor.

[![Build Status](https://travis-ci.org/guardian/facia-tool.svg?branch=master)](https://travis-ci.org/guardian/facia-tool)

## Client V2

Fronts Client V2 is in Active Development. You'll find it over at [client-v2](/client-v2).

# New developers quick-start

1. [Application dependencies](#application-dependencies)
1. [Clone repository](#clone-repository)
1. [Local test server](#local-test-server)
1. [Code Dependencies](#code-dependencies)
1. [Run the App](#run-the-app)
1. [Unit tests](#unit-tests)

### Application dependencies

Install each of the things listed:

#### NVM

We use [NVM](https://github.com/creationix/nvm) to ensure a given Node version is used and project setup scripts run correctly.

Ubuntu/Mac: [Follow these instructions](https://github.com/nvm-sh/nvm#installation-and-update)

#### Dev Setup (need to be done once)

1. Get credentials from [Janus](https://janus.gutools.co.uk/multi-credentials?&permissionIds=cmsFronts-dev,capi-api-gateway,frontend-dev).
2. From the project root, run `./scripts/setup.sh`.

#### Dev Start

1a. From the project root, run `./scripts/start-dev.sh`.
1b. From the project root, run without debug `./script/start-dev.sh --no-debug`.
2. Open `https://fronts.local.dev-gutools.co.uk`.

#### Running postgres

To start local postgres:
- Make sure you have `docker` installed and `docker-compose`.
- Run `docker-compose up` in the root of this repository
- When you run the Play application it will seed the database with using Play's inbuilt database evolutions.

If you wish to delete everything in the database you can use `docker-compose down -v` which will delete the container's persistent volumes.

If you wish to connect to the local database you can run `./scripts/local-psql.sh` which has the user, database and password preconfigured and ready to go.

#### Postgres Master Passwords

If you need the master passwords for the production postgres instances they are stored as SSM parameters and can be found at:

CODE: `facia-tool/cms-fronts/CODE/db/password`
PROD: `facia-tool/cms-fronts/PROD/db/password`

To fetch these can be fetched using the aws cli like so:

`aws ssm get-parameter --name /facia-tool/cms-fronts/CODE/db/password --with-decryption --profile cmsFronts --region eu-west-1`

### Clone repository

1. [Generate and add an SSH key](https://help.github.com/articles/generating-ssh-keys) to your GitHub account.
1. Check out the repository:

    ```bash
    git clone git@github.com:guardian/facia-tool.git
    cd facia-tool
    ```

### Local test server
Install `dev-nginx` and configure a new virtual host:

```bash
brew install guardian/devtools/dev-nginx
dev-nginx setup-app nginx/nginx-mapping.yml
```

#### Config Files

To get the config files run `./scripts/fetch-config.sh`. This requires CMS front credentials which you get from [janus](https://janus.gutools.co.uk)

### Credentials

You need the following credentials:

-   cmsFronts - developer
-   capi - API Gateway invocation
-   frontend - AWS console access
    You can get keys temporary keys from `janus`. You can copy these credentials manually from `janus`

You can also get credentials for _facia-tool_ by using [feria](https://github.com/guardian/feria):

```
$ feria cmsFronts && feria --access sqs-consumer frontend
```

(You should first checkout the repository and follow the install instructions for [_feria_](https://github.com/guardian/feria).)

You can run the fronts tool without frontend credentials, but you will not be able to check how your changes to fronts appear on frontend without
these credentials. You will need to test your changes on `CODE` to see these changes.

You will also need to be a member of the Editorial Tools Google Group in order to authenticate.

### Code Dependencies

Ensure you are using the correct `node` version:

```
nvm install
nvm use
```

Fronts v1 uses JSPM to build the frontend, which requires a GitHub access token. Go to GitHub Settings -> Applications and [generate new token](https://github.com/settings/tokens/new). Ensure only the public_repo scope is checked.

If you have previously installed `jspm` globally using `sudo`, you may need to clear your `~/.jspm` folder to avoid errors when running locally.

```
npm run jspm config registries.github.auth ${GITHUB_AUTH_SECRET}
npm run jspm registry export github
```

Inside the project

```bash
npm install
npm run jspm install
```

### Run the App

```bash
sbt
```

Wait for SBT to be up and running. This may take a while the first time, you'll know it's done when you get a prompt.

If it is your first time, compile the project.

```
compile
```

Ensure that you are running to correct version of node (4.1 or higher).
You can get this by running `nvm use`

Run the project locally by typing

```
run
```

This also can take a while the first time.

Now check that you are up and running by hitting the following URL

[https://fronts.local.dev-gutools.co.uk](https://fronts.local.dev-gutools.co.uk)

### Unit tests

Running server side tests:

```
sbt test
```

Unit tests on the client are run with `grunt`, `karma` and `jasmine`.

Grunt must be installed globally (within the version of node used by nvm).

```
nvm use
npm install -g grunt-cli
```

```bash
grunt test
```

Runs the tests once in PhantomJS and exits with an error if tests fails

```bash
grunt test --no-single-run
```

Runs the tests on the browserm, starts `karma` in debug mode. You can connect your browser at [http://localhost:9876?debug.html](http://localhost:9876?debug.html)

You can run a single test going to [http://localhost:9876/debug.html?test=collections](http://localhost:9876/debug.html?test=collections), spec files are inside `facia-tool/test/public/spec`.

You need to have version 4.1 or higher of node installed to be able to run the tests

### Linting

Fronts tool uses `eslint` to ensure consistent style. Run `eslint` with

```bash
grunt eslint
```

More detailed instructions of how to develop fronts tool available [here](./GUIDE_TO_FRONTS.md)
Enjoy!

### Get Fronts Editors

There is a script to get a list of the fronts editors in the `get-editors-script`. See the [script README](./get-editors-script/README.md) for more details.
