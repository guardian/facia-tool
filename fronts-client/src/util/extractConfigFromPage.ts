import type { Config } from 'types/Config';

const pageConfig = () => {
	const configEl = document.getElementById('config');

	if (!configEl) {
		throw new Error('Missing config');
	}

	const config: Config = JSON.parse(configEl.dataset.value || '');

	return config;
};

export default pageConfig();
