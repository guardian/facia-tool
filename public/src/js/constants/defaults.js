export default {
    editions: ['uk', 'us', 'au'],

    environmentUrlBase: {
        'prod': 'http://theguardian.com/',
        'code': 'http://m.code.dev-theguardian.com/'
    },

    types: [
        { 'name': 'fixed/small/slow-VI' },
        { 'name': 'fixed/medium/slow-VIII' },
        { 'name': 'fixed/small/slow-IV' },
        { 'name': 'fixed/medium/fast-XII' },
        { 'name': 'fixed/small/slow-III' },
        { 'name': 'fixed/small/slow-V-third' },
        { 'name': 'fixed/small/slow-I' },
        { 'name': 'fixed/medium/slow-VI' },
        { 'name': 'fixed/large/slow-XIV' },
        { 'name': 'fixed/medium/fast-XI' },
        { 'name': 'fixed/large/fast-XV' },
        { 'name': 'fixed/medium/slow-XII-mpu' },
        { 'name': 'fixed/thrasher' },
        { 'name': 'fixed/small/fast-X' },
        { 'name': 'fixed/small/slow-II' },
        { 'name': 'fixed/medium/slow-VII' },
        { 'name': 'fixed/small/fast-VIII' },
        { 'name': 'fixed/small/slow-V-mpu' },
        { 'name': 'fixed/small/slow-V-half' },
        {
          'name': 'dynamic/fast',
          'groups': [
            'standard',
            'big',
            'very big',
            'huge'
          ]
        },
        {
          'name': 'dynamic/slow',
          'groups': [
            'standard',
            'big',
            'very big',
            'huge'
          ]
        },
        {
          'name': 'dynamic/package',
          'groups': [
            'standard',
            'snap'
          ]
        },
        {
          'name': 'dynamic/slow-mpu',
          'groups': [
            'standard',
            'big'
          ]
        },
        { name: 'nav/list' },
        { name: 'nav/media-list' },
        { name: 'news/most-popular' },
        { name: 'breaking-news/not-for-other-fronts', groups: ['web', 'app & web'] },
        { name: 'commercial/single-campaign' },
        { name: 'commercial/multi-campaign' }
    ],

    navSections: [
        'news',
        'uk-news',
        'politics',
        'world',
        'sport',
        'football',
        'commentisfree',
        'culture',
        'business',
        'lifeandstyle',
        'environment',
        'technology',
        'travel',
        'money',
        'science',
        'guardian-professional',
        'observer',
        'todayspaper',
        'membership',
        'crosswords',
        'video',
        'us-news',
        'media',
        'australia-news'
    ],

    headlineLength: 200,
    restrictedHeadlineLength: 90,

    restrictHeadlinesOn: [
        'breaking-news'
    ],

    restrictedLiveMode: [
        'breaking-news'
    ],

    askForConfirmation: [
        'breaking-news'
    ],

    restrictedEditor: [
        'breaking-news'
    ],

    prioritiesWithGroups: [
        'commercial'
    ],

    detectPressFailureMs: 10000,

    detectPendingChangesInClipboard: 4000,

    defaultPriority: 'editorial',
    maxFronts: {
        'editorial': 200,
        'commercial': 350,
        'training': 50
    },
    frontAlertLimit: 10,
    frontGroups: [
        'UK consumer',
        'UK professional',
        'US consumer',
        'US professional',
        'AU consumer',
        'AU professional',
        'Masterclasses'
    ],

    filterTypes: {
        section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
        tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
    },

    searchPageSize:        50,

    capiBatchSize:         10,

    maxSlideshowImages:    5,

    collectionsPollMs:     10000,
    latestArticlesPollMs:  30000,
    configSettingsPollMs:  30000,
    cacheExpiryMs:         60000,
    sparksRefreshMs:      300000,
    pubTimeRefreshMs:      30000,
    searchDebounceMs:        300,
    frontAgeAlertMs: {
        front:      60000 * 2 * 1,
        editorial:  60000 * 2 * 5,
        commercial: 60000 * 2 * 60
    },
    failsBeforeError:           2,

    highFrequencyPaths:    ['uk', 'us', 'au', 'uk/sport', 'us/sport', 'au/sport'],

    mainDomain:            'www.theguardian.com',
    mainDomainShort:       'theguardian.com',

    apiBase:               '',
    apiSearchBase:         '/api/preview',
    apiLiveBase:           '/api/live',
    apiSearchParams:       [
        'show-elements=video,main',
        'show-blocks=main',
        'show-tags=all',
        'show-fields=' + [
            'internalPageCode',
            'isLive',
            'firstPublicationDate',
            'scheduledPublicationDate',
            'headline',
            'trailText',
            'byline',
            'thumbnail',
            'secureThumbnail',
            'liveBloggingNow',
            'membershipAccess',
            'shortUrl'
        ].join(',')
    ].join('&'),

    draggableTypes: {
        configCollection: 'config-collection'
    },


    frontendApiBase:       '/frontend',

    reauthPath:            '/login/status',
    reauthInterval:        60000 * 10, // 10 minutes
    reauthTimeout:         60000,

    imageCdnDomain:        '.guim.co.uk',
    imageCdnDomainExpr:    /^https?:\/\/(.*)\.guim\.co\.uk\//,
    imgIXDomainExpr:       /^https?:\/\/i\.guim\.co\.uk\/img\/static\//,
    staticImageCdnDomain:  'https://static.guim.co.uk/',
    previewBase:           'http://preview.gutools.co.uk',
    viewerHost:            'viewer.gutools.co.uk',

    latestSnapPrefix:      'Latest from ',

    ophanBase:             'http://dashboard.ophan.co.uk/summary',
    ophanFrontBase:        'http://dashboard.ophan.co.uk/info-front?path=',

    internalPagePrefix:    'internal-code/page/',

    sparksBatchQueue:      15
};
