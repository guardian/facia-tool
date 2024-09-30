const cardMeta = {};

const card = {
	id: 'internal-code/page/5158391',
	frontPublicationDate: 1539180309305,
	meta: cardMeta,
	uuid: '36a2fa8e-0e77-4f53-98d2-271282b5db70',
};

const boostedCard = {
	id: 'internal-code/page/5158392',
	frontPublicationDate: 1539180309305,
	meta: {
		isBoosted: true,
	},
	uuid: '36a2fa8e-0e77-4f53-98d2-271282b5db71',
};

const cardWithSlideshowThumbnailMeta = {
	imageSlideshowReplace: true,
	slideshow: [
		{
			src: 'exampleSrc1',
			thumb: 'exampleThumbnail1',
			width: '100',
			height: '100',
			origin: 'exampleOrigin1',
		},
		{
			src: 'exampleSrc2',
			thumb: 'exampleThumbnail2',
			width: '100',
			height: '100',
			origin: 'exampleOrigin2',
		},
	],
};

export { card, cardMeta, cardWithSlideshowThumbnailMeta, boostedCard };
