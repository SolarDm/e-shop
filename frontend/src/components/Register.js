import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkPasswordStrength = (password) => {
            let score = 0;
            const rules = [];

            if (password.length >= 8) score += 1;
            if (password.length >= 12) score += 1;

            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
                score += 1;
                rules.push('lowerUpperCase');
            }

            if (/\d/.test(password)) {
                score += 1;
                rules.push('hasNumber');
            }

            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                score += 1;
                rules.push('hasSpecial');
            }

            let text = '';
            if (score <= 2) text = 'Слабый';
            else if (score <= 4) text = 'Средний';
            else text = 'Надежный';

            return { score, text, rules };
        };

        if (formData.password) {
            setPasswordStrength(checkPasswordStrength(formData.password));
        } else {
            setPasswordStrength({ score: 0, text: '' });
        }
    }, [formData.password]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Введите имя пользователя';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Имя должно быть не менее 3 символов';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Только буквы, цифры и подчеркивание';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }

        if (!formData.password) {
            newErrors.password = 'Введите пароль';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
        } else if (passwordStrength.score <= 2) {
            newErrors.password = 'Слишком слабый пароль';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Необходимо принять условия';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(formData.username, formData.email, formData.password);

            setSuccess('Регистрация успешна! Перенаправляем на страницу входа...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Ошибка регистрации:', error);

            if (error.message.includes('уже существует')) {
                setErrors({
                    username: 'Имя пользователя уже занято',
                    email: 'Email уже используется'
                });
            } else {
                setErrors({
                    submit: error.message || 'Ошибка регистрации. Попробуйте еще раз.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const passwordRules = [
        { id: 'length', text: 'Не менее 8 символов', valid: formData.password.length >= 8 },
        { id: 'lowerUpperCase', text: 'Буквы разного регистра',
            valid: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
        { id: 'number', text: 'Содержит цифры', valid: /\d/.test(formData.password) },
        { id: 'special', text: 'Специальные символы',
            valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) }
    ];

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Присоединяйтесь к нам</h2>
                    <p>Создайте аккаунт, чтобы получить доступ ко всем возможностям</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {errors.submit && (
                        <div className="error-message">
                            {errors.submit}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username" className="username-label">
                            Имя пользователя
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="form-input"
                                placeholder="Придумайте имя пользователя"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="username"
                            />
                            <span className="input-icon">👤</span>
                        </div>
                        {errors.username && (
                            <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                {errors.username}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="email-label">
                            Email адрес
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="Введите ваш email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="email"
                            />
                            <span className="input-icon">📧</span>
                        </div>
                        {errors.email && (
                            <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="password-label">
                            Пароль
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Придумайте надежный пароль"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="new-password"
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

                        {formData.password && (
                            <>
                                <div className="password-strength">
                                    <div className="strength-meter">
                                        <div className={`strength-fill ${passwordStrength.text.toLowerCase()}`}></div>
                                    </div>
                                    <div className={`strength-text ${passwordStrength.text.toLowerCase()}-text`}>
                                        {passwordStrength.text}
                                    </div>
                                </div>

                                <div className="password-rules">
                                    <ul>
                                        {passwordRules.map(rule => (
                                            <li key={rule.id} className={rule.valid ? 'valid' : ''}>
                                                {rule.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {errors.password && (
                            <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="confirm-password-label">
                            Подтверждение пароля
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Повторите пароль"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <div className="terms-agreement">
                        <input
                            type="checkbox"
                            id="agreeTerms"
                            name="agreeTerms"
                            className="terms-checkbox"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <label htmlFor="agreeTerms" className="terms-text">
                            Я согласен с{' '}
                            <Link to="/terms" className="terms-link">Условиями использования</Link>
                            {' '}и{' '}
                            <Link to="/privacy" className="terms-link">Политикой конфиденциальности</Link>
                        </label>
                    </div>
                    {errors.agreeTerms && (
                        <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '0.5rem', display: 'block' }}>
                            {errors.agreeTerms}
                        </span>
                    )}

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="register-btn-loading">
                                Регистрация...
                            </span>
                        ) : (
                            'Создать аккаунт'
                        )}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="login-link">
                            Войти в систему
                        </Link>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '1rem' }}>
                        Регистрируясь, вы соглашаетесь с нашими условиями
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;