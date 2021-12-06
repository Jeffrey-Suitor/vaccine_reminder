import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styled from "styled-components";
import React from "react";

const RowIndicatorTableCell = styled(TableCell)`
    font-weight: bold;
    width: 10ch;
    position: sticky;
    left: 0;
    background-color: black;
    color: white;
    border: 1px solid rgba(224, 224, 224, 1);
    max-width: 10ch;
`

const ColumnIndicatorTableCell = styled(TableCell)`
    font-weight: bold;
    width: 10rem;
    padding: 20px;
    background-color: black;
    color: white;
    position: sticky;
    top: 0;
    border: 1px solid rgba(224, 224, 224, 1);
    max-width: 10ch;
`

const ColumnIndicatorRow = styled(TableRow)`
    position: sticky;
    top: 0;
`;

const ScrollWrapper = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`

const TableCellStyled = styled(TableCell)<{row:number, col: number, top:number, right:number, bottom:number, left:number, uniqueidcol:number, hideunselected:string, showcolours:string}>`
    border: 1px solid rgba(224, 224, 224, 1);
    max-width: 10ch;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: ${props => {
        if (props.showcolours === "false") return "inherit";
        else if (props.col === props.uniqueidcol) return "white";
        else if (props.row === props.top) return "white";
        else if (props.col === props.right) return "white";
        else if (props.row === props.bottom) return "white";
        else if (props.col === props.left) return "white";
    }};
    background-color: ${props => {
        if (props.showcolours === "false") return "inherit";
        else if (props.col === props.uniqueidcol) return "red";
        else if (props.row === props.top) return "purple";
        else if (props.col === props.right) return "teal";
        else if (props.row === props.bottom) return "maroon";
        else if (props.col === props.left) return "#9932CC";
    }};
    visibility: ${props => {
        if (props.hideunselected === "false") return "visible";
        else if (props.row < props.top) return "hidden";
        else if (props.col > props.right) return "hidden";
        else if (props.row > props.bottom) return "hidden";
        else if (props.col < props.left) return "hidden";
    }};
`

type SheetTableProps = {
    originalArray: Array<Array<any>>,
    top: number,
    right: number
    bottom: number,
    left: number,
    uniqueIdCol: number,
    maxRight: number,
    showColours: boolean,
    hideUnselected: boolean
}

export default function SheetTable ({originalArray, top, right, bottom, left, uniqueIdCol, maxRight, showColours, hideUnselected}: SheetTableProps) {

    const columnIndicator = () => {
        var columnList = [];
        for (let i = 0; i < maxRight + 1; i++) {
            columnList.push(<ColumnIndicatorTableCell align="center" key={`col-indicator-${i}`}>{i === 0 ? "" : i}</ColumnIndicatorTableCell>)
        }
        return columnList;
    }

    const generateCells = (row:Array<any>, rowIdx:number) => {
        return row.map((cell, cellIdx) => {
            return (
                <React.Fragment key={`row-wrapper-${cellIdx}`}>
                    {cellIdx === 0 && <RowIndicatorTableCell align="center" key={`row-indicator-${rowIdx}`}>{rowIdx+1}</RowIndicatorTableCell>}
                    <TableCellStyled 
                        align="center" 
                        key={`${rowIdx}-${cellIdx}`} 
                        row={rowIdx + 1}
                        col={cellIdx + 1}
                        top={top} 
                        right={right} 
                        bottom={bottom} 
                        left={left}
                        uniqueidcol={uniqueIdCol}
                        hideunselected={hideUnselected.toString()}
                        showcolours={showColours.toString()}
                    >
                        {cell}
                    </TableCellStyled>
                </React.Fragment>
            );
        });
    }

    const generateRows = (originalArray:Array<Array<any>>) => {
        return originalArray.map((row, rowIdx) => {
            return (
                <TableRow key={`row${rowIdx+1}`}>
                    {generateCells(row, rowIdx)}
                </TableRow>
            );
        })
    };

    return (
        <ScrollWrapper>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableBody>
                        <ColumnIndicatorRow>{columnIndicator()}</ColumnIndicatorRow>
                        {generateRows(originalArray)}
                    </TableBody>
                </Table>
            </TableContainer>
        </ScrollWrapper>
    )
}
