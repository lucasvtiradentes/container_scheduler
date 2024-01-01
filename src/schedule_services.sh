#!/bin/bash

# ==============================================================================

CONFIG_JSON_PATH=./scheduler/config.json

if [ "$1" == "-l" ]; then
  crontab -l
  exit 0
elif [ "$1" == "-c" ]; then
  crontab -r
  exit 0
elif [ "$1" == "-e" ]; then
  crontab -e
  exit 0
elif [ "$1" == "-f" ]; then
  CONFIG_JSON_PATH=$2
fi

# ==============================================================================

CONFIG_JSON=$(cat $CONFIG_JSON_PATH)
export CRONJOBS_FILE="/var/spool/cron/crontabs/root"
export TZ=America/Belem
echo -e "Current date and time in $TZ: $(date)\n"

# ==============================================================================

function schedule_cron_job() {
  cron_spec="$1"
  command="$2"
  existing_jobs=$(crontab -l 2>/dev/null || true)

  if ! echo "$existing_jobs" | grep -qF "$cron_spec $command"; then
    (echo "$existing_jobs"; echo "$cron_spec $command") | crontab -
    echo "true"
  else
    echo "false"
  fi
}

function checkIfComposeServiceIsRunning(){
  compose_file=$1
  compose_service=$2

  if [ ! -e "$compose_file" ]; then
    echo "not_found"
    return 0
  fi

  if docker-compose -f "$compose_file" ps | grep -q "$compose_service"; then
    echo "true"
  else
    echo "false"
  fi
}

function checkIfComposeIsRunning(){
  compose_file=$1

  if [ ! -e "$compose_file" ]; then
    echo "not_found"
    return 0
  fi

  if docker-compose -f $compose_file ps | grep -q "Up"; then
    echo "true"
  else
    echo "false"
  fi
}

function checkIfTimeBetweenRange() {
  start_time=$1
  end_time=$2
  current_time=$(date +%H:%M)

  if [[ ("$current_time" == "$start_time" || "$current_time" > "$start_time") && ("$current_time" == "$end_time" || "$current_time" < "$end_time") ]]; then
    echo "true"
  else
    echo "false"
  fi
}

function checkIfIsWeekDay() {
  current_day=$(date +%u)

  if [ "$current_day" -ge 1 ] && [ "$current_day" -le 5 ]; then
    echo "true"
  else
    echo "false"
  fi
}

function convertWeekDayToNumber() {
  day=$1

  case "$day" in
    mon) day_number=1 ;;
    tue) day_number=2 ;;
    wed) day_number=3 ;;
    thu) day_number=4 ;;
    fri) day_number=5 ;;
    sat) day_number=6 ;;
    sun) day_number=7 ;;
    *) day_number=0 ;;
  esac

  echo "$day_number"
}

isThereComposeServicesCronJobs() {
  local day="$1"
  local file="$2"
  local service="$3"
  local output_file="$4"

  count=$(grep -c -E "^[^#]* $day [^#]*docker-compose -f $file[^#]*$service" "$output_file")
  if [ "$count" -gt 0 ]; then
    echo "true"
  else
    echo "false"
  fi
}

removeComposeServicesCronJobs() {
  local day="$1"
  local file="$2"
  local service="$3"
  local output_file="$4"

  grep -Ev "^[^#]* $day [^#]*docker-compose -f $file[^#]*$service" "$output_file" > "$output_file.tmp"
  mv "$output_file.tmp" "$output_file"
}

isThereComposeCronJobs() {
  local day="$1"
  local file="$2"
  local output_file="$3"

  count=$(grep -c -E "^[^#]* $day [^#]*docker-compose -f $file" "$output_file")

  if [ "$count" -gt 0 ]; then
    echo "true"
  else
    echo "false"
  fi
}

removeComposeCronJobs() {
  local day="$1"
  local file="$2"
  local output_file="$3"

  grep -Ev "^[^#]* $day [^#]*docker-compose -f $file" "$output_file" > "$output_file.tmp"
  mv "$output_file.tmp" "$output_file"
}

removeCronJobLine() {
  local line="$1"
  escaped_line=$(printf "%s" "$line" | sed 's/\*/\\*/g')
  local output_file="$2"

  grep -Ev "$escaped_line" "$output_file" > "$output_file.tmp"
  mv "$output_file.tmp" "$output_file"
}

hasCronjobCurrentInstruction(){
  instruction="$1"
  escaped_instruction=$(printf "%s" "$instruction" | sed 's/\*/\\*/g')
  result=$(if echo "$(crontab -l)" | grep "$escaped_instruction"; then echo "true"; else echo "false"; fi)
  echo "$result"
}

# ==============================================================================

current_day=$(date +%u)
is_week_day=$(checkIfIsWeekDay)

# ==============================================================================

