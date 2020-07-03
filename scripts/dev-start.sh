#!/usr/bin/env bash

set -e

NO_DEBUG=false
for arg in "$@"
do
    if [[ "$arg" == "--no-debug" ]]; then
        NO_DEBUG=true
        shift
    fi
done

hasCredentials() {
  STATUS=$(aws sts get-caller-identity --profile cmsFronts 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "Credentials for the cmsFronts profile are expired. Please fetch new credentials and run this again."
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") || ${STATUS} =~ ("Unable to locate credentials") ]]; then
    echo -e "Credentials for the cmsFronts profile are missing. Please ensure you have the right credentials."
    exit 1
  fi
}

main() {
    hasCredentials

    printf "\n\rStarting Yarn... \n\r\n\r"

    cd fronts-client
    yarn watch &
    cd ..

    printf "\n\rStarting Postgres... \n\r\n\r"
    docker-compose up -d

    printf "\n\rStarting Play App... \n\r\n\r"

    export SBT_OPTS="-XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=4G -Xmx4G"

    if [[ "$NO_DEBUG" = true ]] ; then
      sbt "run"
    else
      sbt -jvm-debug 5005 "run"
    fi
}

main

