const path = require('path');
const express = require('express');
const port = 3456;

const config = require('../fixtures/config');
const collection = require('../fixtures/collection');
const capiCollection = require('../fixtures/capi-collection');
const capiSearch = require('../fixtures/capi-search');

const findArticleWithIDFromResponse = id =>
  capiSearch.response.results.filter(
    ({ fields: { internalPageCode } }) =>
      `internal-code/page/${internalPageCode}` === id
  );

module.exports = async () =>
  new Promise((res, rej) => {
    const app = express();
    app.get('/v2/*', (_, res) =>
      res.sendFile(path.join(__dirname, './index.html'))
    );

    // send all api requests to here
    app.get('/api*', (req, res) => {
      const ids = (req.query.ids || '').split(',').filter(Boolean);
      switch (ids.length) {
        case 0: {
          // if we have no ids assume this is a CAPI search for latest
          // and return the capiSearch feed data
          return res.json(capiSearch);
        }
        case 1: {
          // If we only have one id then assume we're looking for an article in
          // response to drag and drop, given this is a drag and drop from the
          // search feed, we filter out the response for the search results
          // to return just the data of the thing we're looking for
          // TODO: the main app may be able to not have to make a network
          // request for this as it's actually already in the state ...
          const results = findArticleWithIDFromResponse(ids[0]);
          return res.json({
            ...capiCollection,
            response: {
              ...capiCollection.response,
              total: results.length,
              results
            }
          });
        }
        default: {
          // if we are asking for loads of ids then assume we're making a capi
          // request to fill in a collection
          return res.json(capiCollection);
        }
      }
    });
    app.get('/config', (_, res) => res.json(config));
    app.get('/collection/:id', (_, res) => res.json(collection));
    app.get('*', (req, res) =>
      res.sendFile(path.join(__dirname, '../../../public/client-v2', req.path))
    );
    const server = app.listen(port, err => {
      if (err) {
        console.log("Intergration server couldn't start");
        rej(err);
      } else {
        console.log('Opened integration server.');
        res(server);
      }
    });
  });
