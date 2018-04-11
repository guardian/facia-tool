#!/usr/bin/env bash

printf "\n\rStarting Yarn... \n\r\n\r"

yarn watch &

printf "\n\rStarting Play App... \n\r\n\r"

cd ..
sbt "run"
