import styled from "styled-components";
import {DropzoneArea} from 'material-ui-dropzone';
import * as FirebaseService from "../services/Firebase";


type UploadProps = {
    nextStage: () => void,
}

const Wrapper = styled.div`
    width: 50%;
    height: 50%;
    margin: auto;

    & .MuiDropzoneArea-root {
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

export default function Upload({nextStage}: UploadProps) { 


    const uploadSpreadsheet = async (files: Array<any>) => {
        await FirebaseService.uploadSpreadsheet(files);
        nextStage();
    };

    return (
        <Wrapper>
            <DropzoneArea onChange={uploadSpreadsheet} showPreviewsInDropzone={false}/>
        </Wrapper>
    );
}
