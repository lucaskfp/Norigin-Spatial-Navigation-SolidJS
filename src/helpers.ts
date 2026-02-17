export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true } = options;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let leadingInvoked = false;

  function invoke(args: Parameters<T>) {
    fn(...args);
  }

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastCallTime = Date.now();

    if (leading && !leadingInvoked && timerId === null) {
      leadingInvoked = true;
      invoke(args);
    }

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      timerId = null;
      if (trailing && lastArgs) {
        if (!leading || !leadingInvoked || lastCallTime !== null) {
          invoke(lastArgs);
        }
      }
      leadingInvoked = false;
      lastArgs = null;
      lastCallTime = null;
    }, wait);
  } as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = null;
    lastArgs = null;
    lastCallTime = null;
    leadingInvoked = false;
  };

  return debounced;
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
): DebouncedFunction<T> {
  const { leading = true, trailing = true } = options;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastInvokeTime = 0;

  function invoke(args: Parameters<T>) {
    lastInvokeTime = Date.now();
    fn(...args);
  }

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastInvokeTime);

    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (leading) {
        invoke(args);
      } else {
        lastArgs = args;
        if (trailing && timerId === null) {
          timerId = setTimeout(() => {
            timerId = null;
            if (lastArgs) {
              invoke(lastArgs);
              lastArgs = null;
            }
          }, wait);
        }
      }
    } else if (trailing && timerId === null) {
      timerId = setTimeout(() => {
        timerId = null;
        if (lastArgs) {
          invoke(lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  } as DebouncedFunction<T>;

  throttled.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = null;
    lastArgs = null;
    lastInvokeTime = 0;
  };

  return throttled;
}

let idCounter = 0;
export function uniqueId(prefix = ''): string {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}
