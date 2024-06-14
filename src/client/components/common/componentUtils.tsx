import React from 'react';

/**
 * Reusable function if you just need to extend an unstyled primitive (like a Radix component) with a classname
 * https://www.radix-ui.com/primitives/docs/guides/styling#extending-a-primitive
 */
export function extendUnstyledPrimitiveWithClass<T extends React.ElementType>(
  Component: T,
  className: string,
  displayName: string,
) {
  type ComponentRef = React.ElementRef<T>;
  type ComponentProps = React.ComponentPropsWithoutRef<T & React.RefAttributes<T>>;

  const WrappedComponent = React.forwardRef<ComponentRef, ComponentProps>(
    ({ className: incomingClassName, ...props }, ref) => (
      // @ts-ignore Don't know how to fix this
      <Component ref={ref} className={classnames(className, incomingClassName)} {...props} />
    ),
  );

  WrappedComponent.displayName = displayName;
  return WrappedComponent;
}
