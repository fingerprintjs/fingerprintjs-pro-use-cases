import { ReactNode, FunctionComponent } from 'react';
import styles from './SignalTable.module.scss';

export type TableCellData = {
  content: ReactNode | ReactNode[];
  className?: string;
};

const SignalTable: FunctionComponent<{ data: TableCellData[][] }> = ({ data }) => {
  return (
    <table className={styles.signalTable}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={cell.className}>
                {cell.content}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SignalTable;
