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
    yarn run build

    # Temporary steps to inject the client of the v2-prototype branch into the project
    wget https://github.com/guardian/facia-tool/archive/v2-prototype.zip
    unzip v2-prototype.zip
    pushd facia-tool-2-prototype/client-v2
    yarn
    yarn run build-prototype
    popd
    mv facia-tool-2-prototype/public/client-v2/dist-prototype ../public/client-v2/dist-prototype
    rm -r facia-tool-2-prototype
    rm v2-prototype.zip
    # End of temporary steps

    yarn test-integration-ci
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
