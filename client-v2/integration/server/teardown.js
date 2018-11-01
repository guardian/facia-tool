module.exports = () =>
  global.integrationServer.close(() =>
    console.log('Closed integration server.')
  );
