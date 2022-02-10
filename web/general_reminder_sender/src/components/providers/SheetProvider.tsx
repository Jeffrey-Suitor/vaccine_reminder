import React, {useEffect, useContext, useState} from 'react';
import {streamSheetsCollection, updateUserDoc} from '../../services/Firebase';
import {useSheetToggles} from './SheetTogglesProvider';

type SheetControlState = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  uniqueIdCol: number;
  maxRight: number;
  maxBottom: number;
  sheetId: string;
  originalArrayString: string;
  parsedData: Object;
};

type SheetsById = Record<SheetControlState['sheetId'], SheetControlState>;

const SheetContext = React.createContext(null);
export const useSheet = () => useContext(SheetContext);

const SheetUpdateContext = React.createContext(null);
export const useUpdateSheet = () => useContext(SheetUpdateContext);

const SheetManagerContext = React.createContext(null);
export const useSheetManager = () => useContext(SheetManagerContext);

const SheetManagerUpdateContext = React.createContext(null);
export const useUpdateSheetManager = () => {
  return useContext(SheetManagerUpdateContext);
};

export function SheetManagerProvider({children}) {
  const [allSheets, setAllSheets] = useState<SheetsById>({});
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [savedSheets, setSavedSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState({} as SheetControlState);
  const [arrayGrid, setArrayGrid] = useState<string[][]>([[]]);
  const [localParsedData, setLocalParsedData] = useState({});

  const {mergeDirection} = useSheetToggles();

  function updateSheetVal(val: number, loc: string) {
    const maxVal = 9999;
    const minVal = 0;
    // loc: [Left edge, right edge]
    const instructions = {
      top: [1, sheet.maxBottom || maxVal],
      right: [sheet.left || minVal, sheet.maxRight || maxVal],
      bottom: [sheet.top || minVal, sheet.maxBottom || maxVal],
      left: [1, sheet.maxRight || maxVal],
      uniqueIdCol: [1, sheet.maxBottom || maxVal],
    };
    const choice = instructions[loc];
    val = val < choice[0] ? choice[0] : val;
    val = val > choice[1] ? choice[1] : val;
    setSheet({...sheet, [loc]: val});
  }

  // Save the current sheet
  function saveSheet() {
    const sheet_list = [...savedSheets, sheet.sheetId];
    updateUserDoc({savedSheets: sheet_list});
    setSavedSheets(sheet_list);
  }

  // Download all sheets at the start
  useEffect(() => {
    const unsub = streamSheetsCollection(snapshot => {
      const updatedSheets = {};
      let id = '';
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        id = data.sheetId;
        updatedSheets[id] = data;
      });
      const combinedSheets = {...allSheets, ...updatedSheets};
      setAllSheets(combinedSheets); // Update the list of all sheets
      setSheet(combinedSheets[id]); // Set the current sheet
      setActiveSheet(id); // Set the active sheet id
    });
    return () => unsub();
  }, []);

  // Unsave upon change
  useEffect(() => {
    const filt = savedSheets.filter(e => e !== activeSheet);
    if (filt.length === savedSheets.length) return;
    setSavedSheets(filt);
    updateUserDoc({savedSheets: filt});
  }, [sheet]);

  // Update the value based on the preview
  useEffect(() => {
    if (JSON.stringify(sheet) === JSON.stringify({})) return; // If no sheet
    if (sheet === undefined) return; // If no sheet
    const {left, right, top, bottom, uniqueIdCol} = sheet;
    const fullTrimmedArray = arrayGrid
      .slice(top - 1, bottom)
      .map((row: string[]) => row.slice(left - 1, right));

    const header = fullTrimmedArray[0];
    const trimmedArray = fullTrimmedArray.slice(1, fullTrimmedArray.length);

    if (mergeDirection === 'Down') trimmedArray.reverse();

    const allInstances = {};
    let prevId = '';
    let currentObject = {};
    let uid = '';
    for (let i = 0; i < trimmedArray.length; i++) {
      uid = trimmedArray[i][uniqueIdCol - 1];

      // If the uid is a stirng and there is no value recorded for that instance
      if (JSON.stringify(allInstances[uid]) === undefined && uid !== '') {
        currentObject = {};
        for (const j in header) {
          currentObject[header[j]] = [trimmedArray[i][j]]; // Wrap all values in an array
        }
        allInstances[uid] = currentObject; // Save the current object
        prevId = uid; // Save the prev uid
      } else {
        for (const j in header) {
          const val = trimmedArray[i][j];
          // Non unique column is empty
          if (val !== '' && prevId !== '') {
            allInstances[prevId][header[j]].push(val); // Push the new value into the array
          }
        }
      }
    }
    allInstances[uid] = currentObject; // Save the current object

    // Clear all arrays of 1
    for (const i in allInstances) {
      for (const j in allInstances[i]) {
        if (allInstances[i][j].length === 1) {
          allInstances[i][j] = allInstances[i][j][0];
        }
      }
    }
    setLocalParsedData(allInstances);
  }, [sheet, mergeDirection, arrayGrid]);

  // Store the current sheet and change to the new sheet
  useEffect(() => {
    if (JSON.stringify(sheet) === JSON.stringify({})) return; // If no sheet
    if (activeSheet === '') return; // If no active sheet
    sheet.parsedData = localParsedData;
    setAllSheets({...allSheets, [sheet?.sheetId]: sheet}); // Update the list of all sheets
    const curSheet = allSheets[activeSheet];
    setSheet(curSheet);

    const parsedArray = JSON.parse(curSheet.originalArrayString);
    const {maxRight, maxBottom} = curSheet;

    const arrayGrid = [...Array(maxBottom)].map(() => Array(maxRight).fill(''));

    parsedArray.forEach((row: (string | null)[], i: number) => {
      row.forEach((col: string | null, j: number) => {
        arrayGrid[i][j] = col ? col.trim() : '';
      });
    });

    setArrayGrid(arrayGrid);
  }, [activeSheet]);

  return (
    <SheetManagerContext.Provider value={{allSheets, activeSheet, savedSheets}}>
      <SheetManagerUpdateContext.Provider value={{saveSheet, setActiveSheet}}>
        <SheetContext.Provider value={{...sheet, arrayGrid, localParsedData}}>
          <SheetUpdateContext.Provider value={{updateSheetVal}}>
            {children}
          </SheetUpdateContext.Provider>
        </SheetContext.Provider>
      </SheetManagerUpdateContext.Provider>
    </SheetManagerContext.Provider>
  );
}
