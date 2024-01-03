import { APP_CONSTS } from '../consts/app_data';
import { CONFIGS } from '../consts/configs';
import { addCrontabJob, listAllCrontabJobs, removeCrontabJob } from '../system_commands/crontab_commands';
import { getNodejsPath } from '../system_commands/system_commands';
import { logger } from '../utils/logger';

export async function setupCommand(configsFile: string) {
  const parsedContainerSchedulerPath = __filename.replace('/cli_commands/setup.js', '/index.js');

  const crontabJobs = await listAllCrontabJobs();

  const nodePath = await getNodejsPath();
  const minutesBetweenChecks = CONFIGS.options.loop_mode_check_interval_minutes;
  const crontabTimeExpression = `*/${minutesBetweenChecks} * * * *`;
  const crontabCommand = `${nodePath} ${parsedContainerSchedulerPath} --checking ${configsFile}`;
  const finalCrontabLine = `${crontabTimeExpression} ${crontabCommand}`;

  const alreadyAddedCronjob = crontabJobs.find((item) => item.includes(parsedContainerSchedulerPath));

  const shouldUpdateOldCronjobLine = alreadyAddedCronjob && alreadyAddedCronjob !== finalCrontabLine;
  if (shouldUpdateOldCronjobLine) {
    await removeCrontabJob(alreadyAddedCronjob);
  }

  if (!alreadyAddedCronjob || shouldUpdateOldCronjobLine) {
    const hasAdded = await addCrontabJob(finalCrontabLine);
    if (hasAdded) {
      logger.info(hasAdded ? `successfully configured ${APP_CONSTS.name}` : `Error while configuring ${APP_CONSTS.name}`);
    }
  } else {
    logger.info(`${APP_CONSTS.name} was already configured!`);
  }
}
