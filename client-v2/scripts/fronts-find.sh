#!/usr/bin/env bash

git grep $1 ':!*bbcSectionPage.ts' ':!*guardianTagPage.ts' ':!*snap-tag-page.js'
