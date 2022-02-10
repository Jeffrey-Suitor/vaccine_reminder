import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import React from 'react';
import {useSheet} from './providers/SheetProvider';
import {useSheetToggles} from './providers/SheetTogglesProvider';

const RowIndicatorTableCell = styled(TableCell)`
  && {
    font-weight: bold;
    width: 5;
    position: sticky;
    left: 0;
    background-color: black;
    color: white;
    border: 1px solid whiteSmoke;
    max-width: 5ch;
  }
`;

const ColumnIndicatorTableCell = styled(TableCell)`
  && {
    font-weight: bold;
    width: 10rem;
    padding: 20px;
    background-color: black;
    color: white;
    position: sticky;
    top: 0;
    border: 1px solid rgba(224, 224, 224, 1);
    max-width: 10ch;
  }
`;

const ColumnIndicatorRow = styled(TableRow)`
  && {
    position: sticky;
    top: 0;
  }
`;

const ScrollWrapper = styled.div`
  && {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
`;

const TableCellStyled = styled(TableCell)`
  && {
    border: 1px solid rgba(224, 224, 224, 1);
    max-width: 10ch;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export default function SheetTable() {
  const {top, right, bottom, left, uniqueIdCol, arrayGrid} = useSheet();
  const {showUnselected, showColours} = useSheetToggles();

  const columnIndicator = () => {
    const columnList = [];
    for (let i = 0; i < arrayGrid[0].length + 1; i++) {
      columnList.push(
        <ColumnIndicatorTableCell align="center" key={`col-indicator-${i}`}>
          {i === 0 ? '' : i}
        </ColumnIndicatorTableCell>
      );
    }
    return columnList;
  };

  const generateCells = (rowValues: (string | null)[], rowIdx: number) => {
    return rowValues.map((cell, cellIdx) => {
      const row = rowIdx + 1;
      const col = cellIdx + 1;
      return (
        <React.Fragment key={`row-wrapper-${cellIdx}`}>
          {cellIdx === 0 && (
            <RowIndicatorTableCell
              align="center"
              key={`row-indicator-${rowIdx}`}
            >
              {row}
            </RowIndicatorTableCell>
          )}
          <TableCellStyled
            align="center"
            key={`${rowIdx}-${cellIdx}`}
            sx={{
              visibility: () => {
                if (showUnselected) return 'visible';
                else if (row < top) return 'hidden';
                else if (col > right) return 'hidden';
                else if (row > bottom) return 'hidden';
                else if (col < left) return 'hidden';
              },
              backgroundColor: () => {
                if (!showColours) return 'inherit';
                else if (col === uniqueIdCol) return 'red';
                else if (row === top) return 'purple';
                else if (col === right) return 'teal';
                else if (row === bottom) return 'maroon';
                else if (col === left) return '#9932CC';
              },
              color: () => {
                if (!showColours) return 'inherit';
                else if (col === uniqueIdCol) return 'white';
                else if (row === top) return 'white';
                else if (col === right) return 'white';
                else if (row === bottom) return 'white';
                else if (col === left) return 'white';
              },
            }}
          >
            {cell}
          </TableCellStyled>
        </React.Fragment>
      );
    });
  };

  const generateRows = () => {
    return arrayGrid.map((row: string[], rowIdx: number) => {
      return (
        <TableRow key={`row${rowIdx + 1}`}>
          {generateCells(row, rowIdx)}
        </TableRow>
      );
    });
  };

  return (
    <ScrollWrapper>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableBody>
            <ColumnIndicatorRow>{columnIndicator()}</ColumnIndicatorRow>
            {generateRows()}
          </TableBody>
        </Table>
      </TableContainer>
    </ScrollWrapper>
  );
}
