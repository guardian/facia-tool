# Data types in the fronts-client

There are several data types in this tool which represent articles and collections.
There are types to represent articles and collections before they are normalised, after
they are normalised and a data type to represent an article so that it can
be rendered by a component.

These are some of the most important ones:

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
They are different from `Collections` because they have not yet been normalised.

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

Nested cards represent cards are they appear in collections prior to normalisation. They look like cards but are missing a uuid.

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

Articles represent the articles rendered by the components. They hold all the information needed for rendering.
They are created from the state by combining cards with external articles. If the card metadata contains any overrides, these override the external article data.
