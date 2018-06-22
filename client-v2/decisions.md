### Trust issues: updating Collections

We've taken the decision to trust the server when updates to Collections occur and simply accept local changes when we receive valid responses. There are two reasons:

* dropping updated models back into the state forces rerenders, which are unnecessary: a 200 response means 'nothing has changed'.
* incoming collections need to be re-denormalised, which takes time to implement.

There's at least one potential drawback:

* Collections are transformed when leaving or entering the application, and any errors in the code doing this job may result in odd 'syncronisation' issues which don't appear until the next Collection fetch.

If any of the above turn out to be troublesome, we can implement update-on-success behaviour as required.
