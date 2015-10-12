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
            }
        }
    },
    switches: {
        'facia-tool-disable': false,
        'facia-tool-draft-content': true,
        'facia-tool-sparklines': false
    },
    defaults: {
        env: 'test',
        editions: ['uk', 'us', 'au'],
        navSections: ['news', 'uk-news', 'us-news', 'au-news'],
        email: 'someone@theguardian.com',
        avatarUrl: '',
        lowFrequency: 60,
        highFrequency: 2,
        standardFrequency: 5,
        fixedContainers: [{ 'name':'fixed/test' }],
        dynamicContainers: [{ 'name':'dynamic/test' }]
    }
};
