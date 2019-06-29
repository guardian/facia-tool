#!/usr/bin/env bash

NO_DEBUG=false
for arg in "$@"
do
    if [[ "$arg" == "--no-debug" ]]; then
        NO_DEBUG=true
        shift
    fi
done

printf "\n\rStarting Yarn... \n\r\n\r"

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

