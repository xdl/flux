SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$( dirname $SCRIPT_DIR)

cd $ROOT_DIR

#https://webpack.github.io/docs/cli.html
webpack --watch
