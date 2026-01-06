import $ from 'jquery';
import mockjax from 'jquery-mockjax';

mockjax($, window);
$.mockjaxSettings.logging = false;
$.mockjaxSettings.responseTime = 50;

export default {
    config: {
        fronts: {
            uk: {
                collections: ['latest', 'sport'],
                description: 'Broken news',
                title: 'UK',
                priority: 'test'
            },
            world: {
              collections: ['environment'],
              description: 'World news',
              title: 'World',
              priority: 'test'
            }
        },
        collections: {
            'latest': {
                displayName: 'Latest News',
                type: 'fast/slow'
            },
            'sport': {
                displayName: 'Sport',
                groups: ['short', 'tall', 'grande', 'venti'],
                type: 'slow/slower/slowest'
            },
            'environment': {
                displayName: 'Environment',
                type: 'slow/slower/slowest'
            }
        }
    },
    defaults: {
        env: 'test',
        editions: ['uk', 'us', 'au'],
        email: 'someone@theguardian.com',
        avatarUrl: '',
        switches: {
            'facia-tool-disable': false,
            'facia-tool-draft-content': true,
            'facia-tool-sparklines': false
        },
		baseUrls: {
			mediaBaseUrl: 'https://media.test.dev-gutools.co.uk',
			apiBaseUrl: 'https://api.media.test.dev-gutools.co.uk',
			videoBaseUrl: 'https://video.code.dev-gutools.co.uk'
		}
    }
};
