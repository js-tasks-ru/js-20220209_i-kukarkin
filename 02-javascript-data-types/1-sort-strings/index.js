/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  // Пробовал вставить slice() прямо в return, но почему-то он там не срабатывал
  const copyArr = arr.slice();
    
  if (param === 'asc') {
    return copyArr.sort(compareWords);
  }

  return copyArr.sort(compareWords).reverse();
}

const compareWords = (a, b) => {
  const aChar = a.charCodeAt(0);
  const bChar = b.charCodeAt(0);
    
  // Оба из Русского алфавита
  if (aChar > 1000 && bChar > 1000) {

    // Обработка 'Ё' и 'ё' для aChar
    if (aChar === 1025 || aChar === 1105) {
        
      // Возвращаем 'е' вместо 'ё' и 'Е' вместо 'Ё' с приведением Регистра у bChar
      return returnFunction(1045, bChar > 1071 ? bChar - 32 : bChar);
    }
    
    // Обработка 'Ё' и 'ё' для bChar
    if (bChar === 1025 || bChar === 1105) {

      // Возвращаем 'е' вместо 'ё' и 'Е' вместо 'Ё' с приведением Регистра у aChar
      return returnFunction(aChar > 1071 ? aChar - 32 : aChar, 1045);
    }

    // Возвращаем с приведением Регистра
    return returnFunction(aChar > 1071 ? aChar - 31 : aChar, bChar > 1071 ? bChar - 31 : bChar);
  }

  // Оба из Английского алфавита
  if (aChar < 1000 && bChar < 1000) {

    // Возвращаем с приведением Регистра
    return returnFunction(aChar > 96 ? aChar - 31 : aChar, bChar > 96 ? bChar - 31 : bChar);
  }

  // Один из Русского алфавита
  if (aChar > 1000 || bChar > 1000) {

    // Возвращаем без регистра, но первым Английский алфавит
    return returnReverseFunction(aChar, bChar);
  }
};

const returnFunction = (a, b) => {
  if (a > b) {return 1;}
  if (a == b) {return 0;}
  if (a < b) {return -1;}
};

const returnReverseFunction = (a, b) => {
  if (a > b) {return -1;}
  if (a == b) {return 0;}
  if (a < b) {return 1;}
};
