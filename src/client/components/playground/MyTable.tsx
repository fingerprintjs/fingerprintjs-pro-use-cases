import { Theme } from '@emotion/react';
import { SxProps, TableContainer, Paper, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { ReactNode, FunctionComponent } from 'react';

export type TableCellData = {
  content: ReactNode | ReactNode[];
  cellStyle?: SxProps<Theme>;
};

const MyTable: FunctionComponent<{ data: TableCellData[][] }> = ({ data }) => {
  return (
    <TableContainer component={Paper} sx={{ mb: (t) => t.spacing(3) }} elevation={3}>
      <Table size='small'>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j} sx={{ ...cell.cellStyle }}>
                  {cell.content}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyTable;
