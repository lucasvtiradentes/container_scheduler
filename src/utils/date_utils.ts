export const getTodayDayOfTheWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const dayName = days[dayOfWeek];
  return dayName;
};

export function validateTimezone(timeZone: string) {
  try {
    getDateOnTimezone(new Date(), timeZone);
    return true;
  } catch {
    return false;
  }
}

export function getDateOnTimezone(date: Date, timeZone: string) {
  return date.toLocaleString('pt-BR', { timeZone }).replace(', ', ' - ');
}

export function createDateWithSpecificTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const specificDate = new Date();
  specificDate.setHours(hours, minutes, 0, 0);
  return specificDate;
}

export function isDateWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}
