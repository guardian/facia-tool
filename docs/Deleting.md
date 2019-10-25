Open the issue you need to delete, then open the javascript console and paste the following:

```
await fetch("/editions-api/issues/" + window.location.href.substring(window.location.href.lastIndexOf('/') + 1), {"credentials": "include", "method": "DELETE"});

```
