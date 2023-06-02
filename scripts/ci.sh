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
    npm run jspm config registries.github.auth ${JSPM_GITHUB_AUTH_SECRET}
    npm run jspm registry export github
    npm run jspm install
    grunt --stack validate
#    grunt --stack test
    grunt --stack bundle
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
