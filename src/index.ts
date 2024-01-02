#! /usr/bin/env node

import { program } from 'commander';
import { clearCommand } from './cli_commands/clear';
import { listCommand } from './cli_commands/list';
import { scheduleContainers } from './cli_commands/container_scheduler';
import { CONFIGS } from './configs/consts';
import { checkIfProgramsExists } from './system_commands/system_commands';

function setupProgramConfigs() {
  program.name(CONFIGS.app_name).version(CONFIGS.app_version).description(CONFIGS.app_description);

  // prettier-ignore
  program
    .option('-l, --list', 'list scheduled items')
    .option('-c, --clear', 'clear scheduled items')
    .option('-s, --setup <file>', 'speficies the configs file')

  return program;
}

async function main() {
  await checkIfProgramsExists();
  const program = setupProgramConfigs().parse();
  const options = program.opts() satisfies Record<'setup' | 'list' | 'clear', string>;

  if (options.list) {
    await listCommand();
    return;
  }

  if (options.clear) {
    await clearCommand();
    return;
  }

  if (options.setup) {
    await scheduleContainers(options.setup);
  }
}

main();
