import React from 'react';
import {StepLabel, Stepper, Step} from '@mui/material';
import {useStage} from './providers/StageProvider';

export default function StepIndicator() {
  const stage = useStage();

  const steps = [
    'Upload your spreadsheet',
    'Parse your data',
    'Merge your data',
    'Send your reminders',
  ];

  return (
    <Stepper activeStep={stage} alternativeLabel>
      {steps.map(label => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
