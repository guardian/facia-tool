#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o xtrace
set -o pipefail

if [ "${JS_STEPS}" = "false" ]
then
    sbt ++$TRAVIS_SCALA_VERSION -jvm-opts travis/jvmopts "project facia-tool" riffRaffUpload
fi
