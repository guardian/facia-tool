import { reEstablishSession } from 'panda-session';
import notifications from './notifications';
import { isError } from 'tslint/lib/error';
import Raven from 'raven-js';

const reauthUrl = '/login/status';
const reauthErrorMessage =
  "We couldn't log you back in. Your changes may not be saved. " +
  `Please <a href="${window.location.href}" target="_self">log in again</a> to reauthenticate.`;

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
    async (resolve: (r: Response) => any, reject: (e: any) => any) => {
      try {
        const res = await fetch(url, {
          ...options,
          credentials: 'same-origin',
        });

        if ((res.status === 419 || res.status === 401) && count < 1) {
          try {
            await reEstablishSession(reauthUrl, 5000);
            const res2 = await pandaFetch(url, options, count + 1);
            return resolve(res2);
          } catch (e) {
            notifications.notify({
              message: reauthErrorMessage,
              level: 'error',
            });
            Raven.captureException(e, {
              extra: {
                message: `'Auth issue' banner presented to user`,
              },
            });
            return reject(
              isError(e) ? `Auth Issue (${e ? e.toString() : ''})` : e
            );
          }
        } else if (res.status < 200 || res.status >= 300) {
          // notifications.notify({
          //   message:
          //     'Request failed. Your changes may not be saved. Please wait or reload the page.',
          //   level: 'error',
          // });
          Raven.captureException(
            `'Request failed' banner OUGHT TO BE presented to user, because... ${res.status} ${res.status}`,
            { extra: res }
          );
          return reject(res);
        }

        return resolve(res);
      } catch (error) {
        // notifications.notify({
        //   message:
        //     'Connection issue occurred. Your changes may not be saved. Please wait or reload the page.',
        //   level: 'error',
        // });
        Raven.captureException(error, {
          extra: {
            message: `'Connection issue' banner OUGHT TO BE presented to user`,
          },
        });
        return reject(`Connection Issue (${error ? error.toString() : ''})`);
      }
    }
  );

export default (url: string, body: RequestInit = {}) => pandaFetch(url, body);
