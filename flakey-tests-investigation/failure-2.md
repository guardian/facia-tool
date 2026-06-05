Run grunt --stack validate
Running "eslint:static" (eslint) task

/home/runner/work/facia-tool/facia-tool/public/src/js/constants/defaults.js
Warning:    78:31  warning  Unexpected trailing comma  comma-dangle
Warning:   280:62  warning  Unexpected trailing comma  comma-dangle

✖ 2 problems (0 errors, 2 warnings)
  0 errors and 2 warnings potentially fixable with the `--fix` option.


Done.


Execution Time (2026-05-26 16:17:21 UTC)
loading tasks  297ms  ▇▇▇▇▇▇▇ 13%
eslint:static   1.9s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 87%
Total 2.2s

Running "test" task

Running "karma:static" (karma) task
Chrome Headless 112.0.5614.0 (Linux x86_64) INFO LOG: 'Google Analytics tracking has been disabled'

  utils/snap
    ✓ validate a snap
    ✓ generates an id

  Article Path
    ✓ returns correct path if url is from  guardian website
    ✓ returns correct path if url is from viewer preview
    ✓ returns correct path if url is from viewer live

  utils/serialize-query-params
    ✓ serializes the search query

  utils/human-time
    ✓ converts to a readable time

  utils/remove-by-id
    ✓ remove elements

  Latest articles errors
    ✓ hides some errors when page is already loaded
    ✓ doesn't stop page load

  Global listeners
    ✓ handles global events

  utils/find-first-by-id
    ✓ find by id

  Cache
    ✓ returns undefined on error
    ✓ stores until expiry

  utils/sanitize-html
    ✓ cleans the html

  Last Modified
    ✓ fetches a stale date
    ✓ fetches the last time

  Authed Ajax
    tries again for auth
      ✓ fails while reauth
      ✓ fails on second try
      ✓ works on second try
    ✓ fails with a reload redirect
    ✓ sends a successful request override type
    ✓ sends a successful request
    ✓ fails with an un-handled error
    ✓ sends a successful request override content type

  Visited Article Storage
    addArticleToStorage
      ✓ adds an article to storage
      ✓ should add an article to storage only once
    isArticleVisited
      ✓ shoud return true for visited articles
      ✓ shoud return false for unvisited articles

  Breaking News
    ✗ Alerts the user before launch
	Failed: edit action timeout, endpoint /edits
	Error: edit action timeout, endpoint /edits
	    at eval (http://localhost:9876/test/utils/actions/base-action.js!transpiled:34:50)

    ✓ Allows the same alert to be sent multiple times

  utils/populate-observables
    ✓ populate observables

  Content API
    fetchMetaForPath
      ✓ extract meta from the response
      ✓ fails if meta no response
    fetchContent
      ✓ returns from other fields
      ✓ fails if no response
      ✓ fails with empty intersection
      ✓ fails with status error
      ✓ returns from content
    ✓ decorateItems empty
    ✓ decorateItems in multiple batches
    ✓ decorateItems in one batch
    validateItem
      ✓ validates multiple snap results - latest
      ✓ validates multiple snap results - link
      ✓ fails on snaps not in the clipboard
      ✓ resolves from cache
      ✓ resolves a single malformed capi item
      ✓ fails on links coming from self
      ✓ validates empty guardian content
      ✓ fails on a relative snap
      ✓ validates a snap that contains a type
      ✓ validates multiple snap link
      ✓ resolves a single valid capi item
      ✓ resolves a snapID

  utils/front-count
    ✓ counts fronts without priority
    ✓ counts fronts with any priority
    ✓ counts fronts with no limits
    ✓ defaults to editorial priority

  Priority
    ✓ gets the priority from URL

  Layout
    ✓ changes the workspace

  Media Service
    ✓ drags an image from the grid

  utils/parse-query-params
    URL Parameters as array
      ✓ parses an url as an array
    URL Parameters
      ✓ parses an url with multiple parameters
      ✓ parses an url with duplicate parameters
      ✓ parses an url with no parameters
      ✓ parses an url with hash
      ✓ parses an empty string

  Ajax Collections update
    fails
      ✓ updates a failing collection
    works
      ✓ updates and remove
      ✓ removes a treat
      ✓ updates a collection

  Sparklines
    ✓ loads sparklines for a front
    ✓ handles changing fronts while loading collections
    ✓ refreshes when the collection changes
    ✓ handles changing fronts while loading sparklines
    ✓ fails nicely when ophan is down
    ✓ loads sparklines on multiple fronts and polls

  Mediator
    ✓ handles scopes

  Latest widget
    ✓ toggles draft and live content
    ✓ reacts to switches changes
    ✓ pagination
    ✓ searches articles

  Bootstrap
    ✓ fails in the every callback
    ✓ loads all endpoints correctly
    ✓ fails on network error
    ✓ fails validation

  Article Persistence
    ✓ save the parent article on sublinks
    ✓ ignores saving in the clipboard
    ✓ updates the parent collection

  Router
    load
      ✓ correctly
      ✓ fails
    parse location
      ✓ with priority and handler
      ✓ with search parameters
      ✓ with priority
      ✓ with priority and wrong handler
      ✓ from default
    navigate
      ✓ popstate
      ✓ from an empty search
      ✓ does not navigate if the url doesn't change
      ✓ keeping the existing parameters

  utils/layout-from-url
    ✓ gets the default configuration ignoring unknown params
    ✓ respects the front parameter
    ✓ serializes a layout
    ✓ extract from an object
    ✓ gets the default configuration
    ✓ gets the configuration form URL
    ✓ gets the default configuration by path
    ✓ gets an empty configuration
    ✓ shows treats if required
    ✓ respects the front parameter for the path
    ✓ gives priority to layout over front

  Logger
    ✓ logs an error
    ✓ logs a message

  Base Widget
    ✓ unsubscribes the correct class
    ✓ unsubscribes any registered callback

  utils/url-query
    ✓ extract the search query

  OAuth Session
    ✓ redirects on timeout
    ✓ re-authenticate every once in a while

  utils/url-host
    ✓ extract the domain

  Visited articles
    ✓ displays article as visited after redrawing data
    ✓ marks an article visited from clipboard as visited in visited articles list
    ✓ marks an article visited from visited articles list as visited

  Latest articles
    ✓ network fail
    ✓ searches an article
    ✓ whole list should filter out articles
    ✓ filter out based on a search term
    ✓ all results empty response

  Config
    ✓ allows for searching fronts
    ✓ /config/fronts

  utils/clean-code
    ✓ clones objects

  Collection Backfill - API query
    ✓ shows error message on invalid CAPI query
    ✓ shows list on valid CAPI query
    ✓ goes from success to error on CAPI change
    ✓ shows no match list on empty valid CAPI query

  Autocomplete
    Widget
      ✓ clears the search on empty filter
      ✓ scrolls indefinitely
      ✓ searches debouncing
    API
      ✓ handles missing results
      ✓ rejects malformed response
      ✓ uses the cache
      ✓ returns expected results
      ✓ rejects invalid characters
      ✓ ignores empty strings

  Validate images
    - from image CDN
      ✓ fails if the image can't be found
      ✓ fails if the image is too big
      ✓ fails if the image is too small
      ✓ works with if all criteria are met
      ✓ fails if the aspect ratio is wrong
      ✓ works with no criteria
    - from imgIX
      ✓ strips unnecessary parameters
    - invalid
      ✓ missing images
      ✓ unknown domain
    - from copy paste event
      ✓ resolves correctly when it contains a URL
      ✓ fails when no suitable assets
      ✓ resolves correctly
      ✓ fails with invalid item
      ✓ fails when the actual image doesn't validate
    - from the Grid
      ✓ fails if media is not accessible
      - link does not include crop id
        ✓ gets the first asset when no criteria
        ✓ fails if there are no crops
        ✓ gets the first valid asset
        ✓ fails if crops don't respect criteria
      - link include crop id
        ✓ gets the specified asset
        ✓ fails if crop doesn't respect criteria
        ✓ fails if crop id is invalid

  Debounce
    ✓ handles parameters
    ✓ dispose debounce
    ✓ debounces on rejected failures
    ✓ waits and calls the last bounced method

  Serialize Article Meta
    ✓ drops empty arrays
    ✓ cleans sparse array
    ✓ serializes supporting links
    ✓ converts number to strings
    ✓ ignore empty meta data
    ✓ includes the group index
    ✓ converts number to strings in nested structures
    ✓ explicit about values equal to their default
    ✓ ignores values equal to the overridden field
    ✓ trim and sanitize strings

  Alert
    ✓ shows an error

  Front
    ✓ loads from column config and toggle live and draft content
    ✓ load a front from the select and toggle collection visibility
    ✓ displays a warning if front is hidden 
    ✓ does not display a warning if the front is not hidden 

  Draggable element
    getItem
      ✓ gets an item from the source item
      ✓ fails if there's no media and no item
      ✓ gets a media item if present
      ✓ gets an item from known parameters
      ✓ gets an item from unknown parameters
    getMediaItem
      ✓ returns the largest image
      ✓ throws when there's no crop
      ✓ ignores non JSON data
      ✓ ignore empty items

  Editors
    ✓ validates inputs
    ✓ toggles boolean values
    ✓ list editor with drop in editor

  Config Pinned Front
    ✓ keeps editing existing fronts while refreshing
    ✓ keeps the pinned front while refreshing

  Collections
    ✓ copy paste above an article
    ✓ closes without saving
    ✓ copy to clipboard
    ✓ displays the correct timing
    ✓ /edits

  utils/as-observable-props
    ✓ generates observables

  utils/url-abs-path
    ✓ extracts the path name

  Array
    ✓ works even if first is an empty array
    ✓ works even if second is an empty array
    ✓ computes the difference of two lists

  Config Front
    ✓ updates fronts and collections when config changes
    ✓ create fronts and collections

  Open Graph
    ✓ handles failures
    ✓ fetches data from open graph - off site
    ✓ fetches data from innerHTML - off site
    ✓ fetches data from site - guardian

  Copied articles
    ✓ stores the last copied article
    ✓ handles field headline
    ✓ handles snap links
    ✓ detaches from source

  Clipboard
    ✓ global copy paste events
    ✓ loads items from the history

  utils/is-guardian-url
    ✓ matches guardian domain

  Presser
    ✓ presses draft
    ✓ ignores error in press
    ✓ presses live successfully

  Alternate Drag
    ✓ replace article and drags sublinks

  Modal Dialog
    ✓ calls the ok function

  Persistence
    ✓ updates a front
    ✓ creates a front
    ✓ creates a collection with display hints
    ✓ creates a collection
    ✓ updates a collection

  utils/full-trim
    ✓ trims strings

  utils/clone-with-key
    ✓ clones and adds a key

  Extensions
    ✓ nav section

  Local Storage
    ✓ retrieves with defaults
    ✓ removes some error

  utils/sanitize-api-query
    ✓ cleans the query

  utils/deep-get
    ✓ gets from a deep object

  Collection Backfill - Parent collection
    ✓ shows error message when dragging invalid links
    ✓ reverts to the api query
    ✓ removes a valid collection
    ✓ drags a valid collection

Chrome Headless 112.0.5614.0 (Linux x86_64): Executed 242 of 242 (1 FAILED) (32.806 secs / 32.694 secs)
TOTAL: 1 FAILED, 241 SUCCESS


1) Alerts the user before launch
     Breaking News
     Failed: edit action timeout, endpoint /edits
Error: edit action timeout, endpoint /edits
    at eval (http://localhost:9876/test/utils/actions/base-action.js!transpiled:34:50)




Warning: Task "karma:static" failed. Use --force to continue.
Error: Task "karma:static" failed.
    at Task.<anonymous> (/home/runner/work/facia-tool/facia-tool/node_modules/grunt/lib/util/task.js:198:15)
    at Timeout._onTimeout (/home/runner/work/facia-tool/facia-tool/node_modules/grunt/lib/util/task.js:234:33)
    at listOnTimeout (node:internal/timers:559:17)
    at processTimers (node:internal/timers:502:7)


Aborted due to warnings.


Execution Time (2026-05-26 16:17:23 UTC)
karma:static  39.1s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 99%
Total 39.4s

Error: Process completed with exit code 3.