#! /usr/bin/env bin

csPath=./dist/index.js
filePath="$(pwd)/examples/configs.json"

"$csPath"
# "$csPath" -s "$filePath" # add cronjob looping instruction
# "$csPath" -c             # checks if theres any action to perform
# "$csPath" -l             # shows the available logs
# "$csPath" -r             # remove cronjob looping instruction

# "$csPath" -V             # show version
# "$csPath" -h             # show help