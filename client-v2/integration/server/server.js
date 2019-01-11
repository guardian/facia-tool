const path = require('path');
const express = require('express');
const port = 3456;

const config = require('../fixtures/config');
const collection = require('../fixtures/collection');
const capiCollection = require('../fixtures/capi-collection');
const capiSearch = require('../fixtures/capi-search');
const snapTag = require('../fixtures/snap-tag');
const snapTagPage = require('../fixtures/snap-tag-page');
const snapExternalPage = require('../../src/shared/fixtures/bbcSectionPage.ts');

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

    // Endpoint for api search requests here
    app.get(/\/api\/(preview|live)\/search/, (req, res) => {
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

    // Endpoints to snap links - /tone/ & bbc specific to fixtures.
    app.get('/api/preview/tone/*', (req, res) => res.json(snapTag));
    app.get('/http/proxy/*', (req, res) => {
      const path = req.params[0];
      return path.includes(`bbc`)
        ? res.json(snapExternalPage)
        : res.json(snapTagPage);
    });

    // Endpoint for api requests for single pieces of content
    const handler = (req, res) => {
      const match = req.params[0];
      if (!match) {
        throw new Error('No match for content - no id');
      }
      if (/internal-code\/page\//.test(match)) {
        const internalPageCode = match.replace(/[^\d.]/g, '');
        const article = capiSearch.response.results.find(
          article => article.fields.internalPageCode === internalPageCode
        );
        if (!article) {
          throw new Error(`No match for content with id ${internalPageCode}`);
        }
        const result = {
          response: {
            content: article,
            status: 'ok',
            total: 1
          }
        };
        return res.json(result);
      }

      const article = capiSearch.response.results.find(
        article => article.id === match
      );

      if (!article) {
        throw new Error(`No match for content with id ${match}`);
      }
      const result = {
        response: {
          content: article,
          status: 'ok',
          total: 1
        }
      };
      return res.json(result);
    };

    // Attempts at a capture group:
    // /api/(preview|live)/*
    // /api/(?:preview|live)/
    app.get('/api/live/*', handler);
    app.get('/api/preview/*', handler);

    app.get('/config', (_, res) => res.json(config));
    app.get('/collection/:id', (_, res) => res.json(collection));
    app.get('/collections*', (_, res) => res.json([collection]));

    // send the assets from dist
    app.get(
      '*/:file',
      (req, res) =>
        req.params[0].includes('bbc') // prevents error messages from External Snap Link fixture
          ? res.json('')
          : res.sendFile(
              path.join(
                __dirname,
                '../../../public/client-v2/dist',
                req.params.file
              )
            )
    );

    // this catches update requests and pretends they went through ok
    app.post('*', (_, res) => res.json({ ok: true }));
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
