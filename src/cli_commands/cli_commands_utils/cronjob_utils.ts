import { CONFIGS } from '../../consts/configs';
import { getNodejsPath } from '../../system_commands/system_commands';

export const BASE_COMMAND = `echo ${CONFIGS.cronjob_prefix}`;

export async function getFinalCrontabCommand(configsFile: string) {
  const parsedContainerSchedulerPath = __filename.replace('/cli_commands/cli_commands_utils/cronjob_utils.js', '/index.js');
  const nodePath = await getNodejsPath();
  const minutesBetweenChecks = CONFIGS.options.loop_mode_check_interval_minutes;
  const crontabTimeExpression = `*/${minutesBetweenChecks} * * * *`;
  const crontabCommand = `${BASE_COMMAND}; ${nodePath} '${parsedContainerSchedulerPath}' --checking '${configsFile}'`;
  const finalCrontabLine = `${crontabTimeExpression} ${crontabCommand}`;

  return {
    parsedContainerSchedulerPath,
    finalCrontabLine
  };
}
