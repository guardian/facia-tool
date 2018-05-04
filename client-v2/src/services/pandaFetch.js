// @flow

import { reEstablishSession } from 'panda-session';

const reauthUrl = '/auth';
const pandaFetch = (
  url: string,
  options: Object = {},
  count: number = 0
): Promise<Response> =>
  new Promise(
    async (resolve: (r: Response) => mixed, reject: (r: Response) => mixed) => {
      const res = await fetch(url, {
        ...options,
        credentials: 'same-origin'
      });

      if (res.status === 419 && count < 1) {
        await reEstablishSession(reauthUrl, 5000);
        try {
          const res2 = await pandaFetch(url, options, count + 1);
          return resolve(res2);
        } catch (e) {
          return reject(e);
        }
      } else if (res.status < 200 || res.status >= 300) {
        return reject(res);
      }

      return resolve(res);
    }
  );

export default (url: string, body: Object = {}) => pandaFetch(url, body);
