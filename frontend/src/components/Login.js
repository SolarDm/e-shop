import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await login(username, password);

            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            setSuccess('Успешный вход! Перенаправление...');

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error('Ошибка входа:', error);
            setError(error.message || 'Неверное имя пользователя или пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setUsername('demo');
        setPassword('Demo123!');
        setError('');
        setSuccess('Демо данные загружены. Нажмите "Войти"');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Добро пожаловать</h2>
                    <p>Войдите в свой аккаунт</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="username"
                        />
                        <div className="input-focus-border"></div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <div className="input-focus-border"></div>
                    </div>

                    <div className="remember-forgot">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <label htmlFor="remember">Запомнить меня</label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">
                            Забыли пароль?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="login-btn-loading">
                                Вход...
                            </span>
                        ) : (
                            'Войти'
                        )}
                    </button>

                    <button
                        type="button"
                        className="demo-btn login-btn"
                        onClick={handleDemoLogin}
                        style={{
                            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                            marginTop: '0.5rem'
                        }}
                        disabled={loading}
                    >
                        🎮 Демо доступ
                    </button>

                    <div className="divider">
                        <span>или</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="social-btn google" disabled={loading}>
                            <span className="icon">G</span>
                            <span>Войти через Google</span>
                        </button>
                        <button type="button" className="social-btn github" disabled={loading}>
                            <span className="icon">G</span>
                            <span>Войти через GitHub</span>
                        </button>
                    </div>
                </form>

                <div className="login-footer">
                    <p>
                        Нет аккаунта?{' '}
                        <Link to="/register" className="register-link">
                            Зарегистрироваться
                        </Link>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                        Нажимая "Войти", вы соглашаетесь с нашими условиями
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;