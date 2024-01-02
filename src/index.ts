#! /usr/bin/env node

import { program } from 'commander';
import { clearCommand } from './cli_commands/clear';
import { scheduleContainers } from './cli_commands/container_scheduler';
import { listCommand } from './cli_commands/list';
import { checkIfNeededBinExists } from './system_commands/system_commands';
import { CONSTS } from './consts/app_data';

function setupProgramConfigs() {
  program.name(CONSTS.app_name).version(CONSTS.app_version).description(CONSTS.app_description);

  // prettier-ignore
  program
    .option('-s, --setup <file>', 'speficies the configs file')
    .option('-l, --list', 'list scheduled items')
    .option('-c, --clear', 'clear all scheduled items')

  return program;
}

async function main() {
  await checkIfNeededBinExists();
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
