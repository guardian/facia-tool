#!/bin/sh
set -e

UPPER_STAGE=$( echo "$1" | awk '{print toupper($0)}' )
LOWER_STAGE=$( echo "$1" | awk '{print tolower($0)}' )

if [ "$UPPER_STAGE" != "PROD" ] && [ "$UPPER_STAGE" != "CODE" ]; then
    exit 1
fi

SCRIPT_PATH=$( cd $(dirname $0) ; pwd -P )

${SCRIPT_PATH}/setup-ssh-tunnel.sh "$UPPER_STAGE"

PASSWORD=$(aws ssm get-parameter --name /facia-tool/cms-fronts/${UPPER_STAGE}/db/password --with-decryption --profile cmsFronts --region eu-west-1 | jq -r .Parameter.Value)

PGPASSWORD=$PASSWORD psql -h localhost -p 5902 -U faciatool -d faciatool  << EOF
DROP ROLE IF EXISTS faciatool;
CREATE USER faciatool WITH LOGIN;
GRANT rds_iam TO faciatool;
EOF

 
