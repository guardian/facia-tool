const path = require('path');
const express = require('express');
const port = 3456;

const config = require('./fixtures/config');
const collection = require('./fixtures/collection');
const capiCollection = require('./fixtures/capi-collection');
const capiSearch = require('./fixtures/capi-search');

module.exports = () => {
  const app = express();
  app.get('/v2/*', (req, res) =>
    res.sendFile(path.join(__dirname, './index.html'))
  );
  app.get('/api*', (req, res) =>
    res.json(req.query.ids ? capiCollection : capiSearch)
  );
  app.get('/config', (req, res) => res.json(config));
  app.get('/collection/:id', (req, res) => res.json(collection));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../../public/client-v2', req.path))
  );
  const server = app.listen(port, err => {
    if (err) {
      return console.log("Intergration server couldn't start", err);
    }

    console.log('Opened integration server.');
  });
  return server;
};
