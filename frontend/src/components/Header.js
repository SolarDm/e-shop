import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {API_BASE_URL} from "../config";
import './Header.css';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/cart`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.cart?.cartItems) {
                        const totalItems = data.cart.cartItems.reduce(
                            (total, item) => total + item.quantity, 0
                        );
                        setCartCount(totalItems);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки корзины:', error);
            }
        };

        fetchCartCount();
    }, [user, location]);

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            logout();
        }
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <header className="header">
            <div className="container">
                <Link to="/" className="logo">
                    <span className="logo-icon">🛍️</span>
                    <span className="logo-text">E-Shop</span>
                </Link>

                <nav className="nav-menu">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Товары</span>
                    </Link>

                    {user ? (
                        <>
                            <Link to="/cart" className={`nav-link cart-link ${isActive('/cart')}`}>
                                <span className="nav-icon">🛒</span>
                                <span className="nav-text">Корзина</span>
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </Link>

                            <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                                <span className="nav-icon">📦</span>
                                <span className="nav-text">Заказы</span>
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className={`nav-link admin-link ${isActive('/admin')}`}>
                                    <span className="nav-icon">⚙️</span>
                                    <span className="nav-text">Админка</span>
                                </Link>
                            )}

                            <div className="user-section">
                                <div className="user-info">
                                    <span className="user-icon">👤</span>
                                    <span className="username">{user.username || 'Пользователь'}</span>
                                </div>
                                <button onClick={handleLogout} className="logout-btn">
                                    <span className="logout-icon">🚪</span>
                                    <span className="logout-text">Выход</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                                <span className="nav-icon">🔑</span>
                                <span className="nav-text">Вход</span>
                            </Link>

                            <Link to="/register" className={`nav-link register-link ${isActive('/register')}`}>
                                <span className="nav-icon">📝</span>
                                <span className="nav-text">Регистрация</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
