import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, Image as ImageIcon, Unlock, AlertCircle, FileSearch } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Extract = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secretMessage, setSecretMessage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;
        
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, BMP). JPG may lose data.');
            return;
        }

        setError('');
        setSecretMessage(null);
        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleExtract = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a Stego image first.');
            return;
        }

        setLoading(true);
        setError('');
        
        // First upload the file
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const filename = uploadRes.data.filename;

            // Then extract data
            const extractRes = await axios.post(`${API_URL}/extract`, {
                filename,
                password
            });

            setSecretMessage(extractRes.data.secret_message);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Extraction failed. Make sure the file contains hidden data and your password is correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="action-card large glass-panel animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="mb-4">Extract & Decrypt</h2>
                <p className="text-mute">Upload a Stego image and enter the password to reveal the secret.</p>
            </div>

            <div className="grid-2">
                <div>
                    <div 
                        className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={() => setIsDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => handleFile(e.target.files[0])} 
                            style={{display: 'none'}} 
                            accept=".png,.bmp"
                        />
                        
                        {file ? (
                            <div>
                                <FileSearch className="icon text-success" />
                                <h3>{file.name}</h3>
                                <p className="mt-4 text-sm text-mute">Click to change file</p>
                            </div>
                        ) : (
                            <div>
                                <ImageIcon className="icon" />
                                <h3>Select Stego Image</h3>
                                <p className="text-mute mt-4">Drop PNG or click to browse</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div>
                    {error && (
                        <div className="alert error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {secretMessage ? (
                        <div className="animate-fade-in">
                            <h3 className="mb-4 text-success flex-row">
                                <Unlock size={24} /> Decrypted Successfully
                            </h3>
                            <div className="glass-panel" style={{padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                                <p style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0, fontSize: '1.1rem'}}>{secretMessage}</p>
                            </div>
                            <button className="btn mt-8" onClick={() => { setSecretMessage(null); setFile(null); setPassword(''); }}>
                                Decrypt Another Image
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleExtract} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className="input-group">
                                <label className="input-label">Decryption Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter the encryption password"
                                />
                                <p className="text-sm text-mute mt-4">The exact same password used during the embedding process must be provided.</p>
                            </div>

                            <button type="submit" className="btn mt-4" disabled={loading || !file}>
                                {loading ? 'Extracting...' : <><Unlock size={18} /> Extract Secret</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Extract;
