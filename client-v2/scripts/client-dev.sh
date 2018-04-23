#!/usr/bin/env bash
cd "$(dirname "$0")"

printf "\n\rStarting Yarn... \n\r\n\r"

yarn watch &

cd ../..

printf "\n\rStarting Play App... \n\r\n\r"

sbt "run"
