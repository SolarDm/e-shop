import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {API_BASE_URL} from "../config";
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка загрузки корзины');
            }

            setCart(data.cart);
            setLoading(false);
            setError(null);
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите удалить товар из корзины?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/remove?productId=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка удаления из корзины');
            }

            setCart(prevCart => ({
                ...prevCart,
                cartItems: prevCart.cartItems.filter(item => item.product.id !== productId)
            }));
        } catch (error) {
            console.error('Ошибка удаления из корзины:', error);
            alert(error.message);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/update?productId=${productId}&quantity=${quantity}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка обновления количества');
            }

            setCart(prevCart => ({
                ...prevCart,
                cartItems: prevCart.cartItems.map(item =>
                    item.product.id === productId
                        ? { ...item, quantity: quantity }
                        : item
                )
            }));
        } catch (error) {
            console.error('Ошибка обновления количества:', error);
            alert(error.message);
        }
    };

    const checkout = async () => {
        if (!cart || cart.cartItems.length === 0) {
            alert('Корзина пуста');
            return;
        }

        if (!window.confirm('Подтвердить оформление заказа?')) {
            return;
        }

        setCheckoutLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка оформления заказа');
            }

            alert(data.message || 'Заказ успешно оформлен!');
            setCart(null);
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert(error.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.cartItems) return 0;
        return cart.cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const calculateItemsCount = () => {
        if (!cart || !cart.cartItems) return 0;
        return cart.cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="cart">
                <div className="loading">Загрузка корзины...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart">
                <div className="error">
                    <h3>Ошибка загрузки корзины</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={fetchCart}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return (
            <div className="cart">
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h3>Ваша корзина пуста</h3>
                    <p>Добавьте товары, чтобы сделать заказ</p>
                    <Link to="/" className="shop-now-btn">
                        Перейти к покупкам
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart">
            <div className="cart-header">
                <h2>Корзина покупок</h2>
                <span className="cart-count">
                    {calculateItemsCount()} товар{calculateItemsCount() !== 1 ? 'а' : ''}
                </span>
            </div>

            <div className="cart-items">
                {cart.cartItems.map(item => (
                    <div key={item.product.id} className="cart-item">
                        <div className="cart-item-image">
                            {item.product.name.charAt(0)}
                        </div>

                        <div className="cart-item-info">
                            <h3>{item.product.name}</h3>
                            {item.product.description && (
                                <p className="cart-item-description">
                                    {item.product.description}
                                </p>
                            )}
                            <div className="cart-item-price">
                                {item.product.price} ₽
                            </div>
                        </div>

                        <div className="cart-item-controls">
                            <div className="quantity-control">
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    aria-label="Уменьшить количество"
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    aria-label="Увеличить количество"
                                >
                                    +
                                </button>
                            </div>

                            <div className="item-total">
                                {item.product.price * item.quantity} <span className="currency">₽</span>
                            </div>

                            <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.product.id)}
                                aria-label="Удалить товар"
                            >
                                <span>🗑️</span> Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div className="summary-row">
                    <span className="summary-label">Количество товаров:</span>
                    <span className="summary-value">{calculateItemsCount()} шт.</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Промежуточный итог:</span>
                    <span className="summary-value">{calculateTotal()} ₽</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Доставка:</span>
                    <span className="summary-value">Бесплатно</span>
                </div>

                <div className="summary-row total-row">
                    <span className="summary-label">Итого к оплате:</span>
                    <span className="summary-value">{calculateTotal()} ₽</span>
                </div>
            </div>

            <div className="cart-actions">
                <Link to="/" className="continue-shopping">
                    ← Продолжить покупки
                </Link>

                <button
                    className="checkout-btn"
                    onClick={checkout}
                    disabled={checkoutLoading}
                >
                    {checkoutLoading ? (
                        <>
                            <span className="loading-spinner"></span>
                            Оформление...
                        </>
                    ) : (
                        <>
                            <span className="icon">✓</span>
                            Оформить заказ
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Cart;