function updateCronjobsBasedOnDayConfig(){

  type=$1
  compose_path=$2
  does_compose_exist=$3
  service_name=$4
  mode=$5

  day_of_week=$6
  day_of_week_should_run=$(if [[ "$7" == "on" ]]; then echo "true"; else echo "false"; fi)
  initial_time=$8
  final_time=$9

  input="$day_of_week $initial_time $final_time"
  IFS=" " read -r day time_start time_end <<< "$input"
  IFS=":" read -r hour_start minute_start <<< "$time_start"
  IFS=":" read -r hour_end minute_end <<< "$time_end"
  converted_day=$(convertWeekDayToNumber $day)
  cron_start="$minute_start $hour_start * * $converted_day"
  cron_end="$minute_end $hour_end * * $converted_day"

  if [ "$type" == "compose" ] && [ "$does_compose_exist" = "true" ]; then

    if [ "$day_of_week_should_run" = "false" ] || [ "$mode" = "disabled" ]; then
      shouldDeleteOldCronJobs=$(isThereComposeCronJobs $converted_day $compose_path $CRONJOBS_FILE)
      [ $shouldDeleteOldCronJobs = "true" ] && { removeComposeCronJobs $converted_day $compose_path $CRONJOBS_FILE; echo "removed old compose cronjobs"; }
    elif [ "$day_of_week_should_run" = "true" ]; then
      upCronCommand="docker-compose -f $compose_path up -d"
      hasAlreadyAddedUpCron=$(hasCronjobCurrentInstruction "$cron_start $upCronCommand")
      if [ "$hasAlreadyAddedUpCron" = "false" ]; then
        oldLine=$(grep -E "^[^#]* $converted_day [^#]*$upCronCommand" "$CRONJOBS_FILE")
        [ -n "$oldLine" ] && { removeCronJobLine "$oldLine" "$CRONJOBS_FILE"; echo "removed old turn on cronjob  -> [$(echo "$oldLine" | awk -F " docker-compose" '{print $1}')]"; }

        upCron=$(schedule_cron_job "$cron_start" "$upCronCommand")
        [ "$upCron" = "true" ] && echo "add turn on cronjob          -> [$cron_start]"
      fi

      downCronCommand="docker-compose -f $compose_path down"
      hasAlreadyAddedDownCron=$(hasCronjobCurrentInstruction "$cron_end $downCronCommand")
      if [ "$hasAlreadyAddedDownCron" = "false" ]; then
        oldLine=$(grep -E "^[^#]* $converted_day [^#]*$downCronCommand" "$CRONJOBS_FILE")
        [ -n "$oldLine" ] && { removeCronJobLine "$oldLine" "$CRONJOBS_FILE"; echo "removed old turn off cronjob -> [$(echo "$oldLine" | awk -F "docker-compose" '{print $1}')]"; }

        downCron=$(schedule_cron_job "$cron_end" "$downCronCommand")
        [ "$downCron" = "true" ] && echo "add turn off cronjob         -> [$cron_end]"
      fi

    fi

  elif [ "$type" == "compose_service" ] && [ "$does_compose_exist" = "true" ]; then

    if [ "$day_of_week_should_run" = "false" ] || [ "$mode" = "disabled" ]; then
      shouldDeleteOldCronJobs=$(isThereComposeServicesCronJobs $converted_day $compose_path $service_name $CRONJOBS_FILE)
      [ $shouldDeleteOldCronJobs = "true" ] && { removeComposeServicesCronJobs $converted_day $compose_path $service_name $CRONJOBS_FILE; echo "removed old compose_services cronjobs"; }
    elif [ "$day_of_week_should_run" = "true" ]; then
      upCronCommand="docker-compose -f $compose_path up -d $service_name"
      hasAlreadyAddedUpCron=$(hasCronjobCurrentInstruction "$cron_start $upCronCommand")
      if [ "$hasAlreadyAddedUpCron" = "false" ]; then
        oldLine=$(grep -E "^[^#]* $converted_day [^#]*$upCronCommand" "$CRONJOBS_FILE")
        [ -n "$oldLine" ] && { removeCronJobLine "$oldLine" "$CRONJOBS_FILE"; echo "removed old turn on cronjob  -> [$(echo "$oldLine" | awk -F "docker-compose" '{print $1}')]"; }

        upCron=$(schedule_cron_job "$cron_start" "$upCronCommand")
        [ "$upCron" = "true" ] && echo "add turn on cronjob          -> [$cron_start]"
      fi

      downCronCommand="docker-compose -f $compose_path down $service_name"
      hasAlreadyAddedDownCron=$(hasCronjobCurrentInstruction "$cron_end $downCronCommand")
      if [ "$hasAlreadyAddedDownCron" = "false" ]; then
        oldLine=$(grep -E "^[^#]* $converted_day [^#]*$downCronCommand" "$CRONJOBS_FILE")
        [ -n "$oldLine" ] && { removeCronJobLine "$oldLine" "$CRONJOBS_FILE"; echo "removed old turn off cronjob -> [$(echo "$oldLine" | awk -F "docker-compose" '{print $1}')]"; }

        downCron=$(schedule_cron_job "$cron_end" "$downCronCommand")
        [ "$downCron" = "true" ] && echo "add turn off cronjob         -> [$cron_end]"
      fi

    fi

  fi

}

