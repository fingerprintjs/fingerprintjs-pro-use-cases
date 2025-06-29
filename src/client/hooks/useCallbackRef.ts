import * as React from 'react';

/**
 * Stolen from Radix UI
 * https://github.com/radix-ui/primitives/blob/79304015e13a31bc465545fa1d20e743a0bce3c5/packages/react/use-callback-ref/src/use-callback-ref.tsx
 *
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 */
function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  // https://github.com/facebook/react/issues/19240
  return React.useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}

export { useCallbackRef };
