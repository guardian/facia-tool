const server = require('./server');

module.exports = async () => {
  // hook this into global to allow for teardown
  global.integrationServer = await server();
};
