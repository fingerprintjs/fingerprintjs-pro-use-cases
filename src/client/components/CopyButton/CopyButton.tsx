import { FunctionComponent, useEffect, useState } from 'react';
import { CopyButtonSvg } from '../../img/CopyButtonSvg';
import { CheckMarkSvg } from '../../img/CheckmarkSvg';
import styles from './CopyButton.module.scss';
import classnames from 'classnames';

type CopyButtonProps = {
  contentToCopy: string;
  ariaLabel?: string;
  className?: string;
  onCopy?: () => void;
};

export const MyCopyButton: FunctionComponent<CopyButtonProps> = ({ contentToCopy, ariaLabel, className, onCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  async function onCopyClick() {
    await navigator.clipboard.writeText(contentToCopy);
    setIsCopied(true);
    onCopy?.();
  }

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = setTimeout(() => setIsCopied(false), 1000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  return (
    <button
      onClick={onCopyClick}
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      className={classnames(styles.copyButton, className)}
    >
      {isCopied ? (
        <div className={styles.copiedContainer}>
          Copied
          <CheckMarkSvg className={styles.copyIcon} />
        </div>
      ) : (
        <CopyButtonSvg className={styles.copyIcon} />
      )}
    </button>
  );
};
