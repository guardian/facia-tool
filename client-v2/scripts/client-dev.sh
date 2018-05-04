#!/usr/bin/env bash

printf "\n\rStarting Yarn... \n\r\n\r"

yarn watch &

cd ..

printf "\n\rStarting Play App... \n\r\n\r"

sbt "run"
