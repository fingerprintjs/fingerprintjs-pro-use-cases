import classnames from 'classnames';
import React, { ComponentType, RefAttributes } from 'react';

/**
 * Reusable function if you just need to extend an unstyled primitive (like a Radix component) with a classname
 * https://www.radix-ui.com/primitives/docs/guides/styling#extending-a-primitive
 */
export function extendUnstyledPrimitiveWithClass<P extends { className?: string }, R>(
  Component: ComponentType<P & RefAttributes<R>>,
  className: string,
  displayName: string,
) {
  const WrappedComponent = React.forwardRef<R, P>(({ className: incomingClassName, ...props }, ref) => (
    <Component ref={ref} className={classnames(className, incomingClassName)} {...(props as P)} />
  ));

  WrappedComponent.displayName = displayName;
  return WrappedComponent;
}
