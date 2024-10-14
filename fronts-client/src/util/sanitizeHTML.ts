import { default as sanitize } from 'sanitize-html';

export const stripHtml = (html: string) => {
	const tempNode = document.createElement('div');
	tempNode.innerHTML = html;
	return tempNode.innerText || '';
};

// these are the defaults from html-sanitize (although disallowing `iframes`)
// Thgey've been left quite broad as they allow *rendering* in the fronts tool
// but we're not trying to keep up to date with what dotcom do / don't allow in
// the trail
export const sanitizeHTML = (html: string) =>
	sanitize(html, {
		allowedTags: [
			'blockquote',
			'p',
			'a',
			'ul',
			'ol',
			'nl',
			'li',
			'b',
			'i',
			'strong',
			'em',
			'strike',
			'code',
			'hr',
			'br',
			'div',
			'table',
			'thead',
			'caption',
			'tbody',
			'tr',
			'th',
			'td',
			'pre',
			'span',
			// 'iframe'
		],
		allowedAttributes: {
			'*': ['data-testid'],
			a: ['href', 'name', 'target'],
			img: ['src'],
			selfClosing: [
				'img',
				'br',
				'hr',
				'area',
				'base',
				'basefont',
				'input',
				'link',
				'meta',
			],
		},
		allowedSchemes: ['http', 'https'],
		allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
		allowProtocolRelative: false,
	});
