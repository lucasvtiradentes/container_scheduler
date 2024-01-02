import { TExtendedItem } from '../configs/schemas';
import { asyncExec } from '../utils/async_exec';

export async function downDockerContainer(containerName: string) {
  try {
    await asyncExec(`docker stop ${containerName}`);
    await asyncExec(`docker rm -f ${containerName}`);
    return `container downed: [${containerName}]`;
  } catch {
    return false;
  }
}

export async function upDockerContainer(extendedItem: TExtendedItem) {
  if (extendedItem.type !== 'dockerfile') return;

  try {
    await asyncExec(`docker run ${extendedItem.options} --name ${extendedItem.container_name} ${extendedItem.image_name}`);
    return `container up: [${extendedItem.name}]`;
  } catch {
    return false;
  }
}

export async function listDockerContainers(status: 'Up' | 'Down') {
  try {
    const containers = (await asyncExec(`docker ps --format '{{.Names}}\t{{.Status}}' | grep "${status}" | awk '{print $1}'`)).stdout.split('\n');
    return containers;
  } catch {
    return [];
  }
}

export async function listDockerImages() {
  try {
    const images = (await asyncExec(`docker image ls --format '{{.Repository}}'`)).stdout.split('\n');
    return images;
  } catch {
    return [];
  }
}
