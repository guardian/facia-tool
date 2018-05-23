# Shared Collections Library
(Still waiting for a better name for this)

The shared collections library is a library written using React and Redux and flow for typing.
It makes it easier to develop tools which need to provide the ability to curate collections of content.

The shared collections library provides:
- Components which render collections and articles in them
- Reducers and actions to store articles and collections in application state.
- Selectors for common selection use cases e.g. selecting all articles in a particular collection

The consumer application is responsible for fetching data (collections, details of the articles in the collections) from its own data store and from an external store in (e.g. capi) and passing
this data on to the shared collections module.

We assume articles are stored in the consumer application and in an external datastore because the consumer application should never edit the articles themselves as they appear in capi. It only edits the way articles are displayed in a particular collection. To understand what an article looks like, we look at how that article appears in the external store and what edits we have applied to that article within our application.

The consumer application also controls the stage of the collection we want to view, e.g. in the case of the fronts tool whether we want to render draft or live collections.

## Using the library

### Fetching data

To use the library, you have to dispatch three actions: `articleFragmentsReceived`, `externalArticlesReceived` and `collectionReceived` actions.

### External Articles
External articles represent the articles as they exist in external to your application e.g. in the content api.

They look like this:

```
type ExternalArticle = {
  id: string,
  headline: string
};
```

`externalArticlesReceived` expects a payload that is an object, which has external article ids as keys and external articles as values.

### Collection

`collectionReceived` action expects a collection in its payload.

The collection looks like this:

```
type Collection = {
  articles: {
    [stage: string]: Array<string>
  },
  id: string,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string,
  platform?: string,
  displayName: string,
  groups?: Array<string>
};

```

Note that the articles in the Collection are stored as an array of ids. The articles that these ids refer to should be passed to the `articleFragmentsReceived` action.

### Article Fragments
These article fragments take the following shape:


```
type ArticleFragment = {
  uuid: string, // Refers to the article ids inside a collection
  id: string, // Article id in the external store e.g. capi id
  frontPublicationDate: number,
  publishedBy: string,
  meta: Meta
};
```

`articleFragmentsReceived` expects in it's payload on object where keys are Article Fragment uuids and values are the article fragments themselves.

We provide an utility function `normaliseCollectionWithNestedArticles` to generate collections and article fragments from collections which have a shape similar to the collections as they appear in the fronts tool.

### Usign the collections component

Once all the collections and articles have been stored in the state, using the collections library is easy. Simply pass the collection id and stage (e.g. live or draft) of articles you want shown to the `Collection` component:

```
 <Collection id={id} stage={stage} />
```

### Configuration

TOO: We don't have any configurable settings yet.
