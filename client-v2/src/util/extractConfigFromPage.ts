import { Config } from 'types/Config';

export default () => {
  const configEl = document.getElementById('config');

  if (!configEl) {
    throw new Error('Missing config');
  }

  const json: Config = JSON.parse(configEl.dataset.value || '');

  return json;
};
