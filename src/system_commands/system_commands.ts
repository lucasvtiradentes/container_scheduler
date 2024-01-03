import { asyncExec } from '../utils/async_exec';

export async function checkIfNeededBinExists() {
  await asyncExec('which docker');
  await asyncExec('which docker-compose');
  await asyncExec('which crontab');
}

export async function getNodejsPath() {
  try {
    return (await asyncExec('which node')).stdout;
  } catch {
    return 'node';
  }
}
