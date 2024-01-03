import { asyncExec } from '../utils/async_exec';
import { logger } from '../utils/logger';

export async function checkIfDockerComposeIsRunning(composeFile: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" ps | grep -q "Up"`);
    return true;
  } catch {
    return false;
  }
}

export async function downDockerCompose(composeFile: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" down`);
    return `compose downed: [${composeFile}]`;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

export async function upDockerCompose(composeFile: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" up -d`);
    return `compose upped: [${composeFile}]`;
  } catch (err) {
    return false;
  }
}

export async function listDockerComposes() {
  try {
    const composes = (await asyncExec(`docker compose ls --format json | jq '.[].ConfigFiles' -r`)).stdout.split('\n');
    return composes;
  } catch (err) {
    logger.error(err);
    return [];
  }
}
