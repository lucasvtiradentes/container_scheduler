import { asyncExec } from '../utils/async_exec';

export async function checkIfNeededBinExists() {
  await asyncExec('which docker');
  await asyncExec('which docker-compose');
  await asyncExec('which crontab');
}
