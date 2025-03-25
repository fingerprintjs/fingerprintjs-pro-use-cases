import { ReactNode, FunctionComponent } from 'react';
import styles from './SignalTable.module.scss';
import { motion } from 'framer-motion';

export type TableCellData = {
  content: ReactNode | ReactNode[];
  className?: string;
  colSpan?: number;
};

const SignalTable: FunctionComponent<{ data: TableCellData[][] }> = ({ data }) => {
  return (
    <table className={styles.signalTable}>
      <tbody>
        {data.map((row, rowIndex) => (
          <motion.tr
            key={rowIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: rowIndex * 0.1 }}
          >
            {row.map((cell, j) => (
              <td key={j} className={cell.className} colSpan={cell.colSpan}>
                {cell.content}
              </td>
            ))}
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
};

export default SignalTable;
