/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }

  if (size === 0) {
    return '';
  }

  let resString = '';
  let currSymbol = string[0];
  let count = 0;

  string.split('').forEach((letter) => {
    if (letter === currSymbol) {
      if (count < size) {
        resString += letter;
        count++;
      }
    } else {
      resString += letter;
      currSymbol = letter;
      count = 1;
    }
  });

  return resString;
}
