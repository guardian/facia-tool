  #!/usr/bin/env bash

set -e

printf "\n\rStarting local S3 (LocalStack)...\n\r"
docker compose up -d localstack

printf "Waiting for LocalStack to be ready"
until AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 --region eu-west-1 s3 ls > /dev/null 2>&1; do
printf "."
sleep 2
done
printf " ready\n\r"

# Create the local bucket (ignore error if it already exists)
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 --region eu-west-1 \
s3 mb s3://facia-tool-store-local 2>/dev/null || true

# Sync CODE prefix from real S3 into a temp dir, then upload to LocalStack
printf "\n\rSyncing s3://facia-tool-store/CODE to local bucket (this may take a moment)...\n\r"
SYNC_TMPDIR=$(mktemp -d)
# Sync only these two folders to avoid fetching the very large 'history' folder
mkdir -p "${SYNC_TMPDIR}/frontsapi/config"
aws s3 sync s3://facia-tool-store/CODE/frontsapi/config "${SYNC_TMPDIR}/frontsapi/config" --profile cmsFronts
mkdir -p "${SYNC_TMPDIR}/frontsapi/collection"
aws s3 sync s3://facia-tool-store/CODE/frontsapi/collection "${SYNC_TMPDIR}/frontsapi/collection" --profile cmsFronts

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 --region eu-west-1 \
s3 sync "${SYNC_TMPDIR}" s3://facia-tool-store-local/CODE
rm -rf "${SYNC_TMPDIR}"

printf "\n\rLocal S3 setup complete. To use local S3, uncomment the aws section in conf/local.conf\n\r"