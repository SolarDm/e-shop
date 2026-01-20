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

    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        shippingAddress: '',
        recipientPhone: user?.phone || '',
        recipientName: user?.fullName || '',
        deliveryNotes: '',
        shippingMethod: 'STANDARD'
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
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
            const response = await fetch(`${API_BASE_URL}/cart/remove?productId=${productId}`, {
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
            const response = await fetch(`${API_BASE_URL}/cart/update?productId=${productId}&quantity=${quantity}`, {
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

    const handleDeliveryInputChange = (e) => {
        const { name, value } = e.target;

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        setDeliveryInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^(\+7|8|7)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    };

    const validateDeliveryInfo = () => {
        const errors = {};
        let isValid = true;

        if (!deliveryInfo.shippingAddress.trim()) {
            errors.shippingAddress = 'Адрес доставки обязателен';
            isValid = false;
        } else if (deliveryInfo.shippingAddress.trim().length < 10) {
            errors.shippingAddress = 'Адрес должен содержать минимум 10 символов';
            isValid = false;
        }

        if (!deliveryInfo.recipientName.trim()) {
            errors.recipientName = 'Имя получателя обязательно';
            isValid = false;
        } else if (deliveryInfo.recipientName.trim().length < 2) {
            errors.recipientName = 'Имя должно содержать минимум 2 символа';
            isValid = false;
        }

        if (!deliveryInfo.recipientPhone.trim()) {
            errors.recipientPhone = 'Телефон обязателен';
            isValid = false;
        } else if (!validatePhone(deliveryInfo.recipientPhone)) {
            errors.recipientPhone = 'Введите корректный номер телефона';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const formatPhone = (phone) => {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('8')) {
            cleaned = '7' + cleaned.slice(1);
        }
        if (cleaned.startsWith('7') && cleaned.length === 11) {
            return '+' + cleaned;
        }
        return cleaned;
    };

    const checkout = async () => {
        if (!cart || cart.cartItems.length === 0) {
            alert('Корзина пуста');
            return;
        }

        setShowDeliveryModal(true);
    };

    const confirmCheckout = async () => {
        if (!validateDeliveryInfo()) {
            return;
        }

        setCheckoutLoading(true);
        setShowDeliveryModal(false);

        try {
            const dataToSend = {
                ...deliveryInfo,
                recipientPhone: formatPhone(deliveryInfo.recipientPhone)
            };

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка оформления заказа');
            }

            alert(data.message || 'Заказ успешно оформлен!');
            setCart(null);

            setDeliveryInfo({
                shippingAddress: '',
                recipientPhone: user?.phone || '',
                recipientName: user?.fullName || '',
                deliveryNotes: '',
                shippingMethod: 'STANDARD'
            });
            setValidationErrors({});
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

    const calculateShippingCost = () => {
        switch(deliveryInfo.shippingMethod) {
            case 'EXPRESS':
                return 500;
            case 'PICKUP':
                return 0;
            case 'STANDARD':
            default:
                return 250;
        }
    };

    const closeModal = () => {
        setShowDeliveryModal(false);
        setValidationErrors({});
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

    const shippingCost = calculateShippingCost();
    const totalWithShipping = calculateTotal() + shippingCost;

    return (
        <>
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
                        <span className="summary-value">
                            {shippingCost === 0 ? 'Бесплатно' : `${shippingCost} ₽`}
                        </span>
                    </div>

                    <div className="summary-row total-row">
                        <span className="summary-label">Итого к оплате:</span>
                        <span className="summary-value">{totalWithShipping} ₽</span>
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

            {showDeliveryModal && (
                <div className="modal-overlay">
                    <div className="delivery-modal">
                        <div className="modal-header">
                            <h3>Информация о доставке</h3>
                            <button
                                className="close-modal"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="shippingAddress">Адрес доставки *</label>
                                <input
                                    type="text"
                                    id="shippingAddress"
                                    name="shippingAddress"
                                    placeholder="Например: г. Москва, ул. Тверская, д. 10, кв. 25"
                                    value={deliveryInfo.shippingAddress}
                                    onChange={handleDeliveryInputChange}
                                    required
                                    className={validationErrors.shippingAddress ? 'error' : ''}
                                />
                                {validationErrors.shippingAddress && (
                                    <span className="error-message">{validationErrors.shippingAddress}</span>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="recipientName">Имя получателя *</label>
                                    <input
                                        type="text"
                                        id="recipientName"
                                        name="recipientName"
                                        placeholder="Иванов Иван"
                                        value={deliveryInfo.recipientName}
                                        onChange={handleDeliveryInputChange}
                                        required
                                        className={validationErrors.recipientName ? 'error' : ''}
                                    />
                                    {validationErrors.recipientName && (
                                        <span className="error-message">{validationErrors.recipientName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="recipientPhone">Телефон *</label>
                                    <input
                                        type="tel"
                                        id="recipientPhone"
                                        name="recipientPhone"
                                        placeholder="+7 (999) 123-45-67"
                                        value={deliveryInfo.recipientPhone}
                                        onChange={handleDeliveryInputChange}
                                        required
                                        className={validationErrors.recipientPhone ? 'error' : ''}
                                    />
                                    {validationErrors.recipientPhone && (
                                        <span className="error-message">{validationErrors.recipientPhone}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="shippingMethod">Способ доставки</label>
                                <select
                                    id="shippingMethod"
                                    name="shippingMethod"
                                    value={deliveryInfo.shippingMethod}
                                    onChange={handleDeliveryInputChange}
                                >
                                    <option value="STANDARD">Стандартная доставка (250 ₽, 3-5 дней)</option>
                                    <option value="EXPRESS">Экспресс доставка (500 ₽, 1-2 дня)</option>
                                    <option value="PICKUP">Самовывоз (бесплатно)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deliveryNotes">Примечания для курьера</label>
                                <textarea
                                    id="deliveryNotes"
                                    name="deliveryNotes"
                                    placeholder="Например: позвонить за 15 минут, домофон 25к125, оставить у двери..."
                                    value={deliveryInfo.deliveryNotes}
                                    onChange={handleDeliveryInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="delivery-summary">
                                <h4>Сводка заказа</h4>
                                <div className="summary-item">
                                    <span>Товары:</span>
                                    <span>{calculateTotal()} ₽</span>
                                </div>
                                <div className="summary-item">
                                    <span>Доставка:</span>
                                    <span>{shippingCost === 0 ? 'Бесплатно' : `${shippingCost} ₽`}</span>
                                </div>
                                <div className="summary-item total">
                                    <span>Итого:</span>
                                    <span>{totalWithShipping} ₽</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={closeModal}
                            >
                                Отмена
                            </button>
                            <button
                                className="confirm-btn"
                                onClick={confirmCheckout}
                                disabled={checkoutLoading}
                            >
                                {checkoutLoading ? 'Оформление...' : 'Подтвердить заказ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Cart;