import { existsSync, readFileSync } from 'fs';
import { TItemConfig, TItemConfigsType, TUniqueConfigs, configsSchema, uniqueConfigsSchema } from '../configs/schemas';
import { createDateWithSpecificTime, getTodayDayOfTheWeek, isDateWithinRange, validateTimezone } from '../utils/date_utils';

export async function scheduleContainers(file: string) {
  const stringData = readFileSync(file, 'utf8');
  const jsonData = JSON.parse(stringData);
  const parsedData = configsSchema.parse(jsonData);
  const isTimezoneValid = validateTimezone(parsedData.timezone);
  if (!isTimezoneValid) {
    throw new Error('specified timezone does not exists!');
  }

  for (const item of parsedData.containers) {
    if (!existsSync(item.path)) {
      console.log('The file does not exist, skipping the container.', item.path);
      continue;
    }

    const configType = getItemConfigType(item);
    const { dayTurnOffTime, dayTurnOnTime, shouldRunToday } = getItemTodayinfo(item, configType);
    const extendedItem = {
      ...item,
      configType,
      shouldRunToday,
      dayTurnOnTime: createDateWithSpecificTime(dayTurnOnTime),
      dayTurnOffTime: createDateWithSpecificTime(dayTurnOffTime)
    };

    const isItemWithingSpecifiedRange = isDateWithinRange(new Date(), extendedItem.dayTurnOnTime, extendedItem.dayTurnOffTime);
    const shouldBeRunning = extendedItem.shouldRunToday && isItemWithingSpecifiedRange;

    if (!shouldBeRunning) {
      console.log(extendedItem);
    }
  }
}

function getItemConfigType(item: TItemConfig): TItemConfigsType {
  const uniqueConfig = uniqueConfigsSchema.safeParse(item.configs);
  return uniqueConfig.success ? 'unique' : 'daily';
}

function getItemTodayinfo(item: TItemConfig, type: TItemConfigsType) {
  const todayDayOfTheWeek = getTodayDayOfTheWeek();

  if (type === 'daily') {
    const todayContainerConfigs = item.configs.find((item) => item[0] === todayDayOfTheWeek)!;
    const [dayOfTheWeek, shouldRunToday, dayTurnOnTime, dayTurnOffTime] = todayContainerConfigs; // eslint-disable-line
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: shouldRunToday === 'on'
    };
  } else {
    const [shouldRunToday, dayTurnOnTime, dayTurnOffTime] = item.configs as TUniqueConfigs;
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: shouldRunToday === 'on'
    };
  }
}
