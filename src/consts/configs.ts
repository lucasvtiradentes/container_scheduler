import { TOptions } from '../schemas/options.schema';

const INITIAL_CONFIGS = {
  timezone: 'UTC',
  string_divider: ' | ',
  empty_column_symbol: '-',
  parse_boolean_values_to_emojis: false,
  debug_mode: false,
  loop_mode_check_interval_minutes: 5,
  log_file: '',
  log_file_maximum_lines: 10
} satisfies Required<TOptions>;

class Configs {
  cronjob_prefix = 'CONTAINER_SCHEDULER_SETUP';
  options: Required<TOptions> = {
    timezone: INITIAL_CONFIGS.timezone,
    string_divider: INITIAL_CONFIGS.string_divider,
    empty_column_symbol: INITIAL_CONFIGS.empty_column_symbol,
    parse_boolean_values_to_emojis: INITIAL_CONFIGS.parse_boolean_values_to_emojis,
    debug_mode: INITIAL_CONFIGS.debug_mode,
    loop_mode_check_interval_minutes: INITIAL_CONFIGS.loop_mode_check_interval_minutes,
    log_file: INITIAL_CONFIGS.log_file,
    log_file_maximum_lines: INITIAL_CONFIGS.log_file_maximum_lines
  };

  updateOptions(newOptions: TOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }
}

export const CONFIGS = new Configs();
