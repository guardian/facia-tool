#!/usr/bin/env bash

echo "Are you sure you want to wipe everything from your local setup?"
echo "Enter 'yes' to continue, enter any other value to exit without wiping."

read CONFIRM

SCRIPT_PATH=$( cd $(dirname $0) ; pwd -P )

if [ "$CONFIRM" = "yes" ]; then
    docker-compose -f "${SCRIPT_PATH}/../docker-compose.yml"  down -v
fi