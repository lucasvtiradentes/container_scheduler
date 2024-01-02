import { asyncExec } from '../utils/async_exec';

export async function listCommand() {
  console.log(await asyncExec('crontab -l'));
}
