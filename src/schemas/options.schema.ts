import { z } from 'zod';

export const optionsSchema = z
  .object({
    timezone: z.string(),
    cronjob_prefix: z.string().optional(),
    string_divider: z.string().optional(),
    empty_column_symbol: z.string().optional(),
    debug_mode: z.boolean().optional(),
    parse_boolean_values_to_emojis: z.boolean().optional(),
    loop_mode_check_interval_minutes: z.number().optional(),
    log_file: z.string().optional(),
    log_file_maximum_lines: z.number().optional()
  })
  .strict();
