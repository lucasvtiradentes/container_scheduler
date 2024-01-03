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
import { listAllCrontabJobs } from './system_commands/crontab_commands';
import { readFileSync } from 'node:fs';
import { logger } from './utils/logger';

type TProgramOptions = {
  remove: boolean;
  logs: boolean;
  setup: string;
  checking: boolean | string;
};

function setupProgramConfigs() {
  program.name(APP_CONSTS.name).version(APP_CONSTS.version).description(APP_CONSTS.description);

  // prettier-ignore
  program
    .option('-s, --setup <file>', 'setup the cronjob to run the checking every x minutes')
    .option('-r, --remove', 'remove the cronjob to run the checking')
    .option('-c, --checking [file]', 'checking mode')
    .option('-l, --logs', 'show available logs')

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

async function getCurrentConfiguredConfigsFilePath() {
  const cronjobItems = await listAllCrontabJobs();
  const scheduledCronjob = cronjobItems.find((item) => item.includes(CONFIGS.cronjob_prefix));
  if (!scheduledCronjob) {
    throw new Error(ERRORS.setup_missing);
  }
  const configsFilePath = scheduledCronjob.split(' --checking ')[1].replace(/'/g, '');
  return configsFilePath;
}

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

  if (options.logs) {
    const filePath = await getCurrentConfiguredConfigsFilePath();
    await validateFileConfig(filePath);

    if (CONFIGS.options.log_file !== '') {
      const logContent = readFileSync(CONFIGS.options.log_file).toString();
      logger.info(logContent);
    }

    return;
  }

  if (options.setup) {
    await validateFileConfig(options.setup);
    await setupCommand(options.setup);
    return;
  }

  if (options.checking) {
    const filePath = await (async () => {
      if (typeof options.checking === 'string') return options.checking;
      const configsFilePath = await getCurrentConfiguredConfigsFilePath();
      return configsFilePath;
    })();

    const parsedData = await validateFileConfig(filePath);
    await checkingCommand(parsedData);
    return;
  }

  program.help();
}

main();
