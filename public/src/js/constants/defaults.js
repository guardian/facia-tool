/* eslint no-multi-spaces: 0 */
export default {
    editions: ['uk', 'us', 'au'],

    environmentUrlBase: {
        'prod': 'https://theguardian.com/',
        'code': 'https://m.code.dev-theguardian.com/'
    },

    types: [
        { 'name': 'fixed/small/slow-IV' },
        { 'name': 'fixed/medium/fast-XII' },
        { 'name': 'fixed/small/slow-III' },
        { 'name': 'fixed/small/slow-V-third' },
        { 'name': 'fixed/small/slow-I' },
        { 'name': 'fixed/medium/slow-VI' },
        { 'name': 'fixed/large/slow-XIV' },
        { 'name': 'fixed/medium/fast-XI' },
        { 'name': 'fixed/medium/slow-XII-mpu' },
        { 'name': 'fixed/thrasher' },
        { 'name': 'fixed/video' },
        { 'name': 'fixed/video/vertical' },
        { 'name': 'fixed/medium/slow-VII' },
        { 'name': 'fixed/small/fast-VIII' },
        { 'name': 'fixed/small/slow-V-mpu' },
        { 'name': 'fixed/small/slow-V-half' },
        {
          'name': 'dynamic/fast',
          'groupsConfig': [
            {
              name: 'standard'
            },
            {
              name: 'big'
            },
            {
              name: 'very big'
            },
            {
              name: 'huge'
            }
          ]
        },
        {
          'name': 'dynamic/slow',
          'groupsConfig': [
            {
              name: 'standard'
            },
            {
              name: 'big'
            },
            {
              name: 'very big'
            },
            {
              name: 'huge'
            }
          ]
        },
        {
          'name': 'dynamic/package',
          'groupsConfig': [
            {
              name: 'standard'
            },
            {
              name: 'snap'
            }
          ]
        },
        {
          'name': 'dynamic/slow-mpu',
          'groupsConfig': [
            {
              name: 'standard'
            },
            {
              name: 'big'
            }
          ]
        },
        { 'name': 'nav/list' },
        { 'name': 'nav/media-list' },
        { 'name': 'news/most-popular' },
        {
          'name': 'breaking-news/not-for-other-fronts',
          groupsConfig: [
            {
              name: 'minor'
            },
            {
              name: 'major'
            }
          ]
        },
        { 'name': 'fixed/showcase' },
        { 'name': 'scrollable/highlights' },
        {
            'name': 'flexible/general',
            'groupsConfig': [
              {
                name: 'small',
                maxItems: 20
              },
              {
                name: 'large',
                maxItems: 20
              },
              {
                name: 'splash',
                maxItems: 1
              },
            ]
        },
        {
            'name': 'flexible/special',
            'groupsConfig': [
              {
                name: 'standard'
              },
              {
                name: 'snap'
              }
            ]
        },
		{ 'name': 'scrollable/small' },
		{ 'name': 'scrollable/medium' },
		{ 'name': 'scrollable/feature' },
		{ 'name': 'static/medium/4' },
		{ 'name': 'static/feature/2' }
    ],

    emailTypes: [
        { name: 'fast' },
        { name: 'fast-images' },
        { name: 'medium' },
        { name: 'slow' },
        { name: 'free-text' }
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

    disableSnapLinks: [
        'breaking-news'
    ],

    restrictedEditor: [
        'breaking-news'
    ],

    priorities: {
        'editorial': {
            maxFronts: 210,
            hasGroups: false,
            isTypeLocked: false,
            isHiddenLocked: false
        },
        'commercial': {
            maxFronts: 350,
            hasGroups: true,
            isTypeLocked: false,
            isHiddenLocked: false
        },
        'training': {
            maxFronts: 50,
            hasGroups: false,
            isTypeLocked: true,
            isHiddenLocked: true
        },
        'email': {
            maxFronts: 50,
            hasGroups: false,
            isTypeLocked: false,
            isHiddenLocked: false
        },
        'edition': {
            maxFronts: 350,
            hasGroups: true,
            isTypeLocked: true,
            isHiddenLocked: true
        },
        'showcase': {
            maxFronts: 50,
            hasGroups: false,
            isTypeLocked: false,
            isHiddenLocked: false
        }

    },
    defaultPriority: 'editorial',

    detectPressFailureMs: 10000,

    detectPendingChangesInClipboard: 4000,

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
    apiUsageBase:          '/api/usage',
    apiSearchParams:       [
        'show-elements=video,main',
        'show-blocks=main',
        'show-tags=all',
        'show-atoms=media',
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
    imageCdnDomainExpr:    /^https:\/\/(.*)\.guim\.co\.uk\//,
    imgIXDomainExpr:       /^https:\/\/i\.guim\.co\.uk\/img\/static\//,
    staticImageCdnDomain:  'https://static.guim.co.uk/',
    previewBase:           'https://preview.gutools.co.uk',
    viewerHost:            'viewer.gutools.co.uk',

    latestSnapPrefix:      'Latest from ',

    ophanBase:             'https://dashboard.ophan.co.uk/summary',
    ophanFrontBase:        'https://dashboard.ophan.co.uk/info-front?path=',
    ophanTrailBase:        'https://dashboard.ophan.co.uk/info?path=',

    internalPagePrefix:    'internal-code/page/',

    sparksBatchQueue:      15,

    platforms: {
        app: 'App',
        web: 'Web',
        any: 'Any'
    },

    userVisibilities: ['all', 'subscriber', 'non-subscriber'],

    betaCollectionTypes: [
        'flexible/special',
        'flexible/general',
        'scrollable/highlights',
        'scrollable/small',
        'scrollable/medium',
        'scrollable/feature',
        'static/medium/4',
        'static/feature/2'
    ]
};
