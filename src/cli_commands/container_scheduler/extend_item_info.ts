import { TContainerItem, TDailyConfigs, TItemConfigsType, TUniqueConfigs, uniqueConfigsSchema } from '../../schemas/containers.schema';

type TGetItemTodayinfoProps = {
  item: TContainerItem;
  configType: TItemConfigsType;
  todayDayOfTheWeek: string;
};

export function getItemTodayinfo({ item, configType, todayDayOfTheWeek }: TGetItemTodayinfoProps) {
  if (configType === 'daily') {
    const todayContainerConfigs = item.configs.find((item) => item[0] === todayDayOfTheWeek)! as TDailyConfigs;
    const [dayOfTheWeek, shouldRunToday, dayTurnOnTime, dayTurnOffTime] = todayContainerConfigs; // eslint-disable-line
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: item.mode === 'auto' ? shouldRunToday : item.mode
    };
  } else {
    const [dayTurnOnTime, dayTurnOffTime] = item.configs as TUniqueConfigs;
    return {
      dayTurnOnTime,
      dayTurnOffTime,
      shouldRunToday: item.mode
    };
  }
}

export function getItemConfigType(item: TContainerItem): TItemConfigsType {
  const uniqueConfig = uniqueConfigsSchema.safeParse(item.configs);
  return uniqueConfig.success ? 'unique' : 'daily';
}
