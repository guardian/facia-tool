# Fronts tool packages API

## What is a "package" ?

A package is simply a curated list of content.  A "story package" contains article references; a "recipe package"
contains references to recipes, chefs or subcollections and is intended for the Feast recipe app.

A package differs from a container, in that a container must live in a front and that front must either live
in S3 or in an Edition.  A package simply lives in the database and is referenced by its ID.

The package model contains only the bare bones which are common to all packages - ID, name, package type, hidden flag etc.
Any platform-specific information goes in the `metadata` field, which is optional and is a different shape depending on
the package type - see [app/model/packages/PackageMetadata.scala](../app/model/packages/PackageMetadata.scala).

Packages are defined as implementations of a sealed trait in [app/model/packages/Package.scala](../app/model/packages/Package.scala)

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
  either `FeastPackageMetadata` or `FeastPackageMetadata` and overwrites the usage-specific metadata fields with this information
- `PUT /packages/:id/is-hidden/:state` mirrors `PUT /editions-api/fronts/:frontId/is-hidden/:state` - it takes no body content,
  and updates the `hidden` flag on the package.  The interpretation of the flag is up to the rendering app; in Feast,
  this means that the package should not be shown on any fronts.
- `PATCH /packages/:id/name` mirrors `PATCH /editions-api/collections/:collectionId/name` - it takes a UTF-8 string of
  the new package name and updates just this field
- `PATCH /editions-api/collections/:collectionId/update-regions` - has been left out for the time being. Target regions
  are a specific property of Feast packages and the current UI design will write this with the other metadata in one go
  so a dedicated endpoint is not needed
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

## Package lifecycle

id: Option[String], full:Option[Boolean], `type`: Option[String], date:Option[String],strict:Option[Boolean],title:Option[String],limit:Option[Int],order:Option[String]

1. A package is created by making a POST request to /packages with a JSON body in the shape `CreatePackageRequest`.
The caller must provide a UUID which will act as the permanent ID of the package; if this ID is already used then the
backend will respond with a 409 Conflict and will not create the package
2. If a caller has the UUID of a package then it can retrieve the package information and content by calling GET /packages/:id
3. Alternatively, a caller can call GET /packages to list up to the most recent 500 packages in reverse-chronological order with
any of the following filters and options as query parameters:
  - `id` (list of UUIDs, comma separated) - return information about the packages with the given IDs only
  - `full=true` - return all cards for each package in addition to the package information. A more expensive database call.
  - `type` - return only packages of the given type. Must be a recognised `PackageType` - currently `Feast` or `Story`.
  - `date={iso-date}` & `strict=true` - if `strict` is true, then only return packages authored on the given date.
If `strict` is false or not present, return packages authored on or before the given date
  - `title` - filter for packages whose name includes the given string
  - `limit` - limit the number of packages returned, up to 500
  - `order` - order by Created date (default), Modified date or Title
4. A caller can update the package information and content in one go ("save button") by calling PUT /packages/:id
5. Alternatively, the name, package-dependent metadata and hidden flag can be updated without touching the rest of the package
information.  More edit-in-place endpoints will be provided as needed
