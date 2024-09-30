import { reEstablishSession } from 'panda-session';
import notifications from './notifications';
import Raven from 'raven-js';

const reauthUrl = '/login/status';
const reauthErrorMessage =
	"We couldn't log you back in. Your changes may not be saved. " +
	`Please <a href="${window.location.href}" target="_self">log in again</a> to reauthenticate.`;

const AUTH_ERROR_STATUS_CODES = [401, 419];

/**
 * Make a fetch request with Panda authentication.
 *
 * @rejects {Response} If the response status isn't 2XX/3XX.
 * @rejects {Error} If fetch throws.
 */
const pandaFetch = (
	url: string,
	options: RequestInit = {},
	count: number = 0,
): Promise<Response> =>
	new Promise(
		async (resolve: (r: Response) => any, reject: (e: any) => any) => {
			try {
				const response = await fetch(url, {
					...options,
					credentials: 'same-origin',
				});

				if (AUTH_ERROR_STATUS_CODES.includes(response.status) && count < 1) {
					try {
						await reEstablishSession(reauthUrl, 5000);
						const res2 = await pandaFetch(url, options, count + 1);
						return resolve(res2);
					} catch (e) {
						if (
							!(e as Response).status ||
							AUTH_ERROR_STATUS_CODES.includes((e as Response).status)
						) {
							notifications.notify({
								message: reauthErrorMessage,
								level: 'error',
							});
							Raven.captureException(`'Auth issue' banner presented to user`, {
								extra: {
									response: e,
								},
							});
						}
						return reject(
							isError(e) ? `Auth Issue (${e ? e.toString() : ''})` : e,
						);
					}
				} else if (response.status < 200 || response.status >= 300) {
					if (count < 1 || !AUTH_ERROR_STATUS_CODES.includes(response.status)) {
						Raven.captureException(
							`'Request failed' because... ${response.status} ${response.statusText}`,
							{
								extra: {
									response,
								},
							},
						);
					}
					return reject(response);
				}

				return resolve(response);
			} catch (error) {
				// notifications.notify({
				//   message:
				//     'Connection issue occurred. Your changes may not be saved. Please wait or reload the page.',
				//   level: 'error',
				// });
				Raven.captureException(
					`'Connection issue' banner OUGHT TO BE presented to user`,
					{
						extra: {
							error,
						},
					},
				);
				return reject(`Connection Issue (${error ? error.toString() : ''})`);
			}
		},
	);

function isError(possibleError: any): possibleError is Error {
	return possibleError != undefined && possibleError.message !== undefined;
}

export default (url: string, body: RequestInit = {}) => pandaFetch(url, body);
