import React, { useRef } from 'react';

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  children: React.ReactNode;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelected, children, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset file input to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleUploadClick}
      aria-label="Upload an image"
    >
      {children}
      <input 
        ref={fileInputRef} 
        type="file" 
        className="sr-only" 
        onChange={handleFileChange} 
        accept="image/*"
      />
    </button>
  );
};

export default ImageUploader;
