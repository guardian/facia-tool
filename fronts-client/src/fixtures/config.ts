export default {
	dev: true,
	env: 'code',
	editions: ['uk', 'us', 'au'],
	email: 'jonathon.herbert@guardian.co.uk',
	avatarUrl:
		'https://lh4.googleusercontent.com/-XsUf7pwnZ_k/AAAAAAAAAAI/AAAAAAAAAAA/AB6qoq10gWr-wcpwcJhx_ByQMHVae6s3QQ/mo/photo.jpg',
	firstName: 'Jonathon',
	lastName: 'Herbert',
	sentryPublicDSN:
		'https://4527e03d554a4962ae99a7481e9278ff@app.getsentry.com/35467',
	mediaBaseUrl: 'https://media.gutools.co.uk',
	apiBaseUrl: 'https://api.media.gutools.co.uk',
	switches: {
		'facia-tool-allow-breaking-news-for-all': false,
		'story-packages-disable-reindex-endpoint': false,
		'facia-tool-allow-config-for-all': false,
		'facia-tool-sparklines': true,
		'facia-tool-draft-content': true,
		'facia-tool-disable': false,
	},
	acl: {
		fronts: { 'breaking-news': false },
		permissions: { 'configure-config': true },
	},
	collectionCap: 20,
	navListCap: 40,
	navListType: 'nav/list',
	collectionMetadata: [
		{ type: 'Canonical' },
		{ type: 'Special' },
		{ type: 'Breaking' },
		{ type: 'Branded' },
	],
	capiLiveUrl: 'https://fronts.local.dev-gutools.co.uk/api/live/',
	capiPreviewUrl: 'https://fronts.local.dev-gutools.co.uk/api/preview/',
};
