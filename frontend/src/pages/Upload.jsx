import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload as UploadIcon, Image as ImageIcon, ArrowRight, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;
        
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, BMP).');
            return;
        }

        setError('');
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleProceed = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Pass the uploaded filename to the Embed page
            navigate('/embed', { state: { filename: response.data.filename, preview } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="action-card glass-panel animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="mb-4">Select Carrier Media</h2>
                <p className="text-mute">Upload an image to hide your secret message within.</p>
            </div>

            {error && (
                <div className="alert error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div 
                className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFile(e.target.files[0])} 
                    style={{display: 'none'}} 
                    accept=".png,.jpg,.jpeg,.bmp"
                />
                
                {preview ? (
                    <div>
                        <img src={preview} alt="Preview" className="image-preview" />
                        <p className="mt-4 text-sm text-mute">Click or drag a different image to replace</p>
                    </div>
                ) : (
                    <div>
                        <ImageIcon className="icon" />
                        <h3>Drag & Drop your image here</h3>
                        <p className="text-mute mt-4">or click to browse from your device</p>
                    </div>
                )}
            </div>

            <button 
                className="btn mt-8" 
                onClick={handleProceed} 
                disabled={!file || loading}
            >
                {loading ? 'Uploading...' : <><ArrowRight size={18} /> Continue to Embed Data</>}
            </button>
        </div>
    );
};

export default Upload;
