const articleFragmentWithElementsThumbnailMeta = {};

const articleFragmentWithSlideshowThumbnailMeta = {
  imageSlideshowReplace: true,
  slideshow: [
    {
      src: 'exampleSrc1',
      thumb: 'exampleThumbnail1',
      width: 100,
      height: 100,
      origin: 'exampleOrigin1'
    },
    {
      src: 'exampleSrc2',
      thumb: 'exampleThumbnail2',
      width: 100,
      height: 100,
      origin: 'exampleOrigin2'
    }
  ]
};

export {
  articleFragmentWithElementsThumbnailMeta,
  articleFragmentWithSlideshowThumbnailMeta
};
