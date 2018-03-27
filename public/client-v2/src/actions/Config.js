// @flow

const configReceived = (config: Object) => ({
  type: 'CONFIG_RECEIVED',
  payload: config
});

export { configReceived };
