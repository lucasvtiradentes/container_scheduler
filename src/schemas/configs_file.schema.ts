import { z } from 'zod';
import { optionsSchema } from './options.schema';
import { containersSchema } from './containers.schema';

export const configsFileSchema = z.object({
  mode: z.enum(['scheduled', 'loop']),
  options: optionsSchema,
  containers: containersSchema
});
