import { asyncExec } from '../utils/async_exec';
import { logger } from '../utils/logger';

export async function addCrontabJob(cronjobLine: string) {
  try {
    await asyncExec(`(crontab -l; echo "${cronjobLine}") | crontab -`);
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

export async function removeCrontabJob(cronjobLine: string) {
  try {
    const scapedCronjobLine = cronjobLine.replace(/\*/g, '\\*');
    await asyncExec(`crontab -l | grep -v "${scapedCronjobLine}" | crontab -`);
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

export async function listAllCrontabJobs() {
  try {
    const crontabItems = (await asyncExec(`crontab -l`)).stdout.split('\n');
    return crontabItems;
  } catch (err) {
    logger.error(err);
    return [];
  }
}
