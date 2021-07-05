#!/usr/bin/env bash

echo "Fetching config from S3 for Play App"

set -e

# colours
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # no colour - reset console colour

CONFIG_DIR=/etc/gu

downloadConfig() {
  aws s3 cp s3://facia-private/facia-tool.application.secrets.local.conf ${CONFIG_DIR}/facia-tool.application.secrets.conf --profile cmsFronts
  aws s3 cp s3://facia-private/facia-tool.local.properties ${CONFIG_DIR}/facia-tool.properties --profile cmsFronts
}

if [[ -w ${CONFIG_DIR} ]]; then
  downloadConfig
  echo -e "${GREEN}Done ${NC}"
else
  echo "Cannot write to ${CONFIG_DIR}. It either doesn't exist or is not owned by $(whoami)."

  if [[ $1 = "--allow-creation" ]]; then
    echo "Creating ${CONFIG_DIR} and making user $(whoami) the owner"
    sudo mkdir -p ${CONFIG_DIR}
    sudo chown -R $(whoami):admin ${CONFIG_DIR}
    downloadConfig
    echo -e "${GREEN}Done ${NC}"
  else
    echo -e "${RED}Error. Re-run this script with flag --allow-creation ${NC}"
    exit 1
  fi
fi
