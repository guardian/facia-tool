#!/usr/bin/env bash

set -e

# colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NOCOLOUR='\033[0m'



CONFIG_DIR=/etc/gu

printf "\n\rSetting up Fronts Tool V2 dependencies... \n\r\n\r"

installed() {
  hash "$1" 2>/dev/null
 }

fileExists() {
  test -e "$1"
}

install_yarn() {
  if ! installed yarn; then
    echo -e "\r\n\r\n${red}yarn not found: please install yarn from https://yarnpkg.com/${plain}\r\n"
    echo -e "Yarn is required to ensure developers use consistent JS dependencies"

    exit 1
  fi
}

set_node_version() {

  if ! fileExists "$NVM_DIR/nvm.sh"; then
    node_version=`cat .nvmrc`
    echo -e "${YELLOW}nvm not found: please ensure you're using node $node_version\r\n"
    echo -e "${nocolour}NVM is not required to run this project, but we recommend using it to easily manage node versions"
    echo -e "Install it from https://github.com/creationix/nvm#installation\r\n\r\n"
  else
    source "$NVM_DIR/nvm.sh"
    nvm use
  fi
}

install_v2_deps_and_build() {
  cd fronts-client
  yarn install
  printf "\nCompiling Javascript... \n\r\n\r"
  yarn build
  cd ..
}

printf "\n\rSetting up Breaking News tool (Fronts Tool V1) dependencies... \n\r\n\r"

install_v1_deps() {
    printf "\n\rInstalling NPM modules \n\r\n\r"
    npm install
    printf "\n\rInstalling JSPM modules \n\r\n\r"
    npm run jspm install
}

setup_nginx() {
  brew install guardian/devtools/dev-nginx
  dev-nginx setup-app nginx/nginx-mapping.yml
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

download_config() {
  aws s3 cp s3://facia-private/facia-tool.application.secrets.local.conf ${CONFIG_DIR}/facia-tool.application.secrets.conf --profile cmsFronts
  aws s3 cp s3://facia-private/facia-tool.local.properties ${CONFIG_DIR}/facia-tool.properties --profile cmsFronts
}

fetch_config(){
    if [[ -w ${CONFIG_DIR} ]]; then
        download_config
        echo -e "${GREEN}Done ${NOCOLOUR}"
    else
      echo "Cannot write to ${CONFIG_DIR}. It either doesn't exist or is not owned by $(whoami)."
      if [[ $1 = "--allow-creation" ]]; then
        echo "Creating ${CONFIG_DIR} and making user $(whoami) the owner"
        sudo mkdir -p ${CONFIG_DIR}
        sudo chown -R $(whoami):admin ${CONFIG_DIR}
        download_config
        echo -e "${GREEN}Done ${NOCOLOUR}"
      else
        echo -e "${RED}Error. Re-run this script with flag --allow-creation ${NOCOLOUR}"
        exit 1
      fi
    fi
}
main() {
  fetch_config "$@"
  install_yarn
  set_node_version
  install_v2_deps_and_build
  install_v1_deps
  setup_nginx
  printf "\n\rDone.\n\r\n\r"
}

main "$@"
