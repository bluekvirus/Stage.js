#!/bin/bash
set -e
#publish built doc site to selected repository
#@credit http://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
#
#usage:
#------
#./publish.sh (grab ./build/dist/site/* to ../../Stage.js-site)
#
#or
#
#./publish.sh -r <site repo dir> -d <dist packed folder>
#

while [[ $# > 1 ]]
do
key="$1"

case $key in
    -r|--repository) #key-ed argument
    REPOSITORY="$2"
    shift # go past argument key
    ;;
    -d|--dist)
	DIST="$2"
	shift
	;;
    --default) #flag argument (not used here)
    #DEFAULT=YES
    ;;
    *)
    # unknown key (or no argument key, just argument value directly)
    ;;
esac

shift # past argument key or value
done

REPOSITORY=${REPOSITORY:-"../../Stage.js-site"}
DIST=${DIST:-"./build/dist/site"}

echo publish to REPOSITORY = "$REPOSITORY" from DIST = "$DIST"
EDGEVER=$(git rev-list HEAD --count)

cd "$REPOSITORY"
git pull
rm -r *
cd -
cp -r "$DIST"/* "$REPOSITORY"/
cd "$REPOSITORY"
git commit -am "Updated site and dev-kit to edge $EDGEVER"
git push