function updateServiceOrComposeBasedOnTodayConditions(){

  type=$1
  compose_path=$2
  compose_name=$3
  service_name=$4

  mode=$5
  should_run_today=$6
  turn_on_time=$7
  turn_off_time=$8
  final_day=$9

  should_run_now=$(checkIfTimeBetweenRange $turn_on_time $turn_off_time)
  fixed_name=$( [[ "$service_name" == "null" ]] && echo "" || echo "[$service_name]" )

  echo -e "Compose           : \e[94m$compose_name $fixed_name\e[0m"
  echo "Compose path      : $compose_path"
  echo "Type              : $type"
  echo "Mode              : $mode"
  echo "Today config      : $final_day $turn_on_time $turn_off_time"
  echo "Should run today  : $should_run_today"
  echo "Should run now    : $should_run_now"

  if [ "$type" == "compose_service" ]; then
    is_service_running=$(checkIfComposeServiceIsRunning $compose_path $service_name)
    echo "Is running        : $( [[ $is_service_running = true ]] && echo -e '\e[32mtrue\e[0m' || echo -e '\e[31mfalse\e[0m' )"

    if [ "$is_service_running" = "true" ] && { [ "$mode" = "auto" ] && [ "$should_run_now" = "false" ] || [ "$should_run_today" = "false" ]; } || [ "$mode" = "disabled" ] && [ "$is_service_running" = "true" ]; then
      echo "turning down compose service [$compose_path]"
      docker-compose -f "$compose_path" down $service_name
    elif { [ "$should_run_now" = "true" ] && [ "$should_run_today" = "true" ] && [ "$mode" = "auto" ] && [ "$is_service_running" = "false" ]; } || { [ "$mode" = "enabled" ] && [ "$is_service_running" = "false" ]; }; then
      echo "setting up compose service [$compose_path]"
      docker-compose -f "$compose_path" up -d $service_name
    fi
  fi

  if [ "$type" == "compose" ]; then
    is_compose_running=$(checkIfComposeIsRunning $compose_path)
    echo "Is running        : $( [[ $is_compose_running = true ]] && echo -e '\e[32mtrue\e[0m' || echo -e '\e[31mfalse\e[0m' )"

    if [ "$is_compose_running" = "true" ] && { [ "$mode" = "auto" ] && [ "$should_run_now" = "false" ] || [ "$should_run_today" = "false" ]; } || [ "$mode" = "disabled" ] && [ "$is_compose_running" = "true" ]; then
      echo "turning down compose [$compose_path]"
      docker-compose -f "$compose_path" down
    elif { [ "$should_run_now" = "true" ] && [ "$should_run_today" = "true" ] && [ "$mode" = "auto" ] && [ "$is_compose_running" = "false" ]; } || { [ "$mode" = "enabled" ] && [ "$is_compose_running" = "false" ]; }; then
      echo "setting up compose [$compose_path]"
      docker-compose -f "$compose_path" up -d
    fi
  fi


}

# ==============================================================================

for obj in $(echo "$CONFIG_JSON" | jq -c '.[]'); do

  compose_path=$(echo "$obj" | jq -r '.compose')
  compose_name=$(echo "$obj" | jq -r '.name')
  service_name=$(echo "$obj" | jq -r '.service_name')
  type=$(echo "$obj" | jq -r '.type')
  mode=$(echo "$obj" | jq -r '.mode')
  config=$(echo "$obj" | jq '.config')
  does_compose_exist=$(if [ -e "$compose_path" ]; then echo "true"; else echo "false"; fi)

  arrayLength=$(echo "$config" | jq length)

  for (( i=0; i<$arrayLength; i++ )); do
    currentArray=$(echo "$config" | jq -r ".[$i][]")
    day_index="$((i+1))"

    IFS=$'\n' read -r -d '' -a arrayVariable <<< "$(echo "$currentArray")"

    if [ "$day_index" -eq "$current_day" ]; then
      final_day_index=$day_index
      final_day=${arrayVariable[0]}
      should_run_today=$(if [[ "${arrayVariable[1]}" == "on" ]]; then echo "true"; else echo "false"; fi)
      turn_on_time=${arrayVariable[2]}
      turn_off_time=${arrayVariable[3]}
    fi

    updateCronjobsBasedOnDayConfig "$type" "$compose_path" "$does_compose_exist" "$service_name" "$mode" "${arrayVariable[0]}" "${arrayVariable[1]}" "${arrayVariable[2]}" "${arrayVariable[3]}"

  done

  updateServiceOrComposeBasedOnTodayConditions "$type" "$compose_path" "$compose_name" "$service_name" "$mode" "$should_run_today" "$turn_on_time" "$turn_off_time" "$final_day"

  echo
done
