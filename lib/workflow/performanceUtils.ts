/**
 * Performance Utilities
 * 
 * 性能优化工具函数 (Requirements: 9.3):
 * - 防抖 (Debounce): 延迟执行，只执行最后一次
 * - 节流 (Throttle): 限制执行频率
 * - 请求动画帧节流: 使用requestAnimationFrame优化
 */

/**
 * 防抖函数
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 * 
 * 使用场景:
 * - 参数输入框的值变化
 * - 搜索框输入
 * - 窗口resize事件
 * 
 * Requirements: 9.3
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * 节流函数
 * 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 * 
 * 使用场景:
 * - 滚动事件
 * - 鼠标移动事件
 * - 窗口resize事件
 * 
 * Requirements: 9.3
 * 
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100,
  options: {
    leading?: boolean;  // 是否在开始时执行
    trailing?: boolean; // 是否在结束时执行
  } = {}
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number = 0;

  const { leading = true, trailing = true } = options;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      if (leading) {
        func(...args);
      }
      lastRan = Date.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      if (trailing) {
        if (lastFunc) {
          clearTimeout(lastFunc);
        }
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  };
}

/**
 * 使用requestAnimationFrame的节流函数
 * 确保函数在浏览器下一次重绘之前执行，性能更好
 * 
 * 使用场景:
 * - 滚动事件处理
 * - 动画更新
 * - 视口变化处理
 * 
 * Requirements: 9.3
 * 
 * @param func 要节流的函数
 * @returns 节流后的函数
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * 取消防抖/节流
 * 
 * @param func 防抖或节流后的函数
 */
export function cancel(func: any): void {
  if (func && typeof func.cancel === 'function') {
    func.cancel();
  }
}

/**
 * 批量更新函数
 * 将多次调用合并为一次批量执行
 * 
 * 使用场景:
 * - 批量更新节点参数
 * - 批量更新状态
 * 
 * Requirements: 9.3
 * 
 * @param func 要批量执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 批量更新函数
 */
export function batchUpdate<T>(
  func: (items: T[]) => void,
  wait: number = 50
): (item: T) => void {
  let items: T[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return function addItem(item: T) {
    items.push(item);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (items.length > 0) {
        func([...items]);
        items = [];
      }
      timeout = null;
    }, wait);
  };
}

/**
 * 创建可取消的防抖函数
 * 返回的函数包含cancel方法，可以取消待执行的调用
 * 
 * Requirements: 9.3
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 可取消的防抖函数
 */
export function debounceCancelable<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debouncedFunc = function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  debouncedFunc.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFunc;
}

/**
 * 创建可取消的节流函数
 * 返回的函数包含cancel方法，可以取消待执行的调用
 * 
 * Requirements: 9.3
 * 
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 可取消的节流函数
 */
export function throttleCancelable<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let inThrottle: boolean = false;
  let timeout: NodeJS.Timeout | null = null;

  const throttledFunc = function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      timeout = setTimeout(() => {
        inThrottle = false;
        timeout = null;
      }, limit);
    }
  };

  throttledFunc.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    inThrottle = false;
  };

  return throttledFunc;
}

/**
 * 滚动事件优化器
 * 专门用于优化滚动事件处理
 * 
 * 使用场景:
 * - 参数列表滚动
 * - 虚拟滚动
 * - 无限滚动
 * 
 * Requirements: 9.3
 * 
 * @param callback 滚动回调函数
 * @param options 配置选项
 * @returns 优化后的滚动处理函数
 */
export function optimizeScrollHandler(
  callback: (event: Event) => void,
  options: {
    throttleTime?: number;
    useRAF?: boolean;
    passive?: boolean;
  } = {}
): {
  handler: (event: Event) => void;
  cleanup: () => void;
} {
  const {
    throttleTime = 16, // ~60fps
    useRAF = true,
    passive = true,
  } = options;

  let handler: (event: Event) => void;
  let cleanup: () => void;

  if (useRAF) {
    handler = rafThrottle(callback);
    cleanup = () => {
      // RAF cleanup is handled automatically
    };
  } else {
    const throttledCallback = throttleCancelable(callback, throttleTime);
    handler = throttledCallback;
    cleanup = () => {
      throttledCallback.cancel();
    };
  }

  return { handler, cleanup };
}

/**
 * 参数更新优化器
 * 专门用于优化参数值更新
 * 
 * 使用场景:
 * - 参数输入框值变化
 * - 滑块值变化
 * - 下拉选择变化
 * 
 * Requirements: 9.3
 * 
 * @param callback 更新回调函数
 * @param options 配置选项
 * @returns 优化后的更新函数
 */
export function optimizeParameterUpdate<T>(
  callback: (name: string, value: T) => void,
  options: {
    debounceTime?: number;
    immediate?: boolean;
  } = {}
): {
  update: (name: string, value: T) => void;
  flush: () => void;
  cancel: () => void;
} {
  const {
    debounceTime = 300,
    immediate = false,
  } = options;

  const pendingUpdates = new Map<string, T>();
  let timeout: NodeJS.Timeout | null = null;

  const flush = () => {
    if (pendingUpdates.size > 0) {
      pendingUpdates.forEach((value, name) => {
        callback(name, value);
      });
      pendingUpdates.clear();
    }
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const cancel = () => {
    pendingUpdates.clear();
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const update = (name: string, value: T) => {
    pendingUpdates.set(name, value);

    if (immediate && !timeout) {
      callback(name, value);
      pendingUpdates.delete(name);
      return;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      flush();
    }, debounceTime);
  };

  return { update, flush, cancel };
}

/**
 * 性能监控装饰器
 * 用于监控函数执行性能
 * 
 * Requirements: 9.3
 * 
 * @param func 要监控的函数
 * @param name 函数名称（用于日志）
 * @returns 包装后的函数
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  func: T,
  name: string = 'anonymous'
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = func(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (duration > 16) { // 超过一帧的时间
          console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
        }
      });
    } else {
      const endTime = performance.now();
      const duration = endTime - startTime;
      if (duration > 16) {
        console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      }
      return result;
    }
  }) as T;
}

/**
 * 空闲时执行
 * 在浏览器空闲时执行低优先级任务
 * 
 * Requirements: 9.3
 * 
 * @param callback 要执行的回调
 * @param options 配置选项
 */
export function runWhenIdle(
  callback: () => void,
  options: {
    timeout?: number;
  } = {}
): number {
  const { timeout = 2000 } = options;

  if (typeof window === 'undefined') {
    return 0;
  }

  const win = window as any;
  if ('requestIdleCallback' in win) {
    return win.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return win.setTimeout(callback, 1) as number;
  }
}

/**
 * 取消空闲执行
 * 
 * @param id runWhenIdle返回的ID
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const win = window as any;
  if ('cancelIdleCallback' in win) {
    win.cancelIdleCallback(id);
  } else {
    win.clearTimeout(id);
  }
}
