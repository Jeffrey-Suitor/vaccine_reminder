import * as FirebaseService from "../services/Firebase";
import {useState, useEffect} from "react";
import SheetNavigator from "./SheetNavigator";
import SheetTable from "./SheetTable";
import SheetControls from "./SheetControls";
import SheetOutputPreview from "./SheetOutputPreview";
import CircularProgress from "@material-ui/core/CircularProgress"
import styled from "styled-components";

type EditDataProps = {
    prevStage: () => void,
    nextStage: () => void
}

type UserDocState = {
    sheets: Array<string>,
    savedSheets: Array<string>,
    activeSheet: string,
    userId: string
}

type CurrentSheetControlsProps = {
    top: number,
    right: number,
    bottom: number,
    left: number,
    uniqueIdCol: number,
    maxRight: number,
    maxBottom: number,
    sheetId: string
}


type CurrentSheetTogglesProps = {
    mergeDirection: string,
    showPreview: boolean,
    showColours: boolean,
    hideUnselected: boolean
}

const HorizontalFlexWrap = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    height: 100%;
    width: 100%;
    overflow: auto;
`;

export default function EditData({prevStage, nextStage}: EditDataProps) {

    const [userDoc, setUserDoc] = useState<UserDocState>({
        sheets: [],
        savedSheets: [],
        activeSheet: "none",
        userId: "none"
    });


    const [currentSheetControls, setCurrentSheetControls] = useState<CurrentSheetControlsProps>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        uniqueIdCol: 0,
        maxRight: 0,
        maxBottom: 0,
        sheetId: "none"
    });


    const [currentSheetToggles, setCurrentSheetToggles] = useState<CurrentSheetTogglesProps>({
        mergeDirection: "Down",
        showPreview: true,
        showColours: true,
        hideUnselected: true
    });

    const [originalArray, setOriginalArray] = useState<Array<Array<any>>>([['none']])

    const [loading, setLoading] = useState(0);

    useEffect(() => {
        const unsubscribe = FirebaseService.streamUserDoc({
        next: (userDocRef:any) => {

            const data = userDocRef.data();
            if (!data?.sheets) { return; }

            setUserDoc({
                sheets: data.sheets,
                savedSheets: data.savedSheets,
                activeSheet: data.activeSheet,
                userId: data.userId
            });
        },
            error: (ERROR:any) => {console.log(`UserDoc error is ${ERROR}`)}
        });
        return unsubscribe;
    }, [setUserDoc]);


    useEffect(() => {
        const unsubscribe = FirebaseService.streamCurrentSheetDoc(userDoc.activeSheet, {
        next: (currentSheetDocRef:any) => {
            updateCurrentSheetState(currentSheetDocRef);
        },
            error: (ERROR:any) => {console.log(`CurrentSheetDoc error is ${ERROR}`)}
        });
        return unsubscribe;
    }, [userDoc, setCurrentSheetControls, setOriginalArray]);

    const updateCurrentSheetState = (ref:any) => {
        const data = ref.data();
        if (data === undefined) { return; }


        setOriginalArray(JSON.parse(data.originalArray));

        setCurrentSheetControls({
            top: data.top,
            right: data.right,
            bottom: data.bottom,
            left: data.left,
            uniqueIdCol: data.uniqueIdCol,
            maxRight: data.maxRight,
            maxBottom: data.maxBottom,
            sheetId: data.sheetId
        });

        setLoading(0);
    }


    const handleTabChange = async (_event:any, newValue:number) => {
        setLoading(1);
        FirebaseService.updateCurrentSheetDoc(userDoc.activeSheet, currentSheetControls);
        userDoc.activeSheet = userDoc.sheets[newValue];
        setUserDoc(userDoc);
        FirebaseService.updateUserDoc(userDoc);
        const doc = await FirebaseService.getCurrentSheetDoc(userDoc.activeSheet);
        updateCurrentSheetState(doc)
    };


    const saveSheet = () => {
        userDoc.savedSheets.push(userDoc.activeSheet)

        // Get unique elements
        userDoc.savedSheets.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        setUserDoc(userDoc);
        FirebaseService.updateUserDoc(userDoc);
        FirebaseService.updateCurrentSheetDoc(userDoc.activeSheet, currentSheetControls);
    };

    return (
        <>
            <SheetNavigator
                sheets={userDoc.sheets}
                savedSheets={userDoc.savedSheets}
                activeSheet={userDoc.activeSheet}
                handleTabChange={handleTabChange}
                saveSheet={saveSheet}
            />

            {loading
                ? <HorizontalFlexWrap><CircularProgress size="300px"/></HorizontalFlexWrap>
                : <HorizontalFlexWrap>
                        <SheetControls
                            currentSheetControls={currentSheetControls}
                            setCurrentSheetControls={setCurrentSheetControls}
                            currentSheetToggles={currentSheetToggles}
                            setCurrentSheetToggles={setCurrentSheetToggles}
                        />
                        <SheetTable 
                            originalArray={originalArray}
                            top={currentSheetControls.top}
                            right={currentSheetControls.right}
                            bottom={currentSheetControls.bottom}
                            left={currentSheetControls.left}
                            uniqueIdCol={currentSheetControls.uniqueIdCol}
                            maxRight={currentSheetControls.maxRight}
                            showColours={currentSheetToggles.showColours}
                            hideUnselected={currentSheetToggles.hideUnselected}
                        />
                        {currentSheetToggles.showPreview && <SheetOutputPreview 
                            originalArray={originalArray}
                            top={currentSheetControls.top}
                            right={currentSheetControls.right}
                            bottom={currentSheetControls.bottom}
                            left={currentSheetControls.left}
                            uniqueIdCol={currentSheetControls.uniqueIdCol}
                            mergeDirection={currentSheetToggles.mergeDirection}
                        />}
                    </HorizontalFlexWrap>
            }
        </>
    )
}
