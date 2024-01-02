import { CONTAINER_TYPE, TContainerItem } from '../../schemas/containers.schema';
import { downDockerCompose } from '../../system_commands/compose_commands';
import { downDockerComposeService } from '../../system_commands/compose_services_commands';
import { downDockerContainer } from '../../system_commands/container_commands';

export async function disableContainer(containerItem: TContainerItem) {
  if (containerItem.type === CONTAINER_TYPE.docker_compose) {
    const hasDownedCompose = await downDockerCompose(containerItem.path);
    return hasDownedCompose ?? 'error dowing docker compose';
  } else if (containerItem.type === CONTAINER_TYPE.docker_compose_service) {
    const hasDownedComposeService = await downDockerComposeService(containerItem.path, containerItem.service_name);
    return hasDownedComposeService ?? 'error dowing docker compose service';
  } else if (containerItem.type === CONTAINER_TYPE.docker_file) {
    const hasDownedContainer = await downDockerContainer(containerItem.container_name);
    return hasDownedContainer ?? 'error dowin container';
  }

  return '';
}
