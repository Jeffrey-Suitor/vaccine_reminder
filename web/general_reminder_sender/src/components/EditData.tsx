import * as FirebaseService from '../services/Firebase';
import {useState, useEffect} from 'react';
import SheetNavigator from './SheetNavigator';
import SheetTable from './SheetTable';
import SheetControls from './SheetControls';
import SheetOutputPreview from './SheetOutputPreview';
import CircularProgress from '@mui/material/CircularProgress';
import styled from 'styled-components';
import {useSheetToggles} from './providers/SheetTogglesProvider';

const HorizontalFlexWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

export default function EditData() {
  const [loading, setLoading] = useState(0);
  const {showPreview} = useSheetToggles();

  //   useEffect(() => {
  //     const unsubscribe = FirebaseService.streamUserDoc({
  //       next: (userDocRef: any) => {
  //         const data = userDocRef.data();
  //         if (!data?.sheets) {
  //           return;
  //         }

  //         setUserDoc({
  //           sheets: data.sheets,
  //           savedSheets: data.savedSheets,
  //           activeSheet: data.activeSheet,
  //           userId: data.userId,
  //         });
  //       },
  //       error: (ERROR: any) => {
  //         console.log(`UserDoc error is ${ERROR}`);
  //       },
  //     });
  //     return unsubscribe;
  //   }, [setUserDoc]);

  //   useEffect(() => {
  //     const unsubscribe = FirebaseService.streamCurrentSheetDoc(userDoc.activeSheet, {
  //         next: (currentSheetDocRef: any) => {
  //           updateCurrentSheetState(currentSheetDocRef);
  //         },
  //       error: (ERROR: any) => {
  //           console.log(`CurrentSheetDoc error is ${ERROR}`);
  //         },
  //       }
  //     );
  //     return unsubscribe;
  //   }, [userDoc, setCurrentSheetControls, setOriginalArray]);

  //   const updateCurrentSheetState = (ref: any) => {
  //     const data = ref.data();
  //     if (data === undefined) {
  //       return;
  //     }

  //     setOriginalArray(JSON.parse(data.originalArray));

  //     setCurrentSheetControls({
  //       top: data.top,
  //       right: data.right,
  //       bottom: data.bottom,
  //       left: data.left,
  //       uniqueIdCol: data.uniqueIdCol,
  //       maxRight: data.maxRight,
  //       maxBottom: data.maxBottom,
  //       sheetId: data.sheetId,
  //     });

  //     setLoading(0);
  //   };

  //   const handleTabChange = async (_event: any, newValue: number) => {
  //     setLoading(1);
  //     FirebaseService.updateCurrentSheetDoc(userDoc.activeSheet, currentSheetControls);
  //     userDoc.activeSheet = userDoc.sheets[newValue];
  //     setUserDoc(userDoc);
  //     FirebaseService.updateUserDoc(userDoc);
  //     const doc = await FirebaseService.getCurrentSheetDoc(userDoc.activeSheet);
  //     updateCurrentSheetState(doc);
  //   };

  //   const saveSheet = () => {
  //     userDoc.savedSheets.push(userDoc.activeSheet);

  //     // Get unique elements
  //     userDoc.savedSheets.filter((value, index, self) => {
  //       return self.indexOf(value) === index;
  //     });
  //     setUserDoc(userDoc);
  //     FirebaseService.updateUserDoc(userDoc);
  //     FirebaseService.updateCurrentSheetDoc(userDoc.activeSheet, currentSheetControls);
  //   };

  return (
    <>
      <SheetNavigator />
      {loading ? (
        <HorizontalFlexWrap>
          <CircularProgress size="300px" />
        </HorizontalFlexWrap>
      ) : (
        <HorizontalFlexWrap>
          <SheetControls />
          <SheetTable />
          {showPreview && <SheetOutputPreview />}
        </HorizontalFlexWrap>
      )}
    </>
  );
}
