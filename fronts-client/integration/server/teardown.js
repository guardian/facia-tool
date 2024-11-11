module.exports = () => 
  new Promise((resolve, _) =>
    global.integrationServer.close(() => {
      console.log('Closed integration server.');
      resolve();
    })
  )
