#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o xtrace
set -o pipefail

if [ "${JS_STEPS}" = "false" ]
then
    sbt ++$TRAVIS_SCALA_VERSION -jvm-opts travis/jvmopts "project facia-tool" riffRaffUpload
    # Tricks to avoid unnecessary cache updates
    find $HOME/.sbt -name "*.lock" | xargs rm
    find $HOME/.ivy2 -name "ivydata-*.properties" | xargs rm
fi
