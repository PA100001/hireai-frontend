// src/components/profile/formFields/ControlledDatePicker.jsx
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const ControlledDatePicker = ({ name, control, label, errors, views = ['year', 'month', 'day'], ...datePickerProps }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          label={label}
          views={views}
          inputRef={field.ref}
          {...datePickerProps}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!error}
              helperText={error?.message}
            />
          )}
          // Handle null correctly for optional dates
          onChange={(date) => field.onChange(date || null)}
          value={field.value || null}
        />
      )}
    />
  );
};

export default ControlledDatePicker;