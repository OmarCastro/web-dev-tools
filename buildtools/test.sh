#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"/..
deno test --allow-read=src/ --no-check --allow-net --allow-env --import-map=src/browser-client/test-utils/import_map.json  src/browser-client/unit-tests.spec.ts