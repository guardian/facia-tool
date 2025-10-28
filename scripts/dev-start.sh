#!/usr/bin/env bash

set -e

NO_DEBUG=false
for arg in "$@"
do
    if [[ "$arg" == "--no-debug" ]]; then
        NO_DEBUG=true
        shift
    fi
done

cleanup() {
    echo "Cleaning up background processes..."
    YARN_PID=$(pgrep -f "yarn.*watch")
    if [ ! -z "$YARN_PID" ]; then
        echo "Killing yarn watch process (PID: $YARN_PID)"
        kill $YARN_PID
    else
        echo "No yarn watch process found"
    fi
}

trap cleanup EXIT

hasCredentials() {
  STATUS=$(aws sts get-caller-identity --profile cmsFronts 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "Credentials for the cmsFronts profile are expired. Please fetch new credentials and run this again."
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") || ${STATUS} =~ ("Unable to locate credentials") ]]; then
    echo -e "Credentials for the cmsFronts profile are missing. Please ensure you have the right credentials."
    exit 1
  fi
}

runNginx() {
  if pgrep -f nginx >/dev/null; then
    echo "nginx is already running"
  else
    echo "nginx isn't running, booting now..."
    dev-nginx restart
  fi
}

checkJavaVersion() {
    REQUIRED_JAVA_VERSION="11"
    MAJOR_JAVA_VERSION=$(java -version 2>&1 | awk -F[\"_] '/version/ {print $2}' | cut -d '.' -f1)
    if [[ "$MAJOR_JAVA_VERSION" != "$REQUIRED_JAVA_VERSION" ]]; then
        echo -e "Incorrect Java version: requires Java $REQUIRED_JAVA_VERSION but found Java $MAJOR_JAVA_VERSION."
        exit 1
    else
        echo "Correct Java version ($MAJOR_JAVA_VERSION) is installed."
    fi
}

set_node_version() {
	## Check which Node version manager is available and use it
	if command -v mise >/dev/null 2>&1; then
		echo "Using mise"
		eval "$(mise activate bash)"
	elif command -v nvm >/dev/null 2>&1; then
		echo "Using nvm"
		nvm use
	elif command -v fnm >/dev/null 2>&1; then
		echo "Using fnm"
		fnm use
	else
		echo -e "${RED}No Node version manager (mise, nvm, fnm) found.${NOCOLOUR}"
		exit 1
	fi

  runningNodeVersion=$(node -v)
  requiredNodeVersion=$(cat .nvmrc)

  echo "Running ${runningNodeVersion}"
  echo "Required ${requiredNodeVersion}"

  if [ "$runningNodeVersion" != "$requiredNodeVersion" ]; then
    echo -e "${red}Using wrong version of Node. Required ${requiredNodeVersion}. Running ${runningNodeVersion}.${plain}."
    exit 1
  fi
}

main() {
    checkJavaVersion
    runNginx
    hasCredentials

    printf "\n\rStarting Yarn... \n\r\n\r"

    cd fronts-client
    set_node_version
    yarn watch &
    sleep 1
    cd ..
    set_node_version

    printf "\n\rStarting Postgres... \n\r\n\r"
    docker compose up -d

    printf "\n\rStarting Play App... \n\r\n\r"

    export SBT_OPTS="-XX:+CMSClassUnloadingEnabled -Xmx4G -Xss4m"

    if [[ "$NO_DEBUG" = true ]] ; then
      sbt "run"
    else
      sbt -jvm-debug 5005 "run"
    fi
}

main


}
