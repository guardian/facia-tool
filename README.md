# Facia Tool

The Guardian front pages editor.

## Client V2

Fronts Client V2 is in Active Development. You'll find it over at [client-v2](/client-v2).

### Setup (need to be done once)

1. Install [NVM](https://github.com/creationix/nvm).
1. Get credentials from [Janus](https://janus.gutools.co.uk/multi-credentials?&permissionIds=cmsFronts-dev,capi-api-gateway,frontend-dev).
2. From the project root, run `./scripts/setup.sh`.

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

### Developing locally
- If you are adding a new kind of content to a front or changing the front configuration, you should check that the front can still be pressed.

- To check this, check that a piece of content still appears on frontend. Edit the articles appearing on a front, launch the front and check that your changes are appearing here: `http://m.code.dev-theguardian.com/{name-of-front}`

- If the front that you are trying to view cannot be found, it is probably because the front is hidden.
- You can remove this property from the front in the fronts config page.
- Select the front your are trying to view on the config page, click on the edit-metadata link, and deselect the `is hidden`-property.

- If you are developing locally and do not have frontend credentials from janus, the fronts tool won't have permissions to push events to the sqs queue that Facia-Press reads from. To test that a front is pressed, you will have to deploy your changes to code, and test the code from there.

#### Troubleshooting
##### Postgres
- If you wish to delete everything in the database you can use `docker-compose down -v` which will delete the container's persistent volumes.
- If you wish to connect to the local database you can run `./scripts/local-psql.sh` which has the user, database and password preconfigured and ready to go.
- If you need the master passwords for the production postgres instances they are stored as SSM parameters and can be found at:
  - CODE: `facia-tool/cms-fronts/CODE/db/password`
  - PROD: `facia-tool/cms-fronts/PROD/db/password`
  To fetch these can be fetched using the aws cli like so:

  `aws ssm get-parameter --name /facia-tool/cms-fronts/CODE/db/password --with-decryption --profile cmsFronts --region eu-west-1`

##### Linting

Fronts tool uses `eslint` to ensure consistent style. Run `eslint` with

```bash
grunt eslint
```

More detailed instructions of how to develop fronts tool available [here](./GUIDE_TO_FRONTS.md)

## Get Fronts Editors

There is a script to get a list of the fronts editors in the `get-editors-script`. See the [script README](./get-editors-script/README.md) for more details.
