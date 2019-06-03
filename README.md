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

#### Git

Mac:

```bash
brew install git
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
```

#### [Homebrew](http://brew.sh/)

This is needed on Mac only:

```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### JDK 8

Ubuntu:

```bash
sudo apt-get install openjdk-8-jdk
```

Mac: Install from [Oracle web site](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

If you have more than one JDK version running, ensure you run JDK 8 by adding the below to `.bash_profile`:

```
export JAVA_HOME=`/usr/libexec/java_home -v 1.8
```

#### Node.JS with NVM

Installation with [NVM](https://github.com/creationix/nvm) is highly recommended to ensure correct Node version is used and project setup scripts run correctly.

Ubuntu/Mac:

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

Verify installation:

```bash
command -v nvm
```

Install Node.JS:

```bash
nvm install node
```

#### Node.JS without NVM

Ubuntu:

```bash
sudo apt-get install nodejs
sudo apt-get install npm
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

Mac:

```bash
brew install node
```

#### Grunt (build tool)

Ubuntu/Mac:

```bash
sudo npm -g install grunt-cli
```

#### JSPM (package management)

Ubuntu/Mac:

```bash
sudo npm -g install jspm
jspm registry config github
```

It'll ask for a GitHub access token. Go to GitHub Settings -> Applications and [generate new token](https://github.com/settings/tokens/new). Ensure only the public_repo scope is checked.

#### nginx

Mac:

```bash
brew install nginx
```

#### sbt

Mac:

```bash
brew install sbt
```

#### aws cli

You must have [Python](https://www.python.org/) installed on your system first.

```bash
brew install awscli
```

### Clone repository

1. [Generate and add an SSH key](https://help.github.com/articles/generating-ssh-keys) to your GitHub account.
1. Check out the repository:

    ```bash
    git clone git@github.com:guardian/facia-tool.git
    cd facia-tool
    ```

### Local test server

Clone and follows the instructions to set up [dev-nginx](https://github.com/guardian/dev-nginx) (private repo - request access). The steps to follow are 'Install SSL certificates' and 'Install config for an application'. The path for nginx mapping is `nginx/nginx-mapping.yml`.

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

Inside the project

```bash
npm install
jspm install
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
