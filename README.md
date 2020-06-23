# Facia Tool

The Guardian front pages editor.

## Fronts Client

You can find the client for the Fronts tool in [fronts-client](/fronts-client).

### Setup (need to be done once)

1. Install [NVM](https://github.com/creationix/nvm).
1. Get credentials from [Janus](https://janus.gutools.co.uk/multi-credentials?&permissionIds=cmsFronts-dev,capi-api-gateway,frontend-dev).
1. Grant [code](https://permissions.code.dev-gutools.co.uk/) permissions (used for local builds as well).  You need:
    1. fronts_access
    1. launch_commercial_fronts
    1. edit_editorial_fronts
    1. edit_editions
    1. launch_editorial_fronts
    1. configure_fronts
1. From the project root, run `./scripts/setup.sh`.

### Dev Start

1. To run the application:
   - From the project root, run `./scripts/start-dev.sh`
   - From the project root, run without debug `./scripts/start-dev.sh --no-debug`
2. Open `https://fronts.local.dev-gutools.co.uk`.

### Unit tests

- Running server side tests: `sbt test`
- Running client side tests: `grunt test`
  - `grunt test --no-single-run` runs the tests in the browser, starts `karma` in debug mode. You can connect your browser at [http://localhost:9876?debug.html](http://localhost:9876?debug.html)
  - You can run a single test going to [http://localhost:9876/debug.html?test=collections](http://localhost:9876/debug.html?test=collections), spec files are inside `facia-tool/test/public/spec`.

### IT tests with Database

`sbt test database-int:test`

### Pressing fronts
- Before fronts can appear on site, they have to be pressed by Facia-Press which lives on the frontend account.
- The fronts tool sends events to an sqs queue which Facia-Press listens. You can read more about Facia-Press [here](https://github.com/guardian/frontend/blob/ad74a1da567f047b7b824650e6e1be0f0262952b/docs/02-architecture/01-applications-architecture.md).

- If you are adding a new kind of content to a front or changing the front configuration, you should check that the front can still be pressed.

- To check this, check that a piece of content still appears on frontend. Edit the articles appearing on a front, launch the front and check that your changes are appearing here: `http://m.code.dev-theguardian.com/{name-of-front}`

- If the front that you are trying to view cannot be found, it is probably because the front is hidden.
- You can remove this property from the front in the fronts config page.
- Select the front your are trying to view on the config page, click on the edit-metadata link, and deselect the `is hidden`-property.

- If you are developing locally and do not have frontend credentials from janus, the fronts tool won't have permissions to push events to the sqs queue that Facia-Press reads from. To test that a front is pressed, you will have to deploy your changes to code, and test the code from there.


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

The Editions interface is used to curate content on the Editions app (currently known as The Daily on iOS and Android). Editions also uses the fronts-client front end, and can be accessed from the Manage Editions menu on the [homepage](https://fronts.code.dev-gutools.co.uk/v2).

Curation works in the same way as the main fronts tool. But there are these differences:

* Fronts are part of Issues (normally one issue per day). You need to create or open a valid issue to make changes

* Editions are published once instead of being continually updated and launched

* The publication process for Editions is different to the main fronts. We push the json we produce to a lambda - the [backend of the Editions app](https://github.com/guardian/editions), and this combines fronts data with CAPI calls etc to produce the Edition.

Full [Editions codebase and documentation here](https://github.com/guardian/editions).




### The Config Tool

Fronts and collections are configured in the config tool. This allows for the name, geolocation and visual properties of collections to be set. The types and order of collections in a Front is set here too. This tool uses the "old" front end client. Each "type of fronts" has its own config url eg: https://fronts.gutools.co.uk/email/config


### The Breaking News Tool

This enables breaking news notifications to be sent to app users who have signed up. This tool also uses the "old" front end client. You need permission from Central Production to access this tool in PROD.  https://fronts.gutools.co.uk/breaking-news

In CODE the breaking news tool sends notifications to the "debug version" of the Android/iOS App.

Breaking News is represented by a front called `breaking-news` which is considered to be a special case. It has a `Send Alert` button rather than a `Launch` button. Only one thing can be added to a collection at a given time. You cannot send the same alert twice, and snap links cannot be added / alerted on. Different collections represent different audience groups (eg by location or by subscription to different topics.) To add a new one, just create a container. New breaking news containers need to have the layout `breaking-news/not-for-other-fronts`.


## Troubleshooting
### Postgres
- If you wish to delete everything in the database you can use `docker-compose down -v` which will delete the container's persistent volumes.
- If you wish to connect to the local database you can run `./scripts/local-psql.sh` which has the user, database and password preconfigured and ready to go.
- If you need the master passwords for the production postgres instances they are stored as SSM parameters and can be found at:
  - CODE: `facia-tool/cms-fronts/CODE/db/password`
  - PROD: `facia-tool/cms-fronts/PROD/db/password`
  To fetch these can be fetched using the aws cli like so:

  `aws ssm get-parameter --name /facia-tool/cms-fronts/CODE/db/password --with-decryption --profile cmsFronts --region eu-west-1`

### Linting

Fronts tool uses `eslint` to ensure consistent style. Run `eslint` with

```bash
grunt eslint
```

More detailed instructions of how to develop fronts tool available [here](./GUIDE_TO_FRONTS.md)

## Get Fronts Editors

There is a script to get a list of the fronts editors in the `get-editors-script`. See the [script README](./get-editors-script/README.md) for more details.
