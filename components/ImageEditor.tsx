import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { InputImage } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  mimeType: string;
  onSave: (image: InputImage) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, mimeType, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  const [rotation, setRotation] = useState(0);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
  });

  const applyEdits = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img.naturalWidth) return;

    const { naturalWidth: w, naturalHeight: h } = img;
    
    const isSideways = rotation === 90 || rotation === 270;
    canvas.width = isSideways ? h : w;
    canvas.height = isSideways ? w : h;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;
    
    ctx.drawImage(img, -w / 2, -h / 2);
    
    ctx.restore();

  }, [rotation, filters]);


  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      applyEdits();
    };
  }, [imageSrc, applyEdits]);

  useEffect(() => {
    applyEdits();
  }, [applyEdits]);

  const handleFilterChange = (filter: keyof typeof filters, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const resetFilters = () => {
    setRotation(0);
    setFilters({
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
    });
  };

  const handleRotate = (angle: number) => {
    setRotation(prev => (prev + angle + 360) % 360);
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL(mimeType);
      const base64 = dataUrl.split(',')[1];
      onSave({ base64, mimeType });
    }
  };

  const controlGroups = [
      {
          label: 'Brightness',
          value: filters.brightness,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('brightness', parseInt(e.target.value)),
          min: 50, max: 200,
      },
      {
          label: 'Contrast',
          value: filters.contrast,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('contrast', parseInt(e.target.value)),
          min: 50, max: 200,
      },
  ];

  const filterButtons = [
      { label: 'Grayscale', onClick: () => handleFilterChange('grayscale', filters.grayscale > 0 ? 0 : 100), active: filters.grayscale > 0 },
      { label: 'Sepia', onClick: () => handleFilterChange('sepia', filters.sepia > 0 ? 0 : 100), active: filters.sepia > 0 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
        <div className="flex-grow bg-base-300 flex items-center justify-center p-4 min-h-[300px] md:min-h-0">
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{maxHeight: 'calc(90vh - 100px)'}}/>
        </div>
        <div className="w-full md:w-72 bg-base-100 p-4 space-y-4 flex-shrink-0 overflow-y-auto">
          <h3 className="text-xl font-bold text-white text-center">Edit Image</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Rotate</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleRotate(-90)} className="control-button">Rotate Left</button>
              <button onClick={() => handleRotate(90)} className="control-button">Rotate Right</button>
            </div>
          </div>

          <div className="space-y-4">
             {controlGroups.map(({label, ...props}) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-300">{label} ({props.value})</label>
                  <input type="range" {...props} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"/>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filterButtons.map(({label, onClick, active}) => (
                <button key={label} onClick={onClick} className={`control-button ${active ? 'bg-brand-primary' : ''}`}>{label}</button>
            ))}
          </div>
          
          <button onClick={resetFilters} className="control-button w-full">Reset All</button>

          <div className="pt-4 border-t border-gray-700 flex space-x-2">
            <button onClick={onCancel} className="control-button bg-red-600 hover:bg-red-700 w-full">Cancel</button>
            <button onClick={handleSave} className="control-button bg-green-600 hover:bg-green-700 w-full">Save Changes</button>
          </div>
        </div>
      </div>
      <style>{`
        .control-button {
            background-color: #374151; /* bg-base-200 */
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .control-button:hover {
            background-color: #4b5563; /* bg-base-300 */
        }
        .control-button.bg-brand-primary:hover {
            background-color: #4338ca;
        }
      `}</style>
    </div>
  );
};

export default ImageEditor;