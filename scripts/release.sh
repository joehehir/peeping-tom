#!/bin/sh

# usage: npm run release patch

set -o pipefail;
set -e;

UPDATE_TYPE=$1;
VALID_UPDATE_TYPES=(major minor patch);

# stdout variables
TEXT_COLOR_RED="\033[0;31m"; TEXT_RESET="\033[0m"; WEIGHT_BOLD=$(tput bold); WEIGHT_NORMAL=$(tput sgr0);
PKG_NAME="${PWD##*/}";
SCRIPT_NAME="${0##*/}";
ERR_PREFIX="\n${SCRIPT_NAME} ${TEXT_RED}ERR!${TEXT_RESET}";

# regexp match update type argument
if [[ $(printf "_[%s]_" "${VALID_UPDATE_TYPES[@]}") =~ .*_\[$UPDATE_TYPE\]_.* ]]; then
    git fetch origin;
    git checkout master;
    git pull;

    # increment package version
    VERSION=$(npm version ${UPDATE_TYPE});

    npm ci --silent;
    npm run build;

    # push release
    git add --all;
    git commit -m "${VERSION}" && git tag "${VERSION}" master;
    git push origin master && git push origin "${VERSION}";

    npm publish;

    printf "\n> ${PKG_NAME} ${VERSION} released\n\n";

else printf "${ERR_PREFIX} invalid argument \"${UPDATE_TYPE}\"\n\n";
fi;
