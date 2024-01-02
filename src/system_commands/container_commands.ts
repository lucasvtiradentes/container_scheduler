import { TContainerItem } from '../schemas/containers.schema';
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

export async function upDockerContainer(containerItem: TContainerItem, images: string[]) {
  if (containerItem.type !== 'docker_file') return;

  try {
    const hasFoundDockerImage = images.includes(containerItem.image_name);

    const changePathCommand = `cd ${containerItem.mount_path}`;
    const createImageCommand = `docker build -t ${containerItem.image_name} .`;
    const upContainerCommand = `docker run ${containerItem.options} --name ${containerItem.container_name} ${containerItem.image_name}`;
    const finalCommand = hasFoundDockerImage ? `${changePathCommand} && ${upContainerCommand}` : `${changePathCommand} && ${createImageCommand} && ${upContainerCommand}`;

    await asyncExec(finalCommand);
    return `container up: [${containerItem.name}]`;
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
