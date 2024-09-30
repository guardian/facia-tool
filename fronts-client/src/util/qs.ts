const enc = encodeURIComponent;

/**
 * Would use Object.entries but flow:
 * https://github.com/facebook/flow/issues/2221
 */
const qs = (o: { [key: string]: string | void }) =>
	`?${Object.keys(o)
		.map((key) => {
			const val = o[key];

			if (!val) {
				return false;
			}

			return `${enc(key)}=${enc(val)}`;
		})
		.filter(Boolean)
		.join('&')}`;

export { qs };
