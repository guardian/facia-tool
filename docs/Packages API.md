# Fronts tool packages API

## What is a "package" ?

A package is simply a curated list of content.  A "story package" contains article references; a "recipe package"
contains references to recipes, chefs or subcollections and is intended for the Feast recipe app.

A package differs from a container, in that a container must live in a front and that front must either live
in S3 or in an Edition.  A package simply lives in the database and is referenced by it's ID.

### Story packages

Story packages are currently handled by the story packages tool - https://packages.gutools.co.uk/.  This tool is EOL
and there is an intention to move the functionality into the Fronts Tool in order to ease the maintenance burden.

Therefore, the backend API for packages is written to accept story packages for Web or recipe packages for Feast;
but only the Feast functionality is currently used in the frontend.  The backend story package functionality should be
considered as a stub.

### Recipe packages

Recipe packages power the Feast feature known as "Guardian Selections" in the Feast app.  They are semi-permanent curated
collections of Feast information used for deep-linking in newsletters, in push notifications, etc.  The usages are
deliberately broad in order that MRR and Editiorial can use them however they want.

## API design

The API is designed to mirror the editions-api as closely as possible, in order to facilitate re-use of frontend
code.

- `PUT /packages/:id/metadata` mirrors `PUT /editions-api/fronts/:frontId/metadata` - it accepts a JSON blob of
either `FeastPackageMetadata` or `WebPackageMetadata` and overwrites the usage-specific metadata fields with this information
- `PUT /packages/:id/is-hidden/:state` mirrors `PUT /editions-api/fronts/:frontId/is-hidden/:state` - it takes no body content,
and updates the `hidden` flag on the package.  The interpretation of the flag is up to the rendering app; in Feast,
this means that the package should not be shown on any fronts.
- `PATCH /packages/:id/name` mirrors `PATCH /editions-api/collections/:collectionId/name` - it takes a UTF-8 string of
the new package name and updates just this field
- `PATCH /packages/:id/update-regions` mirrors `PATCH /editions-api/collections/:collectionId/update-regions` - it accepts a
JSON blob of `UpdateRegionsRequest` and overwrites the region-targeting part of the Feast metadata. Only valid for Recipe
Packages and effectively a no-op for Story Packages, since they do not have the relevant targetting fields
- `GET /packages/:id` mirrors `GET /editions-api/issues/:id` - it retrieves the metadata and content of the package. Note
that the payload format is quite different, because a package is similar to a single container rather than an entire issue
composed of fronts and containers
- `PUT /packages/:id` mirrors `PUT /editions-api/collections/:collectionId` - it accepts a JSON blob of
`ClientPackage` and overwrites the entire package with the new data.
- `GET /packages` works like `GET /editions-api/editions/:edition/issues` but accepts more query parameters in order
to make it easier for users to manage a large set of packages that don't live within a small set of containers
- `POST	/packages` works like `POST /editions-api/editions/:edition/issues` - it accepts a JSON blob of
`CreatePackageRequest` and creates a new package with that information.  There is a crucial difference, though -
it expects to receive a UUID for the new package from the frontend and will return 409 Conflict if that UUID already
exists on another package
