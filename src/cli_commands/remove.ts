import { APP_CONSTS } from '../consts/app_data';
import { listAllCrontabJobs, removeCrontabJob } from '../system_commands/crontab_commands';
import { logger } from '../utils/logger';
import { BASE_COMMAND } from './cli_commands_utils/cronjob_utils';

export async function removeCommand() {
  const crontabJobs = await listAllCrontabJobs();
  const alreadyAddedCronjob = crontabJobs.find((item) => item.includes(BASE_COMMAND));

  if (alreadyAddedCronjob) {
    const hasRemoved = await removeCrontabJob(alreadyAddedCronjob);
    logger.info(`${hasRemoved ? 'success' : 'error'} removing the ${APP_CONSTS.name} cronjob instruction!`);
  } else {
    logger.info(`found no ${APP_CONSTS.name} cronjob instruction to remove!`);
  }
}
