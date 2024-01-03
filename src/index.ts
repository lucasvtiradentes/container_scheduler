#! /usr/bin/env node

import { program } from 'commander';
import { platform } from 'node:os';
import { checkingCommand } from './cli_commands/checking';
import { removeCommand } from './cli_commands/remove';
import { setupCommand } from './cli_commands/setup';
import { APP_CONSTS } from './consts/app_data';
import { CONFIGS } from './consts/configs';
import { ERRORS } from './consts/errors';
import { configsFileSchema } from './schemas/configs_file.schema';
import { checkIfNeededBinExists } from './system_commands/system_commands';
import { validateTimezone } from './utils/date_utils';
import { readJson } from './utils/read_json';

function setupProgramConfigs() {
  program.name(APP_CONSTS.name).version(APP_CONSTS.version).description(APP_CONSTS.description);

  // prettier-ignore
  program
    .option('-s, --setup <file>', 'setup the cronjob to run the checking every x minutes')
    .option('-r, --remove', 'remove the cronjob to run the checking')
    .option('-c, --checking <file>', 'checking mode')

  return program;
}

async function validateFileConfig(file: string) {
  const json = readJson(file);
  const parsedData = configsFileSchema.parse(json);
  CONFIGS.updateOptions(parsedData.options);

  const isTimezoneValid = validateTimezone(CONFIGS.options.timezone);
  if (!isTimezoneValid) {
    throw new Error(ERRORS.invalid_timezone);
  }

  return parsedData;
}

type TProgramOptions = Record<'remove', boolean> & Record<'checking' | 'setup', string>;

async function main() {
  await checkIfNeededBinExists();
  const program = setupProgramConfigs().parse();
  const options = program.opts() satisfies TProgramOptions;

  if (platform() !== 'linux') {
    throw new Error(ERRORS.invalid_os);
  }

  if (options.remove) {
    await removeCommand();
    return;
  }

  if (options.setup) {
    await validateFileConfig(options.setup);
    await setupCommand(options.setup);
    return;
  }

  if (options.checking) {
    const parsedData = await validateFileConfig(options.checking);
    await checkingCommand(parsedData);
    return;
  }

  program.help();
}

main();
