module.exports = {
  id: 'issue-1',
  name: 'Daily Edition',
  publishDate: '2016-06-22 19:10:25-07', // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: null, // null if not published
  createdOn: '2016-06-21 19:10:25-07',
  createdBy: 'Richard Beddington',
  createdEmail: 'r.b@gu.com',
  fronts: [
    {
      id: 'rich/test',
      name: 'rich/test',
      isHidden: false,
      // updatedOn?: number,
      // updatedBy?: string,
      // updatedEmail?: string,
      collections: [
        {
          id: 'collection-1',
          name: 'collection/1',
          // prefill: string,
          isHidden: false,
          // updatedOn?: number,
          // updatedBy?: string,
          // updatedEmail?: string,
          live: [],
          draft: []
        },
        {
          id: 'collection-2',
          name: 'collection/2',
          // prefill: string,
          isHidden: false,
          // updatedOn?: number,
          // updatedBy?: string,
          // updatedEmail?: string,
          live: [],
          draft: []
        }
      ]
    }
  ]
};
