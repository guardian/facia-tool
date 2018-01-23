Facia Tool [![Build Status](https://travis-ci.org/guardian/facia-tool.svg?branch=master)](https://travis-ci.org/guardian/facia-tool)
==========
The Guardian front pages editor.

[![Build Status](https://travis-ci.org/guardian/facia-tool.svg?branch=master)](https://travis-ci.org/guardian/facia-tool)

New developers quick-start
===========================

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

#### Node.JS

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

#### NVM
Optional: Install nvm to manage your node versions

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
```bash
pip install awscli
```



### Clone repository
1. [Generate and add an SSH key](https://help.github.com/articles/generating-ssh-keys) to your GitHub account.
1. Check out the repository:

    ```bash
    git clone git@github.com:guardian/facia-tool.git
    cd facia-tool
    ```



### Local test server

Clone and follows the instructions to set up [dev-nginx](https://github.com/guardian/dev-nginx). The steps to follow are 'Install SSL certificates' and 'Install config for an application'. The path for nginx mapping is `nginx/nginx-mapping.yml`.

Modify the files

* `/usr/local/etc/nginx/nginx.conf` and add this line at the bottom, inside the main block

   > include sites-enabled/*.conf;

* `/usr/local/etc/nginx/sites-enabled/fronts.conf` and add this line inside the `server` block

   > merge_slashes off;

Run `sudo nginx -s reload` to restart nginx with the new configuration.


#### Config Files

To get the config files run `./fetch-config.sh`. This requires CMS front credentials which you get from [janus](https://janus.gutools.co.uk)

### Credentials

You need the following credentials:
- cmsFronts - developer
- workflow - S3 Read
- capi - API Gateway invocation
You can get keys temporary keys from `janus`. You can copy these credentials manually from `janus`

You can also get credentials for *facia-tool* by using feria:

```
$ feria cmsFronts && feria --access s3-read workflow && feria --access sqs-consumer frontend
```
(You should first checkout the repository and follow the install instructions for *feria*.)


You can run the fronts tool without frontend credentials, but you will not be able to check how your changes to fronts appear on frontend without
these credentials. You will need to test your changes on `CODE` to see these changes.

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
