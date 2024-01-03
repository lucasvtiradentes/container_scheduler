#! /usr/bin/env bin

filePath="$(pwd)/examples/configs.json"

# ./dist/index.js -s "$filePath"   # add cronjob looping instruction
./dist/index.js -c "$filePath" # checks if theres any action to perform
# ./dist/index.js -r             # remove cronjob looping instruction

# ./dist/index.js -V             # show version
# ./dist/index.js -h             # show help