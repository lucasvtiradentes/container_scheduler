import { asyncExec } from '../utils/async_exec';

export async function clearCommand() {
  console.log(await asyncExec('crontab -r'));
}
