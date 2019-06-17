module.exports = {
  id: 'issue-1',
  displayName: 'Daily Edition',
  publishDate: '2016-06-22 19:10:25-07', // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: null, // null if not published
  launchedOn: '2016-06-21 19:10:25-07',
  launchedBy: 'Richard Beddington',
  launchedEmail: 'r.b@gu.com',
  fronts: [
    {
      id: 'rich/test',
      displayName: 'rich/test',
      isHidden: false,
      // updatedOn?: number,
      // updatedBy?: string,
      // updatedEmail?: string,
      collections: [
        {
          id: 'collection-1',
          displayName: 'collection/1',
          // prefill: string,
          isHidden: false,
          // lastUpdated?: number,
          // updatedBy?: string,
          // updatedEmail?: string,
          articles: []
        },
        {
          id: 'collection-2',
          name: 'collection/2',
          // prefill: string,
          isHidden: false,
          // lastUpdated?: number,
          // updatedBy?: string,
          // updatedEmail?: string,
          articles: []
        }
      ]
    }
  ]
};
