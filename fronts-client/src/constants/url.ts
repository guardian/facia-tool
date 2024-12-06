import pageConfig from 'util/extractConfigFromPage';

const previewPRODDomain = 'preview.gutools.co.uk';
const previewCODEDomain = 'preview.code.dev-gutools.co.uk';

export default {
	base: {
		mainDomain: 'www.theguardian.com',
		mainDomainShort: 'theguardian.com',
		frontendDomain: 'frontend.gutools.co.uk',
		previewPRODDomain,
		previewCODEDomain,
		shortDomain: 'gu.com',
		capi: 'content.guardianapis.com',
	},
	media: {
		apiBaseUrl: pageConfig.apiBaseUrl,
		mediaBaseUrl: 'https://media',
		usageBaseUrl: '/api/usage',
		imgIXDomainExpr: /^https:\/\/i\.guim\.co\.uk\/img\/static\//,
		imageCdnDomain: '.guim.co.uk',
		staticImageCdnDomain: 'https://static.guim.co.uk/',
		imageCdnDomainExpr: /^https:\/\/(.*)\.guim\.co\.uk\//,
	},
	capiLiveUrl: '/api/live',
	capiPreviewUrl: '/api/preview',
	recipes: 'https://recipes.guardianapis.com',
	codeRecipes: 'https://recipes.code.dev-guardianapis.com',
	manageEditions: '/manage-editions/',
	appRoot: 'v2',
	editionsCardBuilder: 'https://editions-card-builder.gutools.co.uk',
	previewUrlCODE: `https://${previewCODEDomain}/responsive-viewer/https://${previewCODEDomain}/`,
	previewUrlPROD: `https://${previewPRODDomain}/responsive-viewer/https://${previewPRODDomain}/`,
	liveUrlCODE: "https://m.code.dev-theguardian.com/",
	liveUrlPROD: "https://www.theguardian.com/",
};
