// @flow
import { reEstablishSession } from 'panda-session';

function checkStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res;
  }
  throw res;
}

export default function pandaFetch(url, body) {
  return new Promise((resolve, reject) =>
    fetch(url, body)
      .then(checkStatus)
      .then(res => resolve(res))
      .catch(err => {
        if (err.status === 419) {
          const store = getStore();
          const { config: reauthUrl } = store.getState();

          return reEstablishSession(reauthUrl, 5000).then(
            () => {
              fetch(url, body)
                .then(checkStatus)
                .then(res => resolve(res))
                .catch(reAuthErr => reject(reAuthErr));
            },
            error => {
              throw error;
            }
          );
        }
        return reject(err);
      })
  );
}
