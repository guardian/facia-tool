const snapFields = [
  'headline',
  'custom kicker',
  'special link URL',
  'image thumbnail',
  'replacement image width',
  'replacement image height',
  'replacement image origin',
  'replacement cutout image width',
  'replacement cutout image height',
  'replacement cutout image origin',
  'breaking news',
  'kicker',
  'kicker',
  'custom kicker',
  'snap target',
  'snap type',
  'snap class'
];

const visibleWhens = {
  showByline: ['byline'],
  showKickerCustom: ['custom kicker'],
  imageReplace: [
    'replacement image URL',
    'replacement image width',
    'replacement image height',
    'replacement image origin'
  ],
  imageCutoutReplace: [
    'replacement cutout image URL',
    'replacement cutout image width',
    'replacement cutout image height',
    'replacement cutout image origin'
  ],
  imageSlideshowReplace: [null]
};

const c = {
  enableContentOverrides: ['headline', 'trail text', 'byline'],
  inDynamicCollection: ['boost'],
  isLiveBlog: ['show updates'],
  hasMainVideo: ['show video']
};
