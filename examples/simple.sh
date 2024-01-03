#! /usr/bin/env bin

csPath=./dist/index.js
filePath="$(pwd)/examples/configs.json"

"$csPath" -s "$filePath"   # add cronjob looping instruction
# "$csPath" -c "$filePath" # checks if theres any action to perform
# "$csPath" -r             # remove cronjob looping instruction

# "$csPath" -V             # show version
# "$csPath" -h             # show help