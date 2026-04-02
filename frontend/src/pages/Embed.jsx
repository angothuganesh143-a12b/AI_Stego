import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Download, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Embed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { filename, preview } = location.state || {};
    
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    // Redirect back if no file was uploaded
    if (!filename) {
        navigate('/upload');
        return null;
    }

    const handleEmbed = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.post(`${API_URL}/embed`, {
                filename,
                message,
                password,
                user_id: userObj.id || null
            });
            
            setSuccess({
                message: response.data.message,
                downloadUrl: `${API_URL}/download/${response.data.output_filename}`
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to embed data. Image might be too small.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="action-card large glass-panel animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="mb-4">Secure & Embed Message</h2>
                <p className="text-mute">Encrypt your message with a password and hide it using AI.</p>
            </div>

            <div className="grid-2">
                <div>
                    <img src={preview} alt="Carrier" className="image-preview" style={{width: '100%', objectFit: 'cover'}} />
                    <p className="text-center text-sm text-mute mt-4">Selected Carrier Image</p>
                </div>
                
                <div>
                    {error && (
                        <div className="alert error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center">
                            <div className="alert success mb-8" style={{justifyContent: 'center', padding: '2rem'}}>
                                <div>
                                    <CheckCircle size={48} className="mb-4 text-success" />
                                    <h3>Steg Image Generated!</h3>
                                    <p className="mt-4">{success.message}</p>
                                </div>
                            </div>
                            
                            <a href={success.downloadUrl} download className="btn mb-4">
                                <Download size={18} /> Download Secure Image
                            </a>
                            <button className="btn btn-secondary mt-4" onClick={() => navigate('/upload')}>
                                Process Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmbed}>
                            <div className="input-group">
                                <label className="input-label">Secret Message</label>
                                <textarea
                                    className="input-field"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    placeholder="Enter the sensitive information to hide..."
                                    rows="4"
                                />
                            </div>
                            
                            <div className="input-group">
                                <label className="input-label">Encryption Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Choose a strong password"
                                />
                                <p className="text-sm text-mute mt-4">This password uses AES-256-GCM encryption and will be required to extract the message.</p>
                            </div>

                            <button type="submit" className="btn mt-4" disabled={loading}>
                                {loading ? 'Encrypting & Embedding...' : <><Lock size={18} /> Embed Data</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Embed;
