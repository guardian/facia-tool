System.config({
  baseURL: "/assets",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime"
    ]
  },
  paths: {
    "*": "js/*.js",
    "facia-tool/*": "js/*.js",
    "npm:*": "jspm_packages/npm/*",
    "github:*": "jspm_packages/github/*"
  },

  map: {
    "EventEmitter": "npm:wolfy87-eventemitter@4.3.0",
    "Promise": "npm:native-promise-only@0.8.1",
    "babel": "npm:babel-core@5.8.25",
    "babel-runtime": "npm:babel-runtime@5.8.25",
    "core-js": "npm:core-js@1.2.1",
    "css": "github:systemjs/plugin-css@0.1.18",
    "es5-shim": "github:es-shims/es5-shim@4.1.14",
    "font-awesome": "npm:font-awesome@4.4.0",
    "grid-util-js": "npm:grid-util-js@1.0.5",
    "highcharts": "facia-tool/components/highcharts/highcharts-custom",
    "jquery": "npm:jquery@2.1.4",
    "jquery-mockjax": "npm:jquery-mockjax@2.0.1",
    "jquery-ui": "github:jquery/jquery-ui@1.11.3",
    "knockout": "npm:knockout@3.3.0",
    "numeral": "npm:numeral@1.5.3",
    "panda-session": "github:guardian/panda-session@0.1.5",
    "raven-js": "npm:raven-js@1.1.22",
    "sinon": "npm:sinon@1.17.1",
    "text": "github:systemjs/plugin-text@0.0.2",
    "underscore": "npm:underscore@1.8.3",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.25": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:font-awesome@4.4.0": {
      "css": "github:systemjs/plugin-css@0.1.18"
    },
    "npm:formatio@1.1.1": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "samsam": "npm:samsam@1.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:jquery-mockjax@2.0.1": {
      "jquery": "npm:jquery@2.1.4",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:jquery@2.1.4": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:knockout@3.3.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:native-promise-only@0.8.1": {
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:numeral@1.5.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.2"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:raven-js@1.1.22": {
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:sinon@1.17.1": {
      "formatio": "npm:formatio@1.1.1",
      "lolex": "npm:lolex@1.3.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "samsam": "npm:samsam@1.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:wolfy87-eventemitter@4.3.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2"
    }
  }
});
