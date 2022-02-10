import React from 'react';
import Upload from './components/Upload';
import EditData from './components/EditData';
import MergeData from './components/MergeData';
import SendReminders from './components/SendReminders';
import StepIndicator from './components/StepIndicator';
import {StageProvider, useStage} from './components/providers/StageProvider';
import {SheetManagerProvider} from './components/providers/SheetProvider';
import {SheetTogglesProvider} from './components/providers/SheetTogglesProvider';
import styled from 'styled-components';

const SinglePageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

function App() {
  return (
    <StageProvider>
      <SheetTogglesProvider>
        <SheetManagerProvider>
          <SinglePageWrapper>
            <StageSelector />
            <StepIndicator />
          </SinglePageWrapper>
        </SheetManagerProvider>
      </SheetTogglesProvider>
    </StageProvider>
  );
}

function StageSelector() {
  const stage = useStage();

  return {
    0: <Upload />,
    1: <EditData />,
    2: <MergeData />,
    3: <SendReminders />,
  }[stage];
}

export default App;
