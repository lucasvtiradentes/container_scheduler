import { z } from 'zod';

export const optionsSchema = z
  .object({
    timezone: z.string(),
    cronjob_prefix: z.string().optional(),
    string_divider: z.string().optional(),
    empty_column_symbol: z.string().optional(),
    debug_mode: z.boolean().optional(),
    parse_boolean_values_to_emojis: z.boolean().optional()
  })
  .strict();
