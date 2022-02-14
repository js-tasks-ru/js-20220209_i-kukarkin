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
  return a.localeCompare(b, ['ru', 'en'], {caseFirst: "upper"});
};
