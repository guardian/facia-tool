const server = require('./server');

module.exports = () => {
  global.integrationServer = server();
};
