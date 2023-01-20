#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"/..
deno run --allow-read --allow-env --allow-run --allow-write=build buildtools/script/build.ts