#!/usr/bin/env bash
sudo mkdir -p /etc/gu
sudo aws s3 cp s3://facia-private/facia-tool.application.secrets.local.conf /etc/gu/facia-tool.application.secrets.conf --profile cmsFronts
sudo aws s3 cp s3://facia-private/facia-tool.local.properties /etc/gu/facia-tool.properties --profile cmsFronts
