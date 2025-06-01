import React, { useState, useRef } from 'react';
import { Button, Typography, Box, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUploader = ({
  onFileSelect,
  label = "Choose File",
  acceptedTypes = "image/*,application/pdf,.doc,.docx", // Example
  buttonText = "Select File",
  showFileName = true,
  variant = "contained",
  sx
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null); // Notify parent that file is removed
    if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input value
    }
  };

  return (
    <Box sx={sx}>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button
        variant={variant}
        onClick={handleButtonClick}
        startIcon={<CloudUploadIcon />}
      >
        {buttonText}
      </Button>
      {showFileName && selectedFile && (
        <Chip
          label={selectedFile.name}
          onDelete={handleRemoveFile}
          sx={{ ml: 1, maxWidth: 200 }}
          size="small"
        />
      )}
      {label && !selectedFile && <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{label}</Typography>}
    </Box>
  );
};

export default FileUploader;