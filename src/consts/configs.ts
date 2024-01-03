const INITIAL_CONFIGS = {
  timezone: 'UTC',
  cronjob_prefix: 'CONTAINER_SCHEDULER_',
  string_divider: ' | ',
  empty_column_symbol: '-',
  parse_boolean_values_to_emojis: false,
  debug_mode: true,
  loop_mode_check_interval_minutes: 5,
  log_file: '',
  log_file_maximum_lines: 50
};

type TConfigs = typeof INITIAL_CONFIGS;

class Configs {
  options: TConfigs = {
    timezone: INITIAL_CONFIGS.timezone,
    cronjob_prefix: INITIAL_CONFIGS.cronjob_prefix,
    string_divider: INITIAL_CONFIGS.string_divider,
    empty_column_symbol: INITIAL_CONFIGS.empty_column_symbol,
    parse_boolean_values_to_emojis: INITIAL_CONFIGS.parse_boolean_values_to_emojis,
    debug_mode: INITIAL_CONFIGS.debug_mode,
    loop_mode_check_interval_minutes: INITIAL_CONFIGS.loop_mode_check_interval_minutes,
    log_file: INITIAL_CONFIGS.log_file,
    log_file_maximum_lines: INITIAL_CONFIGS.log_file_maximum_lines
  };

  updateOptions(newOptions: Partial<TConfigs>) {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }
}

export const CONFIGS = new Configs();
