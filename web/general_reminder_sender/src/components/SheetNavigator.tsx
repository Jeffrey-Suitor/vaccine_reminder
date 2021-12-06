import {Paper, Tabs, Tab, Button} from "@material-ui/core";
import styled from "styled-components";
import * as FirebaseService from "../services/Firebase";
import React, {useRef} from "react";

type SheetNavigatorProps = {
    sheets: Array<String>,
    savedSheets: Array<String>,
    activeSheet: String,
    handleTabChange: (event:any, newValue:any) => void,
    saveSheet: () => void
}

const AddSheetButton = styled(Button)`
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
`;

const SaveButton = styled(Button)<{activesheetsavestatus:string}>`
    --backgroundColor: ${props => (props.activesheetsavestatus === "Unsaved" ? "orange" : "green")};
    color: white;
    background-color: var(--backgroundColor);
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    padding-right: 12px;
    height: 100%;
    width: 10%;
    :hover {
        filter: brightness(120%);
        background-color: var(--backgroundColor);
    }

`

const PaperStyled = styled(Paper)`
    position: relative;
`;

const TabStyled = styled(Tab)<{savestatus:string}>`
    :before {
        content: '';
        display: ${props => (props.savestatus === "Unsaved" ? "inline-block" : "none")};
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        margin-right: 0.25rem;
        background-color: orange;
    }
`

export default function SheetNavigator({ sheets, savedSheets, activeSheet, handleTabChange, saveSheet }: SheetNavigatorProps) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const uploadSpreadsheet = (event:any) => {
        FirebaseService.uploadSpreadsheet(Object.values(event.target.files));
    }

    const idxCurTab = sheets.indexOf(activeSheet);
    const currentTab = idxCurTab === -1 ? 0 : idxCurTab;

    const idxSave = savedSheets.indexOf(activeSheet);
    const activeSheetSaveStatus = idxSave === -1 ? "Unsaved" : "Saved";
    
    const allTabs = sheets.map((tab, idx) => {
        var saveIdx = savedSheets.indexOf(tab);
        var saveStatus = saveIdx === -1 ? "Unsaved" : "Saved";
        return <TabStyled savestatus={saveStatus} label={tab} key={idx} />
    });

    return (
        <PaperStyled>
            <AddSheetButton onClick={() => inputRef!.current!.click()} >
                Add Spreadsheet
                <input
                    type="file"
                    hidden
                    onChange={uploadSpreadsheet}
                    ref={inputRef}
                />
            </AddSheetButton>

            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                {allTabs}
            </Tabs>
            <SaveButton onClick={() => saveSheet()} activesheetsavestatus={activeSheetSaveStatus}>{activeSheetSaveStatus}</SaveButton>
        </PaperStyled>
    )
}
