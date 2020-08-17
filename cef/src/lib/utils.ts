import { useEffect, useRef, useState, useCallback } from 'react'

export function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<Function>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current)
        savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

/**
 * Escape a regexp pattern
 * @param {string} string 
 */
export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Get a random int
 * @param {number} max 
 */
export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max))
}

export function useThrottle(fn: Function, timeout: number = 300) {
  const [ready, setReady] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  if (!fn || typeof fn !== "function") {
    throw new Error(
      "As a first argument, you need to pass a function to useThrottle hook."
    );
  }

  const throttledFn = useCallback(
    (...args) => {
      if (!ready) {
        return;
      }

      setReady(false);
      fn(...args)
    },
    [ready, fn]
  );

  useEffect(() => {
    if (!ready) {
      timerRef.current = setTimeout(() => {
        setReady(true)
      }, timeout)
      return () => timerRef.current && clearTimeout(timerRef.current)
    }
  }, [ready, timeout])
  return [throttledFn, ready]
}