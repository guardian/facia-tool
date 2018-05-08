// @flow

import type { Config } from 'Types/Config';

const configReceived = (config: Config) => ({
  type: 'CONFIG_RECEIVED',
  payload: config
});

export { configReceived };
