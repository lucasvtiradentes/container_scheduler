import { z } from 'zod';
import { optionsSchema } from './options.schema';
import { containersSchema } from './containers.schema';

export const configsFileSchema = z.object({
  options: optionsSchema,
  containers: containersSchema
});
