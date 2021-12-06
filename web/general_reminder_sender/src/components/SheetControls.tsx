import styled from "styled-components";
import TextField from "@material-ui/core/TextField";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Switch from "@material-ui/core/Switch";

type SheetControlState = {
    top: number,
    right: number,
    bottom: number,
    left: number,
    uniqueIdCol: number,
    maxRight: number,
    maxBottom: number,
    sheetId: string
}

type SheetTogglesState = {
    mergeDirection: string,
    showPreview: boolean,
    showColours: boolean,
    hideUnselected: boolean
}

type SheetControlProps = {
    currentSheetControls: SheetControlState,
    setCurrentSheetControls:  React.Dispatch<React.SetStateAction<any>>
    currentSheetToggles: SheetTogglesState
    setCurrentSheetToggles: React.Dispatch<React.SetStateAction<any>>
}

const FormWrapper = styled.div`
    padding: 1em;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    & > div {
        margin: 5px;
    }
`;

const TextFieldStyled = styled(TextField)<{colour: string}>`
    border-color: ${props => (props.colour)};
`

export default function SheetControls({currentSheetControls, setCurrentSheetControls, currentSheetToggles, setCurrentSheetToggles}: SheetControlProps) {

   
    var {top, right, bottom, left, maxRight, maxBottom, uniqueIdCol} = currentSheetControls;
    var {mergeDirection, showPreview, showColours, hideUnselected} = currentSheetToggles;

    const textInputChanged = (e:any, ) => {

        const EMPTY_TEXT_FIELD_ERROR = -1;
        var prop = e.target.name;

        var inputValue = e.target.value;
        if (e.nativeEvent.data) {
            // Not a nubmer entry
            if (e.nativeEvent.data.replace(/\D/g,'') === '') { 
                inputValue = currentSheetControls[prop as keyof SheetControlState];
            }
        } else {
            inputValue = e.target.value.replace(/\D/g,'')
            if (!inputValue) { inputValue = EMPTY_TEXT_FIELD_ERROR; }
        }

        var value = parseInt(inputValue);

        if (value === EMPTY_TEXT_FIELD_ERROR) {
            e.target.value = "";
            setCurrentSheetControls({ ...currentSheetControls, [prop]: value});
        } else {
            switch(prop) {
                case "top":
                    if (value > bottom) value = bottom
                    else if (value < 1) value = 1
                    else if (value > maxBottom) value = maxBottom
                    break;
                case "left":
                    if (value > right) value = right
                    else if (value < 1) value = 1;
                    else if (value > maxRight) value = maxRight;
                    break;
                case "right":
                    if (value < left) value = left;
                    else if (value > maxRight) value = maxRight;
                    break;
                case "bottom":
                    if (value < bottom) value = top;
                    else if (value > maxBottom) value = maxBottom;
                    break;
                case "uniqueIdCol":
                    if (value > right) value = right;
                    else if (value < left) value = left;
                    break;
            }
            setCurrentSheetControls({ ...currentSheetControls, [prop]: value});
            e.target.value = value.toString();
        }

    }

    const radioInputChange = (e:any) => {
        var prop = e.target.name;
        var value = e.target.value;
        setCurrentSheetToggles({...currentSheetToggles, [prop]: value});
    };

    const sliderInputChange = (e:any) => {
        var prop = e.target.name;
        var checked = e.target.checked;
        setCurrentSheetToggles({...currentSheetToggles, [prop]: checked});
    };
    
    return (
        <form noValidate autoComplete="off">
            <FormWrapper>
                <TextFieldStyled colour="purple"  error={top === -1 ? true : false} name="top" label="Header" defaultValue={top} onChange={textInputChanged} />
                <TextFieldStyled colour="#9932CC" error={left === -1 ? true : false} name="left" label="Left"   defaultValue={left} onChange={textInputChanged} />
                <TextFieldStyled colour="teal" error={right === -1 ? true : false} name="right" label="Right"  defaultValue={right} onChange={textInputChanged} />
                <TextFieldStyled colour="maroon" error={bottom === -1 ? true : false} name="bottom" label="Bottom" defaultValue={bottom} onChange={textInputChanged} />
                <TextFieldStyled colour="red" error={uniqueIdCol === -1 ? true : false} name="uniqueIdCol" label="Unique ID Col" defaultValue={uniqueIdCol} onChange={textInputChanged} />
                <FormLabel component="legend">Merge Direction</FormLabel>
                <RadioGroup name="mergeDirection" value={mergeDirection} onChange={radioInputChange} >
                    <FormControlLabel value="Up" control={<Radio />} label="Up" />
                    <FormControlLabel value="Down" control={<Radio />} label="Down" />
                </RadioGroup>
            <FormControlLabel name="showPreview" control={<Switch checked={showPreview} />} label="Show Preview" onChange={sliderInputChange}/>
            <FormControlLabel name="showColours" control={<Switch checked={showColours} />} label="Show Colours" onChange={sliderInputChange}/>
            <FormControlLabel name="hideUnselected" control={<Switch checked={hideUnselected} />} label="Hide Unselected" onChange={sliderInputChange}/>
            </FormWrapper>
        </form>
    )
}
