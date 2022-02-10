import styled from 'styled-components';
import MuiInput from '@mui/material/Input';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import {useSheet, useUpdateSheet} from './providers/SheetProvider';
import {
  useSheetToggles,
  useUpdateSheetToggles,
} from './providers/SheetTogglesProvider';

const FormWrapper = styled.div`
  padding: 1em;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  & > div {
    margin: 5px;
  }
`;

export default function SheetControls() {
  const {updateSheetVal} = useUpdateSheet();
  const {top, right, bottom, left, uniqueIdCol, maxBottom, maxRight} =
    useSheet();

  const {mergeDirection, showPreview, showColours, showUnselected} =
    useSheetToggles();

  const {setMergeDirection, setShowPreview, setShowColours, setShowUnselected} =
    useUpdateSheetToggles();

  function textInputValidate(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    return parseInt(e.target.value.replace(/[^0-9]/g, ''));
  }

  return (
    <form noValidate autoComplete="off">
      <FormWrapper>
        <MuiInput
          inputProps={{
            step: 1,
            min: 1,
            max: maxBottom || 9999,
            colour: 'purple',
            label: 'Header',
            value: top || '',
            type: 'number',
          }}
          onChange={e => {
            updateSheetVal(textInputValidate(e), 'top');
          }}
        />

        <MuiInput
          inputProps={{
            step: 1,
            min: 1,
            max: maxRight || 9999,
            type: 'number',
            border_color: '#9932CC',
            label: 'Left',
            value: left || '',
          }}
          onChange={e => {
            updateSheetVal(textInputValidate(e), 'left');
          }}
        />

        <MuiInput
          inputProps={{
            step: 1,
            min: top || 0,
            max: maxBottom || 9999,
            type: 'number',
            colour: 'maroon',
            label: 'Bottom',
            value: bottom || '',
          }}
          onChange={e => {
            updateSheetVal(textInputValidate(e), 'bottom');
          }}
        />

        <MuiInput
          inputProps={{
            step: 1,
            min: left || 0,
            max: maxRight || 9999,
            type: 'number',
            colour: 'teal',
            label: 'Right',
            value: right || '',
          }}
          onChange={e => {
            updateSheetVal(textInputValidate(e), 'right');
          }}
        />

        <MuiInput
          inputProps={{
            step: 1,
            min: left || 0,
            max: right || 9999,
            type: 'number',
            colour: 'red',
            label: 'Unique ID Column',
            value: uniqueIdCol || '',
          }}
          onChange={e => {
            updateSheetVal(textInputValidate(e), 'uniqueIdCol');
          }}
        />
        <FormLabel component="legend">Merge Direction</FormLabel>
        <RadioGroup
          name="mergeDirection"
          value={mergeDirection}
          onChange={(_e, direction: 'Up' | 'Down') => {
            setMergeDirection(direction);
          }}
        >
          <FormControlLabel value="Up" control={<Radio />} label="Up" />
          <FormControlLabel value="Down" control={<Radio />} label="Down" />
        </RadioGroup>
        <FormControlLabel
          control={<Switch checked={showPreview} />}
          label="Show Preview"
          onChange={(_e, checked) => {
            setShowPreview(checked);
          }}
        />
        <FormControlLabel
          control={<Switch checked={showColours} />}
          label="Show Colours"
          onChange={(_e, checked) => {
            setShowColours(checked);
          }}
        />
        <FormControlLabel
          control={<Switch checked={showUnselected} />}
          label="Hide Unselected"
          onChange={(_e, checked) => {
            setShowUnselected(checked);
          }}
        />
      </FormWrapper>
    </form>
  );
}
