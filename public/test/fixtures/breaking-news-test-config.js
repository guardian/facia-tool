export default {
    config: {
        fronts: {
            'breaking-news': {
                collections: ['global', 'uk-alerts'],
                description: 'New News',
                title: 'Breaking news'
            }
        },
        collections: {
            'global': {
                displayName: 'Global alerts',
                groups: ['minor', 'major'],
                type: 'breaking-news/not-for-other-fronts'
            },
            'uk-alerts': {
                displayName: 'UK alerts',
                groups: ['minor', 'major'],
                type: 'breaking-news/not-for-other-fronts'
            }
        }
    },
    defaults: {
        env: 'prod',
        editions: ['uk'],
        email: 'alerts@theguardian.com',
        avatarUrl: '',
        switches: {
            'facia-tool-disable': false,
            'facia-tool-draft-content': true,
            'facia-tool-sparklines': false
        }
    }
};
