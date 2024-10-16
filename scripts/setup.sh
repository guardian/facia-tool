#!/usr/bin/env bash

set -e

# colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NOCOLOUR='\033[0m'



CONFIG_DIR=/etc/gu
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

printf "\n\rSetting up Fronts Tool dependencies... \n\r\n\r"

fileExists() {
  test -e "$1"
}

check_yarn_installed() {
  if ! [ -x "$(command -v yarn)" ]; then
    echo -e "\r\n\r\n${red}yarn not found: please install yarn from https://yarnpkg.com/${plain}\r\n"
    echo -e "Yarn is required in the fronts-client directory to ensure developers use consistent JS dependencies"

    exit 1
  fi
}

set_node_version() {
  echo "Attempting to set node version."
  echo "Trying nvm" && nvm use || echo "Couldn't find nvm. Trying fnm" && fnm use

  runningNodeVersion=$(node -v)
  requiredNodeVersion=$(cat .nvmrc)

  if [ "$runningNodeVersion" != "$requiredNodeVersion" ]; then
    echo -e "${red}Using wrong version of Node. Required ${requiredNodeVersion}. Running ${runningNodeVersion}.${plain}."
    exit 1
  fi
}

install_v2_deps_and_build() {
  cd fronts-client
  set_node_version
  yarn install
  printf "\nCompiling Javascript... \n\r\n\r"
  yarn build
  cd ..
}

printf "\n\rSetting up Breaking News tool (Fronts Tool V1) dependencies... \n\r\n\r"

install_v1_deps() {
    set_node_version
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

configure_git() {
  echo "Configuring git…"
  git config --local blame.ignoreRevsFile .git-blame-ignore-revs
  git config --local core.hooksPath scripts/git-hooks
}

main() {
  fetch_config "$@"
  check_yarn_installed
  install_v1_deps
  install_v2_deps_and_build
  setup_nginx
  configure_git
  printf "\n\rDone.\n\r\n\r"
}

main "$@"
