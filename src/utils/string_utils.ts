import { CONFIGS } from '../consts/configs';

export function prettifyString(message: string, configs: { divider: string; minLengthArr: number[] }) {
  const strArr = message.split(configs.divider);
  const str = strArr.reduce((finalStr, columnStr, columnIndex) => {
    const rowMaxLength = configs.minLengthArr[columnIndex];
    const parsedItem = (() => {
      if (columnStr.length > rowMaxLength) {
        return columnStr.substring(0, rowMaxLength);
      } else if (columnStr.length < rowMaxLength) {
        const columnLength = ['✅', '❌'].includes(columnStr) ? 2 : columnStr.length;
        return columnStr + ' '.repeat(rowMaxLength - columnLength);
      }
      return columnStr;
    })();

    const curRow = columnIndex === 0 ? parsedItem : configs.divider + parsedItem;
    return finalStr + curRow;
  }, '');

  return str;
}

export function customConsoleLog(message: string, isUpdatingLine?: boolean) {
  if (isUpdatingLine) {
    process.stdout.write(`\r${message}`);
  } else {
    process.stdout.write(message);
  }
}

export function parseBooleanToText(value: boolean | null) {
  let finalText = '';

  if (CONFIGS.options.parse_boolean_values_to_emojis) {
    finalText = value ? '✅' : '❌';
  } else {
    finalText = String(value);
  }

  return finalText;
}
