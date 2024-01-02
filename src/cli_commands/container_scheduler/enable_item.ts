import { TExtendedItem } from '../../configs/schemas';
import { checkIfDockerComposeIsRunning, upDockerCompose } from '../../system_commands/compose_commands';
import { checkIfDockerComposeServiceIsRunning, listAllDockerComposeServices, upDockerComposeService } from '../../system_commands/compose_services_commands';
import { listDockerImages, upDockerContainer } from '../../system_commands/container_commands';
import { logger } from '../../utils/logger';

export async function enableContainer(extendedItem: TExtendedItem) {
  if (extendedItem.type === 'docker_compose') {
    const isDockerComposeRunning = await checkIfDockerComposeIsRunning(extendedItem.path);
    if (!isDockerComposeRunning) {
      logger.info(`uping docker compose: ${extendedItem.path}`);
      const hasUpedCompose = await upDockerCompose(extendedItem.path);
      hasUpedCompose && logger.info(hasUpedCompose);
    }
  } else if (extendedItem.type === 'docker_compose_service') {
    const services = await listAllDockerComposeServices(extendedItem.path);
    if (!services.includes(extendedItem.service_name)) {
      return 'error1';
    }

    const isDockerComposeServiceRunning = await checkIfDockerComposeServiceIsRunning(extendedItem.path, extendedItem.service_name);
    if (!isDockerComposeServiceRunning) {
      logger.info(`uping docker compose service: ${extendedItem.path} ${extendedItem.service_name}`);
      const hasUpedCompose = await upDockerComposeService(extendedItem.path, extendedItem.service_name);
      hasUpedCompose && logger.info(hasUpedCompose);
    }
  } else if (extendedItem.type === 'dockerfile') {
    const allImages = await listDockerImages();
    if (!allImages.includes(extendedItem.image_name)) {
      return 'error2';
    }
    await upDockerContainer(extendedItem);
  }

  return '';
}
