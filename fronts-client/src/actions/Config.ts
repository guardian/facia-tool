import { Config } from 'types/Config';

const configReceived = (config: Config) => ({
	type: 'CONFIG_RECEIVED',
	payload: config,
});

export { configReceived };
