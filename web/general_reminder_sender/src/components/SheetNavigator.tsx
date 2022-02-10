import {Paper, Tabs, Tab, Button} from '@mui/material';
import styled from 'styled-components';
import * as FirebaseService from '../services/Firebase';
import React, {useRef} from 'react';
import {
  useSheetManager,
  useUpdateSheetManager,
} from './providers/SheetProvider';

const AddSheetButton = styled(Button)`
  && {
    --backgroundColor: blue;
    color: white;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    padding-left: 12px;
    background-color: var(--backgroundColor);
    height: 100%;
    :hover {
      filter: brightness(120%);
      background-color: var(--backgroundColor);
    }
  }
`;

const SaveButton = styled(Button)<{savestatus: string}>`
  && {
    --bgColor: ${props =>
      props.savestatus === 'Unsaved' ? 'orange' : 'green'};
    color: white;
    background-color: var(--bgColor);
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    padding-right: 12px;
    height: 100%;
    width: 10%;
    :hover {
      filter: brightness(120%);
      background-color: var(--bgColor);
    }
  }
`;

const PaperStyled = styled(Paper)`
  && {
    position: relative;
  }
`;

const TabStyled = styled(Tab)<{savestatus: string}>`
  && {
    padding: ${props =>
      props.savestatus === 'Unsaved'
        ? '0rem 2rem 0rem 0.5rem'
        : '0rem, 0.5rem'};
  }
  :before {
    content: '';
    display: ${props =>
      props.savestatus === 'Unsaved' ? 'inline-block' : 'none'};
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: orange;
    position: relative;
    top: 1rem;
    right: calc(-50% - 1rem);
    /* text-align: right; */
  }
`;

export default function SheetNavigator() {
  const {allSheets, activeSheet, savedSheets} = useSheetManager();
  const {saveSheet, setActiveSheet} = useUpdateSheetManager();
  const sheetsArray = Object.keys(allSheets);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadSpreadsheet = (event: React.ChangeEvent<HTMLInputElement>) => {
    FirebaseService.uploadSpreadsheet(Object.values(event.target.files));
  };

  const idxSave = savedSheets.indexOf(activeSheet);
  const activeSheetSaveStatus = idxSave === -1 ? 'Unsaved' : 'Saved';

  const allTabs = sheetsArray.map((tab, idx) => {
    const saveIdx = savedSheets.indexOf(tab);
    const saveStatus = saveIdx === -1 ? 'Unsaved' : 'Saved';
    return <TabStyled savestatus={saveStatus} label={tab} key={idx} />;
  });

  const activeTab = sheetsArray.indexOf(activeSheet) || 0;

  const handleChange = (_event: React.SyntheticEvent, newTabVal: number) => {
    setActiveSheet(sheetsArray[newTabVal]);
  };

  return (
    <PaperStyled>
      <AddSheetButton onClick={() => inputRef!.current!.click()}>
        Add Spreadsheet
        <input type="file" hidden onChange={uploadSpreadsheet} ref={inputRef} />
      </AddSheetButton>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        {allTabs}
      </Tabs>
      <SaveButton
        onClick={() => saveSheet()}
        savestatus={activeSheetSaveStatus}
      >
        {activeSheetSaveStatus}
      </SaveButton>
    </PaperStyled>
  );
}
