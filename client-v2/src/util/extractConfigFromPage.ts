import { Config } from 'types/Config';

const pageConfig = () => {
  const configEl = document.getElementById('config');

  if (!configEl) {
    throw new Error('Missing config');
  }

  const json: Config = JSON.parse(configEl.dataset.value || '');

  return json;
};

export default pageConfig();
