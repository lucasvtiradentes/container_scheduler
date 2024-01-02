#! /usr/bin/env node

import { program } from 'commander';
import { clearCommand } from './cli_commands/clear';
import { scheduleContainers } from './cli_commands/container_scheduler';
import { listCommand } from './cli_commands/list';
import { checkIfNeededBinExists } from './system_commands/system_commands';
import { APP_CONSTS } from './consts/app_data';

function setupProgramConfigs() {
  program.name(APP_CONSTS.name).version(APP_CONSTS.version).description(APP_CONSTS.description);

  // prettier-ignore
  program
    .option('-s, --setup <file>', 'speficies the configs file')
    .option('-c, --checking', 'flag that gives permission to perform up and down actions')
    .option('-l, --list', 'list scheduled items')
    .option('-r, --remove', 'remove all scheduled items')

  return program;
}

async function main() {
  await checkIfNeededBinExists();
  const program = setupProgramConfigs().parse();
  const options = program.opts() satisfies Record<'checking' | 'list' | 'remove', boolean> & { setup: string };

  if (options.list) {
    await listCommand();
    return;
  }

  if (options.remove) {
    await clearCommand();
    return;
  }

  if (options.setup) {
    await scheduleContainers(options.setup, options.checking);
  }
}

main();
