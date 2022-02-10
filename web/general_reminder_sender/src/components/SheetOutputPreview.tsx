import {useSheet} from './providers/SheetProvider';
import {useState} from 'react';
import Pagination from '@mui/material/Pagination';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const VerticalFlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: left;
  height: 100%;
  width: fit-content;
  overflow: auto;
  flex-direction: column;
  white-space: nowrap;
`;

const CenteredH1 = styled.h1`
  text-align: center;
`;

const paramDisplay = styled.div`
  flex: 50%;
`;

export default function SheetOutputPreview() {
  const {localParsedData} = useSheet();
  const [page, setPage] = useState(1);
  const objects = Object.keys(localParsedData);
  const currentObject = localParsedData[objects[page - 1]];

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  console.log(localParsedData);
  console.log(page);
  console.log(localParsedData[page - 1]);

  return (
    <VerticalFlexWrapper>
      <CenteredH1>{objects[page - 1]}</CenteredH1>
      <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
        {Object.keys(currentObject).map(key => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <Typography variant="h6">{key} : </Typography>
            <Typography variant="body1">{currentObject[key]}</Typography>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={objects.length}
        page={page}
        onChange={handleChange}
        color="primary"
      />
    </VerticalFlexWrapper>
  );
}
