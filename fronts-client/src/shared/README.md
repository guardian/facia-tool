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

Collections and articles should be passed to the shared collections library in a normalised format. There are utility functions to normalised collections as they are stored in facia-tool or story packages but if the consumer uses a different datastructure, they will have to do perform this normalisation. The `Data types in the library` section contains details of what normalised collections and articles look like.

We assume articles are stored in the consumer application and in an external datastore because the consumer application should never edit the articles themselves as they appear in capi. It only edits the way articles are displayed in a particular collection. To understand what an article looks like, we look at how that article appears in the external store and what edits we have applied to that article within our application.

The consumer application also controls the stage of the collection we want to view, e.g. in the case of the fronts tool whether we want to render draft or live collections.

## Data types in the library

There are a few data types in this library which represent articles and collections.
There are types to represent articles and collections before they are normalised, after
they are normalised and finally, a data type to represent an article in a way that it can
be rendered by a component.

Here are the data types used in the shared library:

### Collection

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

### CollectionResponse

The `CollectionResponse` type represents collections as they are stored in facia tool or story packages.
They are different from `Collections` because they have not yet been normalised. A consumer application does
not have to store collections in the form of the `CollectionResponse` as long as they provide a way of transforming
the stored collections in the type `Collection` which the shared curation library can understand.

### Cards

Cards contain information about the article created by
the collections tool: when was it added to a live collection, who did this,
are any of the fields (e.g. headline, trail)  present in the external article
overriden. These overrides are stored in the `Meta` object.

These cards take the following shape:

```
type Card = {
  uuid: string, // Refers to the article ids inside a collection
  id: string, // Article id in the external store e.g. capi id
  frontPublicationDate: number,
  publishedBy: string,
  meta: Meta
};
```

### Nested Cards

Nested cards represent cards are they appear in collections prior to
normalisation. They look like cards but are missing a uuid.

### External Articles
External articles represent the articles as they exist in external to your application e.g. in the content api.

They look like this:

```
type ExternalArticle = {
  id: string,
  headline: string
};
```

### Articles

Articles represent the articles which are being rendered by
the components. They hold all the information needed to render an article.
They are selected from the state by combining cards with
external articles. If the card metadata contains any overrides,
these override the external article data.

## Using the library

### Fetching data

To use the library, you have to dispatch three actions: `cardsReceived`, `externalArticlesReceived` and `collectionReceived` actions.

`externalArticlesReceived` expects a payload that is an object, which has external article ids as keys and external articles as values.


Note that the articles in the Collection are stored as an array of ids. The articles that these ids refer to should be passed to the `cardsReceived` action.

`cardsReceived` expects in it's payload on object where keys are Card uuids and values are the cards themselves.

`collectionReceived` action expects a collection in its payload.

We provide an utility function `normaliseCollectionWithNestedArticles` to generate collections and cards from collections which have a shape similar to the collections as they appear in the fronts tool.

### Usign the collections component

Once all the collections and articles have been stored in the state, using the collections library is easy. Simply pass the collection id and stage (e.g. live or draft) of articles you want shown to the `Collection` component:

```
 <Collection id={id} stage={stage} />
```

### Configuration

TOO: We don't have any configurable settings yet.
