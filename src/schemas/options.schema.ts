import { z } from 'zod';

export const optionsSchema = z
  .object({
    timezone: z.string(),
    string_divider: z.string(),
    empty_column_symbol: z.string(),
    debug_mode: z.boolean(),
    parse_boolean_values_to_emojis: z.boolean(),
    loop_mode_check_interval_minutes: z.number(),
    log_file: z.string(),
    log_file_maximum_lines: z.number()
  })
  .partial();

export type TOptions = z.infer<typeof optionsSchema>;
