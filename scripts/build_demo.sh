SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$( dirname $SCRIPT_DIR)

pushd $ROOT_DIR

mkdir -p dist &&
cp demo/index.html dist/index.html &&
cp -r assets dist &&
webpack

popd
