import { MODE_ENUM, TContainerItem, TDailyConfigs, TItemConfigsType, TUniqueConfigs, uniqueConfigsSchema } from '../../schemas/containers.schema';

type TGetItemTodayinfoProps = {
  item: TContainerItem;
  configType: TItemConfigsType;
  todayDayOfTheWeek: string;
};

export function getItemTodayinfo({ item, configType, todayDayOfTheWeek }: TGetItemTodayinfoProps) {
  if (configType === 'daily') {
    const todayContainerConfigs = item.time_specs.find((item) => item[0] === todayDayOfTheWeek)! as TDailyConfigs;
    const [dayOfTheWeek, shouldRunToday, dayTurnOnTime, dayTurnOffTime] = todayContainerConfigs; // eslint-disable-line
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: item.mode === MODE_ENUM.auto ? shouldRunToday : item.mode
    };
  } else {
    const [dayTurnOnTime, dayTurnOffTime] = item.time_specs as TUniqueConfigs;
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: item.mode
    };
  }
}

export function getItemConfigType(item: TContainerItem): TItemConfigsType {
  const uniqueConfig = uniqueConfigsSchema.safeParse(item.time_specs);
  return uniqueConfig.success ? 'unique' : 'daily';
}
