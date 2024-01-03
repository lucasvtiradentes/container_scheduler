#! /usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { checkingCommand } from './cli_commands/checking';
import { clearCommand } from './cli_commands/clear';
import { listCommand } from './cli_commands/list';
import { setupCommand } from './cli_commands/setup';
import { APP_CONSTS } from './consts/app_data';
import { CONFIGS } from './consts/configs';
import { ERRORS } from './consts/errors';
import { configsFileSchema } from './schemas/configs_file.schema';
import { checkIfNeededBinExists } from './system_commands/system_commands';
import { validateTimezone } from './utils/date_utils';

function setupProgramConfigs() {
  program.name(APP_CONSTS.name).version(APP_CONSTS.version).description(APP_CONSTS.description);

  // prettier-ignore
  program
    .option('-s, --setup <file>', 'speficies the configs file')
    .option('-c, --checking <file>', 'flag that gives permission to perform up and down actions')
    .option('-l, --list', 'list scheduled items')
    .option('-r, --remove', 'remove all scheduled items')

  return program;
}

async function validateFileConfig(file: string) {
  const stringData = readFileSync(file, 'utf8');
  const jsonData = JSON.parse(stringData);
  const parsedData = configsFileSchema.parse(jsonData);
  const isTimezoneValid = validateTimezone(parsedData.options.timezone);
  if (!isTimezoneValid) {
    throw new Error(ERRORS.invalid_timezone);
  }

  CONFIGS.updateOptions(parsedData.options);
  return parsedData;
}

type TProgramOptions = Record<'list' | 'remove', boolean> & Record<'checking' | 'setup', string>;

async function main() {
  await checkIfNeededBinExists();
  const program = setupProgramConfigs().parse();
  const options = program.opts() satisfies TProgramOptions;

  if (options.list) {
    await listCommand();
    return;
  }

  if (options.remove) {
    await clearCommand();
    return;
  }

  if (options.setup) {
    await validateFileConfig(options.setup);
    await setupCommand(options.setup);
  }

  if (options.checking) {
    const parsedData = await validateFileConfig(options.checking);
    await checkingCommand(parsedData);
  }
}

main();
