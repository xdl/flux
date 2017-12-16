SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$( dirname $SCRIPT_DIR)
WEBPACK_BIN=$ROOT_DIR/node_modules/webpack/bin/webpack.js

pushd $ROOT_DIR

mkdir -p dist &&
cp demo/index.html dist/index.html &&
cp -r assets dist &&
$WEBPACK_BIN

popd
