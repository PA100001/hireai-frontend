// src/components/profile/formFields/ArrayFieldset.jsx
import React from 'react';
import { Box, Typography, IconButton, Button, Paper, Grid } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const ArrayFieldset = ({
  title,
  fields, // from useFieldArray
  append, // from useFieldArray
  remove, // from useFieldArray
  renderItem, // function (field, index, control, errors) => JSX for one item's fields
  newItemData, // object for new item
  control, // from useForm
  errors, // from useForm.formState
  namePrefix // e.g., "profileUpdates.workExperience"
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {fields.map((item, index) => (
        <Paper
          key={item.id} // item.id is provided by useFieldArray
          elevation={2}
          sx={{ p: 2, mb: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}
        >
          <Grid container spacing={2}>
            <Grid item xs={11}>
              {renderItem(item, index, control, errors, namePrefix)}
            </Grid>
            <Grid item xs={1} display="flex" alignItems="center" justifyContent="center">
              <IconButton onClick={() => remove(index)} color="error" size="small">
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => append(newItemData)}
        variant="outlined"
        size="small"
      >
        Add {title.singular || title}
      </Button>
    </Box>
  );
};

ArrayFieldset.defaultProps = {
  title: { singular: "Item" }
};


export default ArrayFieldset;