import { reEstablishSession } from 'panda-session';
import notifications from './notifications';

const reauthUrl = '/login/status';
const reauthErrorMessage = `We couldn't log you back in. Your changes may not be saved. Please log in again to reauthenticate.`;

/**
 * Make a fetch request with Panda authentication.
 *
 * @rejects {Response} If the response status isn't 2XX/3XX.
 * @rejects {Error} If fetch throws.
 */
const pandaFetch = (
  url: string,
  options: RequestInit = {},
  count: number = 0
): Promise<Response> =>
  new Promise(
    async (resolve: (r: Response) => any, reject: (r: Response) => any) => {
      const res = await fetch(url, {
        ...options,
        credentials: 'same-origin',
      });

      if (res.status === 419 && count < 1) {
        try {
          await reEstablishSession(reauthUrl, 5000);
          const res2 = await pandaFetch(url, options, count + 1);
          return resolve(res2);
        } catch (e) {
          return reject(e);
        }
      } else if (res.status < 200 || res.status >= 300) {
        notifications.notify({ message: reauthErrorMessage, level: 'error' });
        return reject(res);
      }

      return resolve(res);
    }
  );

export default (url: string, body: RequestInit = {}) => pandaFetch(url, body);
