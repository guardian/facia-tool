/* jshint node: true */
import url from 'url';

// These prosemirror-helper functions are a simplified version of what we use in Composer, and have been lifted and shifted from that repo

const FUZZY_MATCHERS = [
	{
		// For emails we just look for a `@` symbol as it is easier.
		regexp: /@/,
		message:
			'The URL you entered appears to be an email address. ' +
			'Do you want to add the required “mailto:” prefix?',
		action: (link: string) => `mailto:${link}`,
	},
	{
		// For tel numbers check for + and numerical values
		regexp: /^[+, 0-9]*$/,
		message:
			'The URL you entered appears to be a telephone number. ' +
			'Do you want to add the required “tel:” prefix?',
		action: (link: string) => `tel:${link}`,
	},
	{
		regexp: /.+/,
		message:
			'The URL you entered appears to be a link. ' +
			'Do you want to add the required “http://” prefix?',
		action: (link: string) => `http://${link.trim()}`,
	},
];

export const parseURL = (rawLink: string, confirm = window.confirm) => {
	try {
		const parsedUrl = url.parse(rawLink);
		if (!parsedUrl.protocol) {
			throw false; // try fuzzy instead
		}

		return parsedUrl.href;
	} catch (e) {
		for (const { regexp, message, action } of FUZZY_MATCHERS) {
			if (regexp.test(rawLink)) {
				if (confirm(message)) {
					return action(rawLink);
				} else {
					return null;
				}
			}
		}

		return rawLink;
	}
};

const isEdToolsDomain = (parsedUrl: url.UrlWithStringQuery) => {
	// TODO: consider how comprehensive this is. should there be other tools?
	const edToolsDomains = [
		'composer.gutools.co.uk',
		'preview.gutools.co.uk',
		'viewer.gutools.co.uk',
	];

	return (
		parsedUrl.hostname &&
		(edToolsDomains.some((d) => parsedUrl.hostname === d) ||
			/\.gnl/.test(parsedUrl.hostname))
	);
};

export const linkValidator = (
	rawLink: string,
): { valid: boolean; message?: string } => {
	const parsedUrl = url.parse(rawLink);

	if (isEdToolsDomain(parsedUrl)) {
		return {
			valid: false,
			message:
				'This is a preview link, which can only be accessed by Guardian staff, not readers. Please check and update your link and try again',
		};
	}

	if (parsedUrl.hostname === 'dashboard.ophan.co.uk') {
		return {
			valid: false,
			message:
				'This link can only be accessed by Guardian staff, not readers. Please check and update your link and try again',
		};
	}

	if (rawLink.includes('.')) {
		const possibleUrl = url.parse(`https://${rawLink}`);
		if (possibleUrl.hostname) {
			return { valid: true };
		}
	}

	if (!parsedUrl.hostname) {
		return {
			valid: false,
			message: `"${rawLink}" is not a valid url, please check and try again`,
		};
	}

	return {
		valid: true,
	};
};
