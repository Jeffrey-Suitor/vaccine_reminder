import React, { useState } from 'react';
import { StylesProvider } from '@material-ui/styles';
import Upload from './components/Upload';
import EditData from'./components/EditData';
import MergeData from'./components/MergeData';
import SendReminders from './components/SendReminders';
import StepIndicator from './components/StepIndicator';
import styled from "styled-components";


const SinglePageWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`

function App() {
  const [stage, setStage] = useState(0);

  const nextStage = () => { setStage((curStage) => curStage + 1) }
  const prevStage = () => { setStage((curStage) => curStage - 1) }

  const showStage = () => {

    switch(stage){
      case 0: return <Upload nextStage={nextStage}/>;
      case 1: return <EditData  prevStage={prevStage} nextStage={nextStage}/>;
      case 2: return <MergeData  prevStage={prevStage} nextStage={nextStage}/>;
      case 3: return <SendReminders  prevStage={prevStage} nextStage={nextStage}/>
    }
  }

  return (
    <StylesProvider injectFirst>
        <SinglePageWrapper>
            {showStage()}
            <StepIndicator activeStep={stage}/>
        </SinglePageWrapper>
    </StylesProvider>
  );
}

export default App;
