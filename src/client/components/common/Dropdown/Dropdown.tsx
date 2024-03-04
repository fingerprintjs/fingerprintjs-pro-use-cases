import React from 'react';

import ArrowSVG from './ArrowSVG.svg';
import classNames from 'classnames';
import styles from './Dropdown.module.scss';
import Link from 'next/link';
import { isLocalLink } from '../../../../shared/utils/link';
import Image from 'next/image';

export interface DropdownProps {
  leftColumns?: ColumnProps[];
  rightColumn?: ColumnProps;
  bottomLinkText?: string;
  bottomLinkUrl?: string;
  darkMode?: boolean;
  bottomLinkTextRight?: string;
  bottomLinkUrlRight?: string;
}
export default function Dropdown({
  leftColumns,
  rightColumn,
  bottomLinkText,
  bottomLinkUrl,
  bottomLinkTextRight,
  bottomLinkUrlRight,
  darkMode,
  closeDropdown,
}: DropdownProps & { closeDropdown: () => void }) {
  const onlyLeftColumn = leftColumns && !rightColumn;
  return (
    <div className={classNames(styles.container, { [styles.darkDropdown]: darkMode })}>
      <section className={classNames(styles.dropdown, { [styles.dropdownBottom]: bottomLinkTextRight })}>
        {leftColumns && (
          <div className={classNames(styles.columns, { [styles.onlyLeft]: onlyLeftColumn })}>
            {leftColumns.map(({ title, list, cardBackground }, index) => (
              <Column
                key={title ?? index}
                title={title}
                list={list}
                cardBackground={cardBackground}
                closeDropdown={closeDropdown}
              />
            ))}
          </div>
        )}
        {bottomLinkText && bottomLinkUrl && (
          <div className={styles.bottomRow}>
            {isLocalLink(bottomLinkUrl) ? (
              <Link href={bottomLinkUrl} className={styles.bottomLink} onClick={closeDropdown}>
                <span>{bottomLinkText}</span>
                <Image src={ArrowSVG} className={styles.arrow} alt='' />
              </Link>
            ) : (
              <a
                href={bottomLinkUrl}
                className={styles.bottomLink}
                target='_blank'
                rel='noreferrer'
                onClick={closeDropdown}
              >
                <span>{bottomLinkText}</span>
                <Image src={ArrowSVG} className={styles.arrow} alt='' />
              </a>
            )}
          </div>
        )}

        {rightColumn && (
          <aside className={styles.rightSection}>
            {rightColumn.title && <p className={styles.rightSectionLabel}>{rightColumn.title}</p>}
            <div className={styles.rightColumns}>
              {rightColumn.list.map(({ title, url, description }, index) =>
                isLocalLink(url) ? (
                  <Link key={`${index}-${url}`} href={url} className={styles.link} onClick={closeDropdown}>
                    <li className={styles.rightSectionRow}>
                      <h3 className={styles.linkTitle}>{title}</h3>
                      {description && <p className={styles.linkDescription}>{description}</p>}
                    </li>
                  </Link>
                ) : (
                  <a
                    key={`${index}-${url}`}
                    href={url}
                    className={styles.link}
                    target='_blank'
                    rel='noreferrer'
                    onClick={closeDropdown}
                  >
                    <li className={styles.rightSectionRow}>
                      <h3 className={styles.linkTitle}>{title}</h3>
                      {description && <p className={styles.linkDescription}>{description}</p>}
                    </li>
                  </a>
                ),
              )}
            </div>
          </aside>
        )}
        {bottomLinkTextRight && bottomLinkUrlRight && (
          <div className={styles.bottomRowRight}>
            {isLocalLink(bottomLinkUrlRight) ? (
              <Link href={bottomLinkUrlRight} className={styles.bottomLink} onClick={closeDropdown}>
                <span>{bottomLinkTextRight}</span>
                <Image src={ArrowSVG} className={styles.arrow} alt='' />
              </Link>
            ) : (
              <a
                href={bottomLinkUrlRight}
                className={styles.bottomLink}
                target='_blank'
                rel='noreferrer'
                onClick={closeDropdown}
              >
                <span>{bottomLinkTextRight}</span>
                <Image src={ArrowSVG} className={styles.arrow} alt='' />
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
interface ColumnProps {
  title?: string;
  cardBackground?: boolean;
  list: Array<{ title: string | React.ReactNode; url: string; description?: string; useCasesLink?: string }>;
}
function Column({ title, list, cardBackground, closeDropdown }: ColumnProps & { closeDropdown: () => void }) {
  return (
    <>
      <div className={styles.column}>
        {title && <p className={styles.label}>{title}</p>}
        <div className={styles.rows}>
          {list.map(({ title, url, description }, index) => (
            <div key={`${url}-${index}`}>
              {isLocalLink(url) ? (
                <div className={styles.columnLink}>
                  <Link href={url} onClick={() => closeDropdown()}>
                    <li className={classNames(styles.row, { [styles.background]: cardBackground })}>
                      <h3 className={styles.linkTitle}>{title}</h3>
                      {description && <p className={styles.linkDescription}>{description}</p>}
                    </li>
                  </Link>
                </div>
              ) : (
                <a
                  href={url}
                  className={styles.columnLink}
                  target='_blank'
                  rel='noreferrer'
                  onClick={() => closeDropdown()}
                >
                  <li className={classNames(styles.row, { [styles.background]: cardBackground })}>
                    <h3 className={styles.linkTitle}>{title}</h3>
                    {description && <p className={styles.linkDescription}>{description}</p>}
                  </li>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
