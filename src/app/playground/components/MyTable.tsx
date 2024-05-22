import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';
import { ReactNode, FunctionComponent } from 'react';

export type TableCellData = {
  content: ReactNode | ReactNode[];
  cellStyle?: SxProps<Theme>;
};

const MyTable: FunctionComponent<{ data: TableCellData[][] }> = ({ data }) => {
  return (
    <table>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell.content}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MyTable;
