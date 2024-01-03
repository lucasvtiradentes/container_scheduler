import { z } from 'zod';

export const MODE_ENUM = {
  auto: 'auto',
  on: 'on',
  off: 'off'
} as const;

// =============================================================================

const dayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const modeSchema = z.enum([MODE_ENUM.auto, MODE_ENUM.on, MODE_ENUM.off]);
export type TModeSchema = z.infer<typeof modeSchema>;

// =============================================================================

const timeSchema = z.string().length(5);
export const uniqueConfigsSchema = z.tuple([timeSchema, timeSchema]);
export type TUniqueConfigs = z.infer<typeof uniqueConfigsSchema>;

const dayArrSchema = z.tuple([dayOfWeekSchema, modeSchema, timeSchema, timeSchema]);
export type TDailyConfigs = z.infer<typeof dayArrSchema>;
const dailyConfigsSchema = z.tuple([dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema, dayArrSchema]);

export type TItemConfigsType = 'daily' | 'unique';

// =============================================================================

export const CONTAINER_TYPE = {
  docker_compose: 'docker_compose',
  docker_compose_service: 'docker_compose_service',
  docker_file: 'docker_file'
} as const;

const commonContainerItemSchema = z.object({
  name: z.string(),
  mode: modeSchema,
  path: z.string(),
  configs: uniqueConfigsSchema.or(dailyConfigsSchema)
});

const dockerComposeItemSchema = commonContainerItemSchema.merge(
  z.object({
    type: z.literal(CONTAINER_TYPE.docker_compose)
  })
);

const dockerComposeServicesItemSchema = commonContainerItemSchema.merge(
  z.object({
    type: z.literal(CONTAINER_TYPE.docker_compose_service),
    service_name: z.string()
  })
);

const dockerFilesSchema = commonContainerItemSchema.merge(
  z.object({
    type: z.literal(CONTAINER_TYPE.docker_file),
    mount_path: z.string(),
    image_name: z.string(),
    container_name: z.string(),
    options: z.string()
  })
);

export const containersSchema = z.object({
  docker_composes: z.array(dockerComposeItemSchema.partial({ type: true })),
  docker_compose_services: z.array(dockerComposeServicesItemSchema.partial({ type: true })),
  docker_files: z.array(dockerFilesSchema.partial({ type: true }))
});

export const containerItemSchema = z.discriminatedUnion('type', [dockerComposeItemSchema, dockerComposeServicesItemSchema, dockerFilesSchema]);

export type TContainerItem = z.infer<typeof containerItemSchema>;

export type TExtendedItem = TContainerItem & {
  extended: {
    isRunning: boolean | null;
    configType: TItemConfigsType;
    shouldRunToday: TModeSchema;
    dayTurnOnTime: Date;
    dayTurnOffTime: Date;
  };
};
