import { closeSync, existsSync, openSync, readFileSync, writeFileSync } from 'fs';
import { CONFIGS } from '../consts/configs';
import { TConfigsFile } from '../schemas/configs_file.schema';
import { CONTAINER_TYPE, MODE_ENUM, TContainerItem, TExtendedItem } from '../schemas/containers.schema';
import { listDockerComposes } from '../system_commands/compose_commands';
import { checkIfDockerComposeServiceIsRunning } from '../system_commands/compose_services_commands';
import { listDockerContainers, listDockerImages } from '../system_commands/container_commands';
import { createDateWithSpecificTime, getDateOnTimezone, getTodayDayOfTheWeek, isDateWithinRange } from '../utils/date_utils';
import { logger } from '../utils/logger';
import { customConsoleLog, parseBooleanToText, prettifyString } from '../utils/string_utils';
import { disableContainer } from './container_scheduler/disable_item';
import { enableContainer } from './container_scheduler/enable_item';
import { getItemConfigType, getItemTodayinfo } from './container_scheduler/extend_item_info';

const ACTION_ENUM = {
  enable: 'enable',
  disable: 'disable'
} as const;

export async function checkingCommand(parsedData: TConfigsFile) {
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
  const tableColumnsPrettifiedStr = getPrettifiedString(['name', 'type', 'mode', 'is running', 'should be running', 'action ', 'result'], MAX_LENGTH_PER_COLUMN_ARR);
  customConsoleLog(tableColumnsPrettifiedStr + '\n');

  let checkLogString = '';

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
    const shouldBeRunning = extendedItem.extended.shouldRunToday === MODE_ENUM.off ? false : extendedItem.extended.shouldRunToday === MODE_ENUM.on || (extendedItem.extended.shouldRunToday === MODE_ENUM.auto && isItemWithingSpecifiedRange);

    const action = (() => {
      if (shouldBeRunning && !extendedItem.extended.isRunning) return ACTION_ENUM.enable;
      if (!shouldBeRunning && extendedItem.extended.isRunning) return ACTION_ENUM.disable;
      return CONFIGS.options.empty_column_symbol;
    })();

    const commonMessage = getPrettifiedString([item.name, item.type, item.mode, parseBooleanToText(isRunning), parseBooleanToText(shouldBeRunning), action, ''], MAX_LENGTH_PER_COLUMN_ARR);
    customConsoleLog(commonMessage);

    const result = await (async () => {
      if (action === ACTION_ENUM.enable) return await enableContainer(item, runningSystemInfo.images);
      if (action === ACTION_ENUM.disable) return await disableContainer(item);
      return CONFIGS.options.empty_column_symbol;
    })();

    const prettifyResult = prettifyString([result].join(CONFIGS.options.string_divider), { divider: CONFIGS.options.string_divider, minLengthArr: [40] });
    const finalItemMessage = `${commonMessage}${prettifyResult}`;
    customConsoleLog(`${finalItemMessage}\n`, true);

    if (action !== CONFIGS.options.empty_column_symbol) {
      checkLogString += [getDateOnTimezone(new Date(), CONFIGS.options.timezone), finalItemMessage].join(CONFIGS.options.string_divider) + '\n';
    }
  }

  const shouldSaveLogsToFile = CONFIGS.options.log_file !== '';
  if (checkLogString.length > 0 && shouldSaveLogsToFile) {
    const headerRow = ['datetime             ', tableColumnsPrettifiedStr].join(CONFIGS.options.string_divider) + '\n';
    attachLineToLogs(checkLogString, headerRow);
  }
}

function getPrettifiedString(arr: string[], maxLengthPerColumnArr: number[]) {
  return prettifyString(arr.join(CONFIGS.options.string_divider), { divider: CONFIGS.options.string_divider, minLengthArr: [maxLengthPerColumnArr[0], maxLengthPerColumnArr[1], 4, 10, 17, 7] });
}

function attachLineToLogs(linesToAttach: string, headerRow: string) {
  if (!existsSync(CONFIGS.options.log_file)) {
    const createdFileStream = openSync(CONFIGS.options.log_file, 'w');
    closeSync(createdFileStream);
  }

  const oldData = readFileSync(CONFIGS.options.log_file).toString().replace(headerRow, '');
  const newData = headerRow + linesToAttach + oldData;

  // prettier-ignore
  const maxAllowedLines = newData.split('\n').slice(0, CONFIGS.options.log_file_maximum_lines + 1).join('\n');
  writeFileSync(CONFIGS.options.log_file, maxAllowedLines);
}
