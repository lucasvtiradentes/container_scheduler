import { asyncExec } from '../utils/async_exec';
import { logger } from '../utils/logger';

export async function listCommand() {
  logger.info(await asyncExec('crontab -l'));
}
