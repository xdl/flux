#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$( dirname $SCRIPT_DIR)

mkdir -p $ROOT_DIR/preview

echo "copying over examples from $ROOT_DIR/examples to $ROOT_DIR/preview ..."

cp $ROOT_DIR/examples/* $ROOT_DIR/preview

echo "done"
