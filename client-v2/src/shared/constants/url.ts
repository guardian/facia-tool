export default {
  base: {
    mainDomain: 'www.theguardian.com',
    mainDomainShort: 'theguardian.com',
    previewDomain: 'preview.gutools.co.uk'
  },
  media: {
    apiBaseUrl: '/api.grid',
    mediaBaseUrl: 'http://media',
    usageBaseUrl: '/api/usage',
    imgIXDomainExpr: /^https:\/\/i\.guim\.co\.uk\/img\/static\//,
    imageCdnDomain: '.guim.co.uk',
    staticImageCdnDomain: 'https://static.guim.co.uk/',
    imageCdnDomainExpr: /^https:\/\/(.*)\.guim\.co\.uk\//
  }
};
