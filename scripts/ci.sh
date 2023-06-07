#!/usr/bin/env bash

set -e

setupNvm() {
    export NVM_DIR="$HOME/.nvm"
    [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"  # This loads nvm

    nvm install
    nvm use
}

globalJsDependencies() {
    npm install -g yarn #TODO probably should be locked version
}

javascriptV1() {
    npm install
#    grunt --stack test #FIXME reinstate tests
    npm run bundleV1
}

javascriptV2() {
    pushd fronts-client

    yarn install
    yarn lint
    yarn test
    yarn run build
    yarn test-integration-ci

    popd
}

riffRaffUpload() {
    sbt clean compile test database-int:test riffRaffUpload
}

main() {
    docker-compose up -d
    setupNvm
    globalJsDependencies
    javascriptV1
    javascriptV2
    riffRaffUpload
}

main
