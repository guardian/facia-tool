module.exports = {
  id: 'issue-1',
  displayName: 'Daily Edition',
  issueDate: 1563987694281, // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: null, // null if not published
  launchedOn: 1563577200000,
  launchedBy: 'Richard Beddington',
  launchedEmail: 'r.b@gu.com',
  fronts: [
    {
      id: 'regular_front',
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
          items: [],
          prefill: {
            queryString: 'this-doesnt-matter'
          }
        },
        {
          id: 'collection-2',
          name: 'collection/2',
          // prefill: string,
          isHidden: false,
          // lastUpdated?: number,
          // updatedBy?: string,
          // updatedEmail?: string,
          items: []
        }
      ]
    },
    {
      id: 'special_front',
      displayName: 'Special 1',
      canRename: true,
      isHidden: false,
      collections: [
        {
          id: 'collection-special',
          displayName: 'Special Collection',
          isHidden: false,
          items: [],
          prefill: {
            queryString: 'this-doesnt-matter'
          }
        }
      ]
    }
  ]
};
