/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split('.');

  return (obj) => {
    if (obj) {
      return pathArr.reduce((prev, curr) => {
        if (prev && prev[curr]) {
          return prev[curr];
        }
        return undefined;
      }, obj);
    }

    return undefined;
  };
}
