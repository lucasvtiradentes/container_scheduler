import { TDailyConfigs, TItemConfig, TItemConfigsType, TUniqueConfigs, uniqueConfigsSchema } from '../../configs/schemas';

type TGetItemTodayinfoProps = {
  item: TItemConfig;
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
      shouldRunToday
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

export function getItemConfigType(item: TItemConfig): TItemConfigsType {
  const uniqueConfig = uniqueConfigsSchema.safeParse(item.configs);
  return uniqueConfig.success ? 'unique' : 'daily';
}
