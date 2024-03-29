import { asyncExec } from '../utils/async_exec';
import { logger } from '../utils/logger';

export async function listAllDockerComposeServices(composeFile: string) {
  try {
    const services = (await asyncExec(`docker-compose -f "${composeFile}" config --services`)).stdout.split('\n');
    return services;
  } catch (err) {
    logger.error(err);
    return [];
  }
}

export async function listDockerComposeServicesByStatus(composeFile: string, status: 'Up' | 'Down') {
  try {
    const services = (await asyncExec(`docker-compose -f "${composeFile}" ps | grep "${status}" | awk '{print $4}'`)).stdout.split('\n');
    return services;
  } catch (err) {
    logger.error(err);
    return [];
  }
}

export async function checkIfDockerComposeServiceIsRunning(composeFile: string, service: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" ps | grep -q "${service}"`);
    return true;
  } catch {
    return false;
  }
}

export async function downDockerComposeService(composeFile: string, serviceName: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" down ${serviceName}`);
    return `compose service downed: [${composeFile} - ${serviceName}]`;
  } catch (err) {
    logger.error(err);
    return false;
  }
}
export async function upDockerComposeService(composeFile: string, serviceName: string) {
  try {
    await asyncExec(`docker-compose -f "${composeFile}" up ${serviceName} -d`);
    return `compose service upped: [${composeFile} - ${serviceName}]`;
  } catch (err) {
    logger.error(err);
    return false;
  }
}
