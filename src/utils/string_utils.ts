export function prettifyString(message: string, configs: { divider: string; minLengthArr: number[] }) {
  const strArr = message.split(configs.divider);
  const str = strArr.reduce((finalStr, columnStr, columnIndex) => {
    const rowMaxLength = configs.minLengthArr[columnIndex];
    const parsedItem = (() => {
      if (rowMaxLength < columnStr.length) {
        return columnStr.substring(0, rowMaxLength);
      } else if (rowMaxLength > columnStr.length) {
        return columnStr + ' '.repeat(rowMaxLength - columnStr.length);
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
