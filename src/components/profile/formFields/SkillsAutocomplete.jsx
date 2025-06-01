// src/components/profile/formFields/SkillsAutocomplete.jsx
import React from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { Controller } from 'react-hook-form';

const SkillsAutocomplete = ({ name, control, label, placeholder, errors, options = [] }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          multiple
          options={options} // Provide a list of predefined skills if any
          value={field.value || []}
          onChange={(event, newValue) => {
            field.onChange(newValue);
          }}
          onBlur={field.onBlur}
          freeSolo // Allows adding new skills not in the options list
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label={label}
              placeholder={placeholder}
              error={!!errors}
              helperText={errors?.message}
              fullWidth
            />
          )}
        />
      )}
    />
  );
};

export default SkillsAutocomplete;