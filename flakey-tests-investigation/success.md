Run grunt --stack validate
Running "eslint:static" (eslint) task

/home/runner/work/facia-tool/facia-tool/public/src/js/constants/defaults.js
Warning:    78:31  warning  Unexpected trailing comma  comma-dangle
Warning:   280:62  warning  Unexpected trailing comma  comma-dangle

✖ 2 problems (0 errors, 2 warnings)
  0 errors and 2 warnings potentially fixable with the `--fix` option.


Done.


Execution Time (2026-05-21 14:26:47 UTC)
loading tasks  295ms  ▇▇▇▇▇▇▇ 13%
eslint:static     2s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 87%
Total 2.3s

Running "test" task

Running "karma:static" (karma) task
Chrome Headless 112.0.5614.0 (Linux x86_64) INFO LOG: 'Google Analytics tracking has been disabled'

  Mediator
    ✓ handles scopes

  utils/snap
    ✓ generates an id
    ✓ validate a snap

  utils/as-observable-props
    ✓ generates observables

  Config
    ✓ allows for searching fronts
    ✓ /config/fronts

  Media Service
    ✓ drags an image from the grid

  Autocomplete
    Widget
      ✓ clears the search on empty filter
      ✓ searches debouncing
      ✓ scrolls indefinitely
    getMediaItem
      ✓ ignores non JSON data
      ✓ ignore empty items
      ✓ returns the largest image
      ✓ throws when there's no crop

  Config Front
    ✓ updates fronts and collections when config changes
    ✓ create fronts and collections

  Alert
    ✓ shows an error

  utils/clone-with-key
    ✓ clones and adds a key

  Persistence
    ✓ updates a front
    ✓ creates a front
    ✓ creates a collection with display hints
    ✓ creates a collection
    ✓ updates a collection

  utils/clean-code
    ✓ clones objects

  Config Pinned Front
    ✓ keeps the pinned front while refreshing
    ✓ keeps editing existing fronts while refreshing

Chrome Headless 112.0.5614.0 (Linux x86_64): Executed 242 of 242 SUCCESS (32.145 secs / 32.001 secs)
TOTAL: 242 SUCCESS




Done.


Execution Time (2026-05-21 14:26:50 UTC)
karma:static  37.9s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 99%
Total 38.2s