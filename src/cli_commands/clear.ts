import { asyncExec } from '../utils/async_exec';
import { logger } from '../utils/logger';

export async function clearCommand() {
  logger.info(await asyncExec('crontab -r'));
}
