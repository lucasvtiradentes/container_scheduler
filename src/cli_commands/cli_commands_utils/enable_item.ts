import { CONTAINER_TYPE, TContainerItem } from '../../schemas/containers.schema';
import { upDockerCompose } from '../../system_commands/compose_commands';
import { upDockerComposeService } from '../../system_commands/compose_services_commands';
import { upDockerContainer } from '../../system_commands/container_commands';

export async function enableContainer(containerItem: TContainerItem, images: string[]) {
  if (containerItem.type === CONTAINER_TYPE.docker_compose) {
    const hasUppedCompose = await upDockerCompose(containerItem.path);
    return hasUppedCompose ?? 'error upping docker compose';
  } else if (containerItem.type === CONTAINER_TYPE.docker_compose_service) {
    const hasUppedComposeService = await upDockerComposeService(containerItem.path, containerItem.service_name);
    return hasUppedComposeService ?? 'error upping docker compose service';
  } else if (containerItem.type === CONTAINER_TYPE.docker_file) {
    const hasUppedContainer = await upDockerContainer(containerItem, images);
    return hasUppedContainer ?? 'error upping container';
  }

  return '';
}
