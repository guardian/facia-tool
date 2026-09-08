# Facia Tool

The Guardian front pages editor, known as the Fronts tool.

For information on core Fronts concepts, see the [glossary](./docs/Glossary.md).

## Fronts Client

You can find the client for the Fronts tool in [fronts-client](./fronts-client).

This project is now set up to use Dev Containers, a safer system in these days of rampant supply chain attacks.

### Before you begin

Get credentials from [Janus](https://janus.gutools.co.uk/credentials?permissionId=cmsFronts-iam-facia-CODE-RunFaciaToolLocally-nL42h4zEgHhf).
You need the CMS Fronts "RunFaciaToolLocally" permission set - contact F&C if you don't have
access to this.

### On your host system

1. Make sure you have dev-nginx and Docker Desktop installed (should be done when you first set your laptop up)
2. Set up Fronts tool:

```bash
dev-nginx setup-app nginx/nginx-mapping.yml
```

This will allow you to access your locally running copy via https://fronts.local.dev-gutools.co.uk

### In your editor [VSCode]

1. Open the repository
2. Go to the command palette - the box in the middle at the top of the window
3. Type `> re` to open the commands and filter the menu. Select `Dev containers: Reopen in dev container`
4. Wait a while as it builds. Open the logs if you're feeling bored :)

### In your editor [Intellij]

TBD

### App setup

1. Open a terminal in your editor
2. You should have the `aws` command, the `sbt` command, the java JDK commands, Node etc. You should also have `psql`, `pg_dump` etc.
3. Get credentials from [Janus](https://janus.gutools.co.uk/credentials?permissionId=cmsFronts-iam-facia-CODE-RunFaciaToolLocally-nL42h4zEgHhf). Paste them into the terminal.  This is very important as they are needed to fetch the config files for initial setup
4. Run:

```bash
./scripts/setup.sh
```

5. When this completes, you should be set up. Check that there are two config files in `/etc/gu`.
6. Run

```bash
./scripts/dev-start.sh
```

or 

```bash
./scripts/dev-start.sh --no-debug
```

7. In your browser, go to https://fronts.local.dev-gutools.co.uk

>! [NOTE]
> The logs you see in the terminal are JSON formatted and therefore quite illegible.
> If you open another terminal and run `tail -f logs/frontend-facia-tool.log` you get a more
> readable version of the same data

>! [NOTE]
> You can use localstack for S3 by running `./scripts/setup-local-s3.sh` to create a bucket and populate
> it with the current state of the CODE fronts.

## Troubleshooting

If your browser is timing out when accessing fronts.local.dev-gutools.co.uk, try running

```bash
curl http://localhost:9000
```

in your editor terminal (dev container).  If this works, but the same command doesn't work (or
gives a different output) when run on your host sytem, then it's likely that something else has
port 9000 open on the host system.  Docker forwards ports on startup.  The simplest way to fix this
is to shut down _all_ dev containers you have running (don't delete, just shut down) then just start
this one up again.

### Unit tests

### Server side tests
- Run: `sbt test`

#### Client side tests for V1
- Running client side tests: `npm run test` in project root
  - `npm run test:browser` runs the tests in the browser, starts `karma` in debug mode. You can connect your browser at [http://localhost:9876?debug.html](http://localhost:9876?debug.html)
  - You can run a single test going to [http://localhost:9876/debug.html?test=collections](http://localhost:9876/debug.html?test=collections), spec files are inside `facia-tool/test/public/spec`.

#### Client side tests for V2
Run `yarn test` in `fronts-client` folder. See [fronts-client](/fronts-client) for more details.

### IT tests with Database

`sbt test database-int:test`

### Pressing fronts
- Before fronts can appear on site, they have to be pressed by Facia-Press which lives on the frontend account.
- The fronts tool sends events to an SNS topic, which is subscribed to by a queue (in frontend account) to which Facia-Press listens. You can read more about Facia-Press [here](https://github.com/guardian/frontend/blob/ad74a1da567f047b7b824650e6e1be0f0262952b/docs/02-architecture/01-applications-architecture.md).

- If you are adding a new kind of content to a front or changing the front configuration, you should check that the front can still be pressed.

- To check this, check that a piece of content still appears on frontend. Edit the articles appearing on a front, launch the front and check that your changes are appearing here: `http://m.code.dev-theguardian.com/{name-of-front}`

- If the front that you are trying to view cannot be found, it is probably because the front is hidden.
- You can remove this property from the front in the fronts config page.
- Select the front your are trying to view on the config page, click on the edit-metadata link, and deselect the `is hidden`-property.

- Since the SNS topic lives in the fronts account, CODE fronts should be pressed automatically when running locally.
-
## Different tools in this codebase

### The Fronts Tool
The most important part of this app is the Fronts Tool, used to curate the web and app front pages of the Guardian. Additionally it is used to manually curate emails.

In the UI, users can move stories from the Content API feed into different front pages or emails. These fronts can then be launched or published.

The Fronts Tool uses the most up-to-date front end, a React-Redux app located in [fronts-client](https://github.com/guardian/facia-tool/tree/master/fronts-client)

Useful things to know:
* An api call to Ophan pulls in page view data to allow users to understand at a glance that story's performance in the context of the front it is in

* Containers can be shared between fronts. An update to a container in one place updates it everywhere

* Certain containers have geolocation properties. This means they can only be seen by users in the location specified

* Interactive atoms can be pasted into a front as CAPI links. This allows designers and the interactives team to create special content eg banners showing election results. Apart from articles, interactive atoms are the only other type of CAPI content allowed on Fronts

* In the Email editor only - free text boxes can be created. This allows email editors to add introductions to their emails by hijacking the headline field. Rich text editing is enabled for this using Prosemirror.


### The Editions creator

The Editions creator is used to curate content on both the Editions app (currently known as The Daily on iOS and Android),
and the Feast recipes app.
Editions creator also uses the fronts-client front end, and can be accessed from the Manage Editions menu on the [homepage](https://fronts.code.dev-gutools.co.uk/v2).

Curation works in the same way as the main fronts tool. But there are these differences:

* Fronts are part of Issues (normally one issue per day). You need to create or open a valid issue to make changes

* Editions are published once instead of being continually updated and launched

* The publication process for Editions is different to the main fronts. We push the json we produce to a lambda - the [backend of the Editions app](https://github.com/guardian/editions), and this combines fronts data with CAPI calls etc to produce the Edition.

For the specific, technical, definitions of the terms `Edition`, `CuratedPlatform` etc. please
refer to the [Glossary](docs/Glossary.md).

For more information about how specific Editions are built from Templates, see the technical
docs at [docs/EditionsTemplating.md](docs/EditionsTemplating.md)

Full [Editions codebase and documentation here](https://github.com/guardian/editions).

### The Config Tool

Fronts and collections are configured in the config tool. This allows for the name, geolocation and visual properties of collections to be set. The types and order of collections in a Front is set here too. This tool uses the "old" front end client. Each "type of fronts" has its own config url eg: https://fronts.gutools.co.uk/email/config


### The Breaking News Tool

This enables breaking news notifications to be sent to app users who have signed up. This tool also uses the "old" front end client. You need permission from Central Production to access this tool in PROD.  https://fronts.gutools.co.uk/breaking-news

In CODE the breaking news tool sends notifications to the "debug version" of the Android/iOS App.

Breaking News is represented by a front called `breaking-news` which is considered to be a special case. It has a `Send Alert` button rather than a `Launch` button. Only one thing can be added to a collection at a given time. You cannot send the same alert twice, and snap links cannot be added / alerted on. Different collections represent different audience groups (eg by location or by subscription to different topics.) To add a new one, just create a container. New breaking news containers need to have the layout `breaking-news/not-for-other-fronts`.

## Client-side vulnerabilities: Synk and JSPM

The older client side tools (those with source code at /public/src - not the [Fronts-tool](#the-fronts-tool)) are bundled using [JSPM](https://jspm.org/). Instead of dependencies for the application being listed in the package.json file in the normal way, they are listed under "jspm" and compiled by JSPM using an import map.

A side effect of this is that the vulnerabilities are not surfaced by Synk. To address this, there is a workaround to construct a "regular" package.json file out real one, and a custom action so that Synk can report on vulnerabilities (see [PR#1521](https://github.com/guardian/facia-tool/pull/1521)).

To audit vulernabilities locally:
 - `cd v1_jsmp_synk_workaround`
 - `npm run preinstall` - generates the package.json file in the gitignored '/result' subfolder
 - `npm run audit` - generates a lockfile in '/result' and runs the npm audit command - note you can append parameters for pn audit - eg `npm run audit --production > ./result/audit.txt`

## Troubleshooting
### Postgres
- If you wish to delete everything in the database you can use `docker compose down -v` which will delete the container's persistent volumes.
- If you wish to connect to the local database you can run `./scripts/local-psql.sh` which has the user, database and password preconfigured and ready to go.
- If you need the master passwords for the production postgres instances they are stored as SSM parameters and can be found at:
  - CODE: `facia-tool/cms-fronts/CODE/db/password`
  - PROD: `facia-tool/cms-fronts/PROD/db/password`
  To fetch these can be fetched using the aws cli like so:

  `aws ssm get-parameter --name /facia-tool/cms-fronts/CODE/db/password --with-decryption --profile cmsFronts --region eu-west-1`

### Linting

#### Eslint

Fronts tool uses `eslint` to ensure consistent style. Run `eslint` with

```bash
grunt eslint
```

More detailed instructions of how to develop fronts tool available [here](./GUIDE_TO_FRONTS.md)

#### Scalafmt

This project uses [scalafmt](https://scalameta.org/scalafmt/) to format Scala code: the formatter is run in CI, and will fail if any files need formatting. There is also a pre-commit hook in [./git-hooks/pre-commit](./git-hooks/pre-commit) which runs scalafmt and fails if files need formatting, letting you catch them before pushing to CI. This can be enabled by setting the git config option core.hooksPath to `git-hooks` for this repository (or by running [./scripts/git-config.sh](./scripts/git-config.sh), which does it for you.)

For the best experience, we recommend configuring your text editor to run scalafmt, as described in [the scalafmt docs](https://scalameta.org/scalafmt/docs/installation.html).

## Get Fronts Editors

There is a script to get a list of the fronts editors in the `get-editors-script`. See the [script README](./scripts/get-editors-script/README.md) for more details.
