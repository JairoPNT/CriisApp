import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logoSkinHealth from '../assets/logo_skinhealth.png';

import API_URL from '../api';

const LoginPage = ({ onLogin, onBack, logo }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('pqr_user', JSON.stringify(data));
                onLogin(data);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <button onClick={onBack} style={{ background: 'none', color: 'var(--text-muted)', marginBottom: '1.5rem', padding: 0, fontWeight: 500 }}>
                    ← Volver
                </button>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src={logo || logoSkinHealth}
                        alt="Logo"
                        style={{ width: '120px', marginBottom: '1rem' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <h2 style={{ margin: 0 }}>Acceso Gestor</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(217, 83, 79, 0.1)', borderRadius: '10px' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Introduce tu usuario"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="form-label">Contraseña</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '1.2rem' }}
                    >
                        {loading ? 'Validando...' : 'Entrar al Sistema'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
