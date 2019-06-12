#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

UPPER_STAGE=$( echo "${1}" | awk '{print toupper($0)}' )
LOWER_STAGE=$( echo "${1}" | awk '{print tolower($0)}' )


if [ "${UPPER_STAGE}" != "PROD" ] && [ "${UPPER_STAGE}" != "CODE" ]; then
    echo "Usage: ${0} <PROD | CODE>"
    exit 1
fi

SOCKET_PATH="${DIR}/${LOWER_STAGE}-ssh-tunnel.sock"

RDS_HOST=$(aws rds describe-db-instances --db-instance-identifier facia-${LOWER_STAGE}-db --region eu-west-1 --profile cmsFronts | jq -r .DBInstances[0].Endpoint.Address)

APP_HOST=$(prism stage=${UPPER_STAGE} stack=cms-fronts app=facia-tool -f instanceName | awk '{print $4}' | head -1)
echo "Tunneling to '$RDS_HOST' via '$APP_HOST'"

eval $(ssm ssh --profile cmsFronts -i ${APP_HOST} --raw) -f -N -S "${SOCKET_PATH}" -L 5902:${RDS_HOST}:5432

PASSWORD=$(aws ssm get-parameter --name /facia-tool/cms-fronts/${UPPER_STAGE}/db/password --with-decryption --profile cmsFronts --region eu-west-1 | jq -r .Parameter.Value)

PGPASSWORD=${PASSWORD} psql -h localhost -p 5902 -U faciatool -d faciatool
