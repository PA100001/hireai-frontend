// src/components/common/FileUploaderV2.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, IconButton, LinearProgress, Avatar, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';

const FileUploaderV2 = ({
  name, // For react-hook-form Controller
  control, // For react-hook-form Controller
  setValue, // For react-hook-form Controller
  label = "Drag 'n' drop files here, or click to select files",
  acceptedFileTypes, // e.g., { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] }
  maxFileSize, // in bytes
  existingFileUrl, // URL of an already uploaded file (e.g., profile picture, resume link)
  existingFileName,
  onUpload, // async (file) => { /* return { success: true, url: '...' } or throw error */ }
  onRemoveExisting, // async () => { /* logic to delete existing file on server */ }
  helperText,
  error, // from react-hook-form
  disabled,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentExistingFileUrl, setCurrentExistingFileUrl] = useState(existingFileUrl);
  const [currentExistingFileName, setCurrentExistingFileName] = useState(existingFileName);

  useEffect(() => {
    setCurrentExistingFileUrl(existingFileUrl);
    setCurrentExistingFileName(existingFileName);
  }, [existingFileUrl, existingFileName]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [file]);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setUploadError('');
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setUploadError(`File is too large. Max size: ${maxFileSize / (1024 * 1024)} MB`);
      } else if (firstError.code === 'file-invalid-type') {
        setUploadError('Invalid file type.');
      } else {
        setUploadError(firstError.message);
      }
      setFile(null);
      setValue(name, null, { shouldValidate: true, shouldDirty: true }); // RHF
      return;
    }
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setValue(name, selectedFile, { shouldValidate: true, shouldDirty: true }); // RHF

      if (onUpload) { // If onUpload is provided, trigger upload immediately
        handleUpload(selectedFile);
      }
    }
  }, [maxFileSize, name, onUpload, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: false,
    disabled: isUploading || disabled,
  });

  const handleUpload = async (fileToUpload) => {
    if (!onUpload || !fileToUpload) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    try {
      // Simulate progress for demo; replace with actual progress if onUpload supports it
      // For actual progress, onUpload might need an onProgress callback
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 90) { // Stop at 90 to let actual upload finish
          setUploadProgress(currentProgress);
        } else {
          clearInterval(progressInterval);
        }
      }, 100);


      const result = await onUpload(fileToUpload); // This should handle the actual upload
      clearInterval(progressInterval); // Clear interval in case upload is faster
      setUploadProgress(100);
      
      if (result && result.success) {
        // If onUpload returns a URL, we might want to update the existingFileUrl state
        // This depends on how you want to manage state post-upload
        // For example: setCurrentExistingFileUrl(result.url);
        setFile(null); // Clear the selected file as it's now "uploaded"
        setValue(name, null); // Clear RHF value if handled by onUpload
      } else {
        throw new Error(result?.message || 'Upload failed after processing.');
      }

    } catch (err) {
      clearInterval(progressInterval); // Clear interval on error
      setUploadError(err.message || 'Upload failed.');
      setUploadProgress(0); // Reset progress on error
    } finally {
      setIsUploading(false);
      // Don't clear file here automatically, let user decide to retry or remove
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setUploadError('');
    setUploadProgress(0);
    setValue(name, null, { shouldValidate: true, shouldDirty: true }); // RHF
  };

  const handleRemoveExisting = async () => {
    if (onRemoveExisting) {
        try {
            await onRemoveExisting();
            setCurrentExistingFileUrl(null);
            setCurrentExistingFileName(null);
        } catch (err) {
            setUploadError(err.message || "Failed to remove existing file.");
        }
    } else {
        // If no server removal, just clear UI
        setCurrentExistingFileUrl(null);
        setCurrentExistingFileName(null);
    }
  };

  const isImage = file?.type.startsWith('image/') || currentExistingFileUrl?.match(/\.(jpeg|jpg|gif|png)$/i);

  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', ...(isDragActive && { borderColor: 'primary.main', borderWidth: 2 }) }}>
      <Box {...getRootProps()} sx={{ cursor: 'pointer', p: 2, border: `2px dashed`, borderColor: error || uploadError ? 'error.main' : 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.light' } }}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
        <Typography variant="body2" color="textSecondary">
          {isDragActive ? "Drop the file here..." : label}
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary">
          Max size: {maxFileSize / (1024 * 1024)}MB.
          {acceptedFileTypes && Objectvalues(acceptedFileTypes).flat().join(', ')}
        </Typography>
      </Box>

      {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
      {error && <Typography color="error.main" variant="caption" sx={{ mt: 1, display: 'block' }}>{error.message || helperText}</Typography>}
      {!error && helperText && !uploadError && <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>{helperText}</Typography>}


      {isUploading && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption">{uploadProgress}%</Typography>
        </Box>
      )}

      {file && !isUploading && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', p:1, border: '1px solid', borderColor: 'divider', borderRadius:1 }}>
          {isImage && preview ? (
            <Avatar src={preview} sx={{ width: 56, height: 56, mr: 2 }} variant="rounded"/>
          ) : (
            <InsertDriveFileIcon sx={{ mr: 2 }} />
          )}
          <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>{file.name}</Typography>
          <IconButton onClick={handleRemoveFile} size="small" color="error" disabled={disabled}><DeleteIcon /></IconButton>
          {/* Removed auto-upload button, upload happens on drop if onUpload is provided */}
        </Box>
      )}

      {!file && currentExistingFileUrl && (
         <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', p:1, border: '1px solid', borderColor: 'divider', borderRadius:1 }}>
          {isImage ? (
            <Avatar src={currentExistingFileUrl} sx={{ width: 56, height: 56, mr: 2 }} variant="rounded"/>
          ) : (
            <InsertDriveFileIcon sx={{ mr: 2 }} />
          )}
          <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>{currentExistingFileName || 'Uploaded File'}</Typography>
          {onRemoveExisting && <IconButton onClick={handleRemoveExisting} size="small" color="error" disabled={disabled}><DeleteIcon /></IconButton>}
        </Box>
      )}
    </Paper>
  );
};

export default FileUploaderV2;