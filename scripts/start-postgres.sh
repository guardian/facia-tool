#!/usr/bin/env bash

COLOR_RED='\x1B[0;31m'
COLOR_RESET='\x1B[0m'

SCRIPT_PATH=$( cd $(dirname $0) ; pwd -P )
DB_SETUP="${SCRIPT_PATH}/setup/database.sql"

export PGPASSWORD=faciatool

docker-compose -f "${SCRIPT_PATH}/../docker-compose.yml" up -d

until pg_isready -h localhost -p 5432 -d faciatool -U faciatool > /dev/null
do
    echo "Waiting for Postgres..."
    sleep 1
done

echo "Postgres ready! Checking if setup is needed..."

SETUP_HASH=$(md5 -q "${DB_SETUP}")

EXISTS_QUERY="SELECT EXISTS ( SELECT 1 FROM information_schema.tables WHERE table_name = 'manifest' )"
TABLE_EXISTS=$(psql -h localhost -p 5432 -U faciatool -d faciatool -t -c "${EXISTS_QUERY}" | xargs)

if [ "$TABLE_EXISTS" = "f" ]
then
    echo "    > Database has not been setup!"
    echo "    > Setting up database..."
    psql -h localhost -p 5432 -U faciatool -d faciatool -t -f "${DB_SETUP}" > /dev/null
    echo "    > Setup exit code = $?"

    INSERT_DB_HASH_QUERY="INSERT INTO manifest (key, value) VALUES ('setup_hash', '${SETUP_HASH}')"
    psql -h localhost -p 5432 -U faciatool -d faciatool -t -c "${INSERT_DB_HASH_QUERY}" > /dev/null
else
    DB_SETUP_HASH_QUERY="SELECT value FROM manifest WHERE key = 'setup_hash'"
    DB_SETUP_HASH=$(psql -h localhost -p 5432 -U faciatool -d faciatool -t -c "${DB_SETUP_HASH_QUERY}" | xargs)

    if [ "$DB_SETUP_HASH" != "$SETUP_HASH" ]
    then
        echo -e "${COLOR_RED}"
        echo "    > WARNING!"
        echo "    > --------"
        echo "    > Database has been set up but the version appears to mismatch!"
        echo "    > Continuing may result in unexpected behaviour"
        echo "    > You may want to delete your database using 'scripts/delete-local-db'"
        echo -e "${COLOR_RESET}"
    fi
fi

#echo ""
#echo 'Starting faciatool server!'
#pushd "${BACKEND_PATH}" > /dev/null
#sbt run -jvm-debug 5005
#popd > /dev/null
