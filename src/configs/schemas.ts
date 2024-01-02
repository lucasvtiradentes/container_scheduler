import { z } from 'zod';

const dayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const modeSchema = z.enum(['auto', 'on', 'off']);

export type TModeSchema = z.infer<typeof modeSchema>;

const timeSchema = z.string();
const dayArrSchema = z.tuple([dayOfWeekSchema, modeSchema, timeSchema, timeSchema]);
export type TDailyConfigs = z.infer<typeof dayArrSchema>;

export const dailyConfigsSchema = z.tuple([dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema]);

export const uniqueConfigsSchema = z.tuple([timeSchema, timeSchema]); // modeSchema,
export type TUniqueConfigs = z.infer<typeof uniqueConfigsSchema>;

export type TItemConfigsType = 'daily' | 'unique';

const commonSchema = z.object({
  name: z.string(),
  path: z.string(),
  mode: modeSchema,
  configs: uniqueConfigsSchema.or(dailyConfigsSchema)
});

const dockerFileSchema = commonSchema.merge(
  z.object({
    type: z.literal('dockerfile'),
    mount_path: z.string(),
    image_name: z.string(),
    container_name: z.string(),
    options: z.string()
  })
);

const composeSchema = commonSchema.merge(
  z.object({
    type: z.literal('docker_compose')
  })
);

const composeServiceSchema = commonSchema.merge(
  z.object({
    service_name: z.string(),
    type: z.literal('docker_compose_service')
  })
);

export const itemConfigSchema = z.discriminatedUnion('type', [dockerFileSchema, composeSchema, composeServiceSchema]);

export const configsSchema = z.object({
  timezone: z.string(),
  containers: z.array(itemConfigSchema)
});

export type TItemConfig = z.infer<typeof itemConfigSchema>;

export type TExtendedItem = TItemConfig & {
  extended: {
    isRunning: boolean | null;
    configType: TItemConfigsType;
    shouldRunToday: TModeSchema;
    dayTurnOnTime: Date;
    dayTurnOffTime: Date;
  };
};
