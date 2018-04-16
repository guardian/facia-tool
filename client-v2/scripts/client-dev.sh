#!/usr/bin/env bash
cd "$(dirname "$0")"

printf "\n\rStarting Yarn... \n\r\n\r"

yarn watch &

printf "\n\rStarting Play App... \n\r\n\r"

cd ..
sbt "run"
