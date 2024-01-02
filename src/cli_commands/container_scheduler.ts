import { existsSync, readFileSync } from 'fs';
import { configsFileSchema } from '../schemas/configs_file.schema';
import { CONTAINER_TYPE, TContainerItem, TExtendedItem } from '../schemas/containers.schema';
import { listDockerComposes } from '../system_commands/compose_commands';
import { checkIfDockerComposeServiceIsRunning } from '../system_commands/compose_services_commands';
import { listDockerContainers, listDockerImages } from '../system_commands/container_commands';
import { createDateWithSpecificTime, getTodayDayOfTheWeek, isDateWithinRange, validateTimezone } from '../utils/date_utils';
import { logger } from '../utils/logger';
import { customConsoleLog, parseBooleanToText, prettifyString } from '../utils/string_utils';
import { disableContainer } from './container_scheduler/disable_item';
import { enableContainer } from './container_scheduler/enable_item';
import { getItemConfigType, getItemTodayinfo } from './container_scheduler/extend_item_info';
import { CONFIGS } from '../consts/configs';
import { ERRORS } from '../consts/errors';

export async function scheduleContainers(file: string, shouldPerformActions?: boolean) {
  const stringData = readFileSync(file, 'utf8');
  const jsonData = JSON.parse(stringData);
  const parsedData = configsFileSchema.parse(jsonData);
  const isTimezoneValid = validateTimezone(parsedData.options.timezone);
  if (!isTimezoneValid) {
    throw new Error(ERRORS.invalid_timezone);
  }

  CONFIGS.updateOptions(parsedData.options);

  const todayDayOfTheWeek = getTodayDayOfTheWeek();

  const parsedContainerItems = [
    ...parsedData.containers.docker_composes.map((item) => ({ ...item, type: CONTAINER_TYPE.docker_compose })),
    ...parsedData.containers.docker_compose_services.map((item) => ({ ...item, type: CONTAINER_TYPE.docker_compose_service })),
    ...parsedData.containers.docker_files.map((item) => ({ ...item, type: CONTAINER_TYPE.docker_file }))
  ] as TContainerItem[];

  const images = await listDockerImages();
  const containers = await listDockerContainers('Up');
  const composes = await listDockerComposes();
  const runningSystemInfo = { images, containers, composes };

  const MAX_LENGTH_PER_COLUMN_ARR = [Math.max(...parsedContainerItems.map((item) => item.name.length)), Math.max(...parsedContainerItems.map((item) => item.type.length))];
  customConsoleLog(getPrettifiedString(['name', 'type', 'mode', 'is running', 'should be running', 'action ', 'result'], MAX_LENGTH_PER_COLUMN_ARR) + '\n');

  for (const item of parsedContainerItems) {
    if (!existsSync(item.path)) {
      logger.error('The file does not exist, skipping the container.', item.path);
      continue;
    }

    const configType = getItemConfigType(item);
    const isRunning = await (async () => {
      if (item.type === CONTAINER_TYPE.docker_compose) return runningSystemInfo.composes.includes(item.path);
      if (item.type === CONTAINER_TYPE.docker_compose_service) return await checkIfDockerComposeServiceIsRunning(item.path, item.service_name);
      if (item.type === CONTAINER_TYPE.docker_file) return runningSystemInfo.containers.includes(item.container_name);
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
    const shouldBeRunning = extendedItem.extended.shouldRunToday === 'off' ? false : extendedItem.extended.shouldRunToday === 'on' || (extendedItem.extended.shouldRunToday === 'auto' && isItemWithingSpecifiedRange);

    const action = (() => {
      if (shouldBeRunning && !extendedItem.extended.isRunning) return 'enable';
      if (!shouldBeRunning && extendedItem.extended.isRunning) return 'disable';
      return CONFIGS.options.empty_column_symbol;
    })();

    const commonMessage = getPrettifiedString([item.name, item.type, item.mode, parseBooleanToText(isRunning), parseBooleanToText(shouldBeRunning), action, ''], MAX_LENGTH_PER_COLUMN_ARR);
    customConsoleLog(commonMessage);

    const result = await (async () => {
      if (action === 'enable') {
        return shouldPerformActions ? await enableContainer(item, runningSystemInfo.images) : CONFIGS.options.empty_column_symbol;
      }

      if (action === 'disable') {
        return shouldPerformActions ? await disableContainer(item) : CONFIGS.options.empty_column_symbol;
      }

      if (action === CONFIGS.options.empty_column_symbol) return CONFIGS.options.empty_column_symbol;
    })();

    const prettifyResult = prettifyString([result].join(CONFIGS.options.string_divider), { divider: CONFIGS.options.string_divider, minLengthArr: [40] });
    customConsoleLog(`${commonMessage}${prettifyResult}\n`, true);
  }
}

function getPrettifiedString(arr: string[], maxLengthPerColumnArr: number[]) {
  return prettifyString(arr.join(CONFIGS.options.string_divider), { divider: CONFIGS.options.string_divider, minLengthArr: [maxLengthPerColumnArr[0], maxLengthPerColumnArr[1], 4, 10, 17, 7] });
}
