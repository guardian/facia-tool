#!/usr/bin/env bash

set -e

setupNvm() {
    export NVM_DIR="$HOME/.nvm"
    [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"  # This loads nvm

    nvm install
    nvm use
}

globalJsDependencies() {
    npm install -g grunt-cli
    npm install -g yarn
}

javascriptV1() {
    npm install
    npm run jspm config registries.github.auth ${JSPM_GITHUB_AUTH_SECRET}
    npm run jspm registry export github
    npm run jspm install
    grunt --stack validate
    grunt --stack bundle
}

javascriptV2() {
    pushd client-v2

    yarn install
    yarn lint
    yarn test
    yarn test-integration
    yarn run build

    popd
}

riffRaffUpload() {
    sbt clean compile test riffRaffUpload
}

main() {
    setupNvm
    globalJsDependencies
    javascriptV1
    javascriptV2
    riffRaffUpload
}

main
