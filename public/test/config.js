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
        lowFrequency: 60,
        highFrequency: 2,
        standardFrequency: 5,
        fixedContainers: [{ 'name':'fixed/test' }],
        dynamicContainers: [{ 'name':'dynamic/test' }],
        switches: {
            'facia-tool-disable': false,
            'facia-tool-draft-content': true,
            'facia-tool-sparklines': false
        }
    }
};
