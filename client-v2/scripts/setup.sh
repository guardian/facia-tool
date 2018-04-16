#!/usr/bin/env bash
cd "$(dirname "$0")"

printf "\n\rSetting up Fronts Tool V2 dependencies... \n\r\n\r"

installed() {
  hash "$1" 2>/dev/null
 }

install_yarn() {
  if ! installed yarn; then
    echo -e "\r\n\r\n${red}yarn not found: please install yarn from https://yarnpkg.com/${plain}\r\n"
    echo -e "Yarn is required to ensure developers use consistent JS dependencies"

    exit 1
  fi
}

set_node_version() {
  if ! installed nvm; then
    cd ..
    node_version=`cat .nvmrc`
    echo -e "\r\n\r\n${yellow}nvm not found: please ensure you're using node $node_version\r\n"
    echo -e "NVM is not required to run this project, but we recommend using it to easily manage node versions"
    echo -e "Install it from https://github.com/creationix/nvm#installation\r\n\r\n"
  else
    source ~/.nvm/nvm.sh
    nvm use
  fi
}

install_deps_and_build() {
  yarn install
  printf "\nCompiling Javascript... \n\r\n\r"
  yarn build
}

main() {
  install_yarn
  set_node_version
  install_deps_and_build
  printf "\n\rDone.\n\r\n\r"
}

main
