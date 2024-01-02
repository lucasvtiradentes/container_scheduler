import { z } from 'zod';

const dayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const dayOfWeekStatus = z.enum(['on', 'off']);
const timeSchema = z.string();
const dayArrSchema = z.tuple([dayOfWeekSchema, dayOfWeekStatus, timeSchema, timeSchema]);

export const uniqueConfigsSchema = z.tuple([dayOfWeekStatus, timeSchema, timeSchema]);
export type TUniqueConfigs = z.infer<typeof uniqueConfigsSchema>;

export const dailyConfigsSchema = z.tuple([dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema]);
export type TDailyConfigs = z.infer<typeof dailyConfigsSchema>;

export type TItemConfigsType = 'daily' | 'unique';

const commonSchema = z.object({
  name: z.string(),
  path: z.string(),
  mode: z.enum(['auto', 'disabled', 'enabled']),
  configs: uniqueConfigsSchema.or(dailyConfigsSchema)
});

const composeSchema = commonSchema.merge(
  z.object({
    type: z.literal('compose')
  })
);

const composeServiceSchema = commonSchema.merge(
  z.object({
    service_name: z.string(),
    type: z.literal('compose_service')
  })
);

export const itemConfigSchema = composeSchema.or(composeServiceSchema);

export const configsSchema = z.object({
  timezone: z.string(),
  containers: z.array(itemConfigSchema)
});

export type TItemConfig = z.infer<typeof itemConfigSchema>;
