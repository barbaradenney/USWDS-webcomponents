/**
 * Call a function every X amount of milliseconds.
 *
 * SOURCE: uswds-core/src/js/utils/debounce.js
 *
 * @param callback - A callback function to be debounced
 * @param delay - Milliseconds to wait before calling function
 * @returns A debounced function
 * @example const updateStatus = debounce((string) => console.log(string), 2000)
 */
export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  delay = 500
): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
