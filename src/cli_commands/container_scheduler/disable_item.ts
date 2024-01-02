import { TExtendedItem } from '../../configs/schemas';
import { checkIfDockerComposeIsRunning, downDockerCompose } from '../../system_commands/compose_commands';
import { checkIfDockerComposeServiceIsRunning, downDockerComposeService, listAllDockerComposeServices } from '../../system_commands/compose_services_commands';
import { downDockerContainer, listDockerContainers } from '../../system_commands/container_commands';
import { logger } from '../../utils/logger';

export async function disableContainer(extendedItem: TExtendedItem) {
  if (extendedItem.type === 'docker_compose') {
    const isDockerComposeRunning = await checkIfDockerComposeIsRunning(extendedItem.path);
    if (isDockerComposeRunning) {
      const hasDownedCompose = await downDockerCompose(extendedItem.path);
      hasDownedCompose && logger.info(hasDownedCompose);
    }
  } else if (extendedItem.type === 'docker_compose_service') {
    const services = await listAllDockerComposeServices(extendedItem.path);
    if (!services.includes(extendedItem.service_name)) {
      return 'error4';
    }

    const isDockerComposeServiceRunning = await checkIfDockerComposeServiceIsRunning(extendedItem.path, extendedItem.service_name);
    if (isDockerComposeServiceRunning) {
      const hasDownedCompose = await downDockerComposeService(extendedItem.path, extendedItem.service_name);
      hasDownedCompose && logger.info(hasDownedCompose);
    }
  } else if (extendedItem.type === 'dockerfile') {
    const allupContainers = await listDockerContainers('Up');
    if (!allupContainers.includes(extendedItem.container_name)) {
      return 'error3';
    }

    const hasDownedContainer = await downDockerContainer(extendedItem.container_name);
    hasDownedContainer && logger.info(hasDownedContainer);
  }

  return '';
}
