#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o xtrace
set -o pipefail

if [ "${JS_STEPS}" = "true" ]
then
    npm install --production
    jspm config registries.github.auth ${JSPM_GITHUB_AUTH_SECRET}
    jspm registry export github
    grunt --stack clean install validate test
else
    sbt ++${TRAVIS_SCALA_VERSION} -jvm-opts travis/jvmopts "project facia-tool" compile test assets
fi
