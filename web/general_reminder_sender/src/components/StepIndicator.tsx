import React from "react";
import { StepLabel, Stepper, Step} from "@material-ui/core";
import styled from "styled-components";

type StepProps = {
    activeStep: number
  }

export default function StepIndicator({activeStep}: StepProps) {
    const steps = [
        "Upload your spreadsheet",
        "Parse your data",
        "Merge your data",
        "Send your reminders"
    ];

    return (
        <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    )

}


