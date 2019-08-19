#!/usr/bin/env bash
yellow='\033[1;33m'
nocolour='\033[0m'

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
    echo -e "${yellow}nvm not found: please ensure you're using node $node_version\r\n"
    echo -e "${nocolour}NVM is not required to run this project, but we recommend using it to easily manage node versions"
    echo -e "Install it from https://github.com/creationix/nvm#installation\r\n\r\n"
  else
    source "$NVM_DIR/nvm.sh"
    nvm use
  fi
}

install_deps_and_build() {
  cd client-v2
  yarn install
  printf "\nCompiling Javascript... \n\r\n\r"
  yarn build
  cd ..
}

setup_ngnix() {
  brew install guardian/devtools/dev-nginx
  dev-nginx setup-app nginx/nginx-mapping.yml
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

main() {
  bash $DIR/fetch-config.sh
  install_yarn
  set_node_version
  install_deps_and_build
  setup_ngnix
  printf "\n\rDone.\n\r\n\r"
}

main
