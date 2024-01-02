import { existsSync, readFileSync } from 'fs';
import { TExtendedItem, configsSchema } from '../configs/schemas';
import { listDockerComposes } from '../system_commands/compose_commands';
import { checkIfDockerComposeServiceIsRunning } from '../system_commands/compose_services_commands';
import { listDockerContainers, listDockerImages } from '../system_commands/container_commands';
import { createDateWithSpecificTime, getTodayDayOfTheWeek, isDateWithinRange, validateTimezone } from '../utils/date_utils';
import { logger } from '../utils/logger';
import { customConsoleLog, prettifyString } from '../utils/string_utils';
import { disableContainer } from './container_scheduler/disable_item';
import { enableContainer } from './container_scheduler/enable_item';
import { getItemConfigType, getItemTodayinfo } from './container_scheduler/extend_item_info';

const STRING_DIVIDER = ' | ';

export async function scheduleContainers(file: string) {
  const stringData = readFileSync(file, 'utf8');
  const jsonData = JSON.parse(stringData);
  const parsedData = configsSchema.parse(jsonData);
  const isTimezoneValid = validateTimezone(parsedData.timezone);
  if (!isTimezoneValid) {
    throw new Error('specified timezone does not exists!');
  }

  const todayDayOfTheWeek = getTodayDayOfTheWeek();

  const filteredItems = parsedData.containers;
  const MAX_NAME_LENGTH = [Math.max(...filteredItems.map((item) => item.name.length)), Math.max(...filteredItems.map((item) => item.type.length))];
  const images = filteredItems.map((item) => item.type).includes('dockerfile') ? await listDockerImages() : [];
  const containers = filteredItems.map((item) => item.type).includes('dockerfile') ? await listDockerContainers('Up') : [];
  const composes = filteredItems.map((item) => item.type).includes('dockerfile') ? await listDockerComposes() : [];
  const runningSystemInfo = { images, containers, composes };

  customConsoleLog(getPrettifiedString(['name', 'type', 'is running', 'should be running', 'action ', 'result'], MAX_NAME_LENGTH) + '\n');

  for (const item of filteredItems) {
    if (!existsSync(item.path)) {
      logger.error('The file does not exist, skipping the container.', item.path);
      continue;
    }

    const configType = getItemConfigType(item);
    const isRunning = await (async () => {
      if (item.type === 'docker_compose') return runningSystemInfo.composes.includes(item.path);
      if (item.type === 'dockerfile') return runningSystemInfo.containers.includes(item.container_name);
      if (item.type === 'docker_compose_service') return await checkIfDockerComposeServiceIsRunning(item.path, item.service_name);
      return null;
    })();
    const { shouldRunToday, dayTurnOnTime, dayTurnOffTime } = getItemTodayinfo({ item, configType, todayDayOfTheWeek });

    const extendedItem: TExtendedItem = {
      ...item,
      extended: {
        isRunning,
        configType,
        shouldRunToday,
        dayTurnOnTime: createDateWithSpecificTime(dayTurnOnTime),
        dayTurnOffTime: createDateWithSpecificTime(dayTurnOffTime)
      }
    };

    const isItemWithingSpecifiedRange = isDateWithinRange(new Date(), extendedItem.extended.dayTurnOnTime, extendedItem.extended.dayTurnOffTime);
    const shouldBeRunning = extendedItem.extended.shouldRunToday === 'on' || (extendedItem.extended.shouldRunToday === 'auto' && isItemWithingSpecifiedRange);
    const commonMessage = getPrettifiedString([item.name, item.type, String(isRunning), String(shouldBeRunning), ''], MAX_NAME_LENGTH);
    customConsoleLog(commonMessage);

    const finalResult = await (async () => {
      if (shouldBeRunning && !extendedItem.extended.isRunning) {
        return {
          action: 'enable',
          result: await enableContainer(extendedItem)
        };
      } else if (!shouldBeRunning && extendedItem.extended.isRunning) {
        return {
          action: 'disable',
          result: await disableContainer(extendedItem)
        };
      } else {
        return {
          action: 'nothing',
          result: '-'
        };
      }
    })();

    const prettifyResult = prettifyString([finalResult.action, finalResult.result].join(STRING_DIVIDER), { divider: STRING_DIVIDER, minLengthArr: [7] });
    customConsoleLog(`${commonMessage}${prettifyResult}\n`, true);
  }
}

function getPrettifiedString(arr: string[], MAX_NAME_LENGTH: number[]) {
  return prettifyString(arr.join(STRING_DIVIDER), { divider: STRING_DIVIDER, minLengthArr: [MAX_NAME_LENGTH[0], MAX_NAME_LENGTH[1], 10, 17] });
}
