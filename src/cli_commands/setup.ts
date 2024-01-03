import { APP_CONSTS } from '../consts/app_data';
import { addCrontabJob, listAllCrontabJobs, removeCrontabJob } from '../system_commands/crontab_commands';
import { logger } from '../utils/logger';
import { getFinalCrontabCommand } from './cli_commands_utils/cronjob_utils';

export async function setupCommand(configsFile: string) {
  const { finalCrontabLine, parsedContainerSchedulerPath } = await getFinalCrontabCommand(configsFile);
  const crontabJobs = await listAllCrontabJobs();
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
