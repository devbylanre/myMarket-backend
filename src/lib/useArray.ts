export const useArray = <T extends unknown>(array: T[]) => {
  // check if array contains the item
  const includes = (item: T) => array.includes(item);

  // add new item to array
  const push = (item: T) => [...array, item];

  // remove item from array
  const pop = (item: T) => array.filter((i) => i !== item);

  return { push, pop, includes };
};
