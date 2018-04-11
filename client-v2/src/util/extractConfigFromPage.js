// @flow

export default (): Object => {
  const configEl = document.getElementById('config');

  if (!configEl) {
    return {};
  }

  const json = JSON.parse(configEl.innerHTML);

  return json || {};
};
