#!/usr/bin/env bash

IS_DEBUG=false
for arg in "$@"
do
    if [[ "$arg" == "--debug" ]]; then
        IS_DEBUG=true
        shift
    fi
done

printf "\n\rStarting Yarn... \n\r\n\r"

yarn watch &

printf "\n\rStarting Postgres... \n\r\n\r"
docker-compose up -d &

cd ..

printf "\n\rStarting Play App... \n\r\n\r"

if [[ "$IS_DEBUG" = true ]] ; then
  sbt -jvm-debug 5005 "run"
else
  sbt "run"
fi

