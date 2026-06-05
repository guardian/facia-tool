Run grunt --stack validate
Running "eslint:static" (eslint) task

/home/runner/work/facia-tool/facia-tool/public/src/js/constants/defaults.js
Warning:    78:31  warning  Unexpected trailing comma  comma-dangle
Warning:   280:62  warning  Unexpected trailing comma  comma-dangle

✖ 2 problems (0 errors, 2 warnings)
  0 errors and 2 warnings potentially fixable with the `--fix` option.


Done.


Execution Time (2026-06-02 08:41:03 UTC)
loading tasks  280ms  ▇▇▇▇▇▇ 12%
eslint:static     2s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 88%
Total 2.3s

Running "test" task

Running "karma:static" (karma) task
Chrome Headless 112.0.5614.0 (Linux x86_64) INFO LOG: 'Google Analytics tracking has been disabled'

  Authed Ajax
    tries again for auth
      ✓ works on second try
      ✓ fails while reauth
      ✓ fails on second try
    ✓ fails with a reload redirect
    ✓ sends a successful request override content type
    ✓ sends a successful request override type
    ✓ fails with an un-handled error
    ✓ sends a successful request

  Article Persistence
    ✓ save the parent article on sublinks
    ✓ updates the parent collection
    ✓ ignores saving in the clipboard

  Config Front
    ✗ create fronts and collections
	Failed: Timeout waiting for condition
	Error: Timeout waiting for condition
	    at check (http://localhost:9876/test/utils/wait.js!transpiled:37:28)


2) searches articles
     Latest widget
     Failed: Cannot read properties of undefined (reading '$component')
TypeError: Cannot read properties of undefined (reading '$component')
    at getAutocomplete (public/test/spec/latest.articles.spec.js!transpiled:45:98)
    at eval (public/test/spec/latest.articles.spec.js!transpiled:118:40)
    at async Promise.all (index 1)



SLOW: 1

5 Slowest: 
1) Config Front create fronts and collections (5693)

Warning: Task "karma:static" failed. Use --force to continue.
Error: Task "karma:static" failed.
    at Task.<anonymous> (/home/runner/work/facia-tool/facia-tool/node_modules/grunt/lib/util/task.js:198:15)
    at Timeout._onTimeout (/home/runner/work/facia-tool/facia-tool/node_modules/grunt/lib/util/task.js:234:33)
    at listOnTimeout (node:internal/timers:559:17)
    at processTimers (node:internal/timers:502:7)


Aborted due to warnings.


Execution Time (2026-06-02 08:41:05 UTC)
karma:static  41.4s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 99%
Total 41.7s

Error: Process completed with exit code 3.