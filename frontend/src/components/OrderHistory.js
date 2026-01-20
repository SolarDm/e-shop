import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {API_BASE_URL} from "../config";
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(response.data.orders || []);
            } else {
                setError(response.data.error || 'Ошибка загрузки заказов');
            }
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            setError(error.response?.data?.error || error.message || 'Ошибка загрузки заказов');
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'NEW': 'Новый',
            'PROCESSING': 'Обрабатывается',
            'CONFIRMED': 'Подтвержден',
            'SHIPPED': 'Отправлен',
            'DELIVERED': 'Доставлен',
            'CANCELLED': 'Отменен',
            'COMPLETED': 'Завершён'
        };
        return statusMap[status] || status;
    };

    const getShippingMethodText = (method) => {
        const methodMap = {
            'STANDARD': 'Стандартная доставка',
            'EXPRESS': 'Экспресс доставка',
            'PICKUP': 'Самовывоз'
        };
        return methodMap[method] || method;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            startDate: '',
            endDate: ''
        });
    };

    const filteredOrders = orders.filter(order => {
        if (filters.status && order.status !== filters.status) return false;
        if (filters.startDate && new Date(order.orderDate) < new Date(filters.startDate)) return false;
        return !(filters.endDate && new Date(order.orderDate) > new Date(filters.endDate));
    });

    const handleReorder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/reorder`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                alert('Заказ повторён!');
            }
        } catch (error) {
            console.error('Ошибка повторного заказа:', error);
            alert('Ошибка: ' + (error.response?.data?.error || error.message));
        }
    };

    const formatDeliveryInfo = (order) => {
        let info = [];
        if (order.shippingAddress) {
            info.push(`Адрес: ${order.shippingAddress}`);
        }
        if (order.recipientPhone) {
            info.push(`Телефон: ${order.recipientPhone}`);
        }
        if (order.shippingMethod) {
            info.push(`Способ доставки: ${getShippingMethodText(order.shippingMethod)}`);
        }
        if (order.deliveryNotes) {
            info.push(`Примечания: ${order.deliveryNotes}`);
        }
        return info;
    };

    if (loading) {
        return (
            <div className="order-history">
                <div className="loading">Загрузка заказов...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-history">
                <div className="error">
                    <h3>⚠️ Ошибка загрузки заказов</h3>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="retry-btn">
                        🔄 Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="order-history">
                <div className="empty-orders">
                    <div className="empty-orders-icon">📦</div>
                    <h3>У вас пока нет заказов</h3>
                    <p>Совершите первую покупку и она появится здесь</p>
                    <Link to="/" className="shop-now-btn">
                        🛍️ Перейти к покупкам
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history">
            <h2>История заказов</h2>

            <div className="order-filters">
                <div className="filter-group">
                    <label htmlFor="status">Статус</label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">Все статусы</option>
                        <option value="NEW">Новый</option>
                        <option value="PROCESSING">Обрабатывается</option>
                        <option value="SHIPPED">Отправлен</option>
                        <option value="DELIVERED">Доставлен</option>
                        <option value="CANCELLED">Отменен</option>
                        <option value="COMPLETED">Завершён</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="startDate">С даты</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="endDate">По дату</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>

                <button onClick={clearFilters} className="clear-filters">
                    ❌ Очистить фильтры
                </button>
            </div>

            <div className="orders-list">
                {filteredOrders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-header-left">
                                <h3>Заказ #{order.id}</h3>
                                <span className="order-date">
                                    {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                            <span className={`order-status status-${order.status?.toLowerCase()}`}>
                                {getStatusText(order.status)}
                            </span>
                        </div>

                        <div className="order-details">
                            <div className="detail-item">
                                <span className="detail-label">Дата заказа</span>
                                <span className="detail-value">
                                    {new Date(order.orderDate).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            {order.deliveryDate && (
                                <div className="detail-item">
                                    <span className="detail-label">Дата доставки</span>
                                    <span className="detail-value">
                                        {new Date(order.deliveryDate).toLocaleString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}

                            <div className="detail-item">
                                <span className="detail-label">Товаров</span>
                                <span className="detail-value">
                                    {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} шт.
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Общая сумма</span>
                                <span className="detail-value total-amount">
                                    {order.totalPrice ? `${order.totalPrice} ₽` : '—'}
                                </span>
                            </div>
                        </div>

                        {(order.shippingAddress || order.recipientPhone || order.shippingMethod) && (
                            <div className="delivery-info">
                                <h4>Информация о доставке</h4>
                                <div className="delivery-details">
                                    {order.shippingAddress && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">📍 Адрес:</span>
                                            <span className="delivery-value">{order.shippingAddress}</span>
                                        </div>
                                    )}
                                    {order.recipientName && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">👤 Получатель:</span>
                                            <span className="delivery-value">{order.recipientName}</span>
                                        </div>
                                    )}
                                    {order.recipientPhone && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">📱 Телефон:</span>
                                            <span className="delivery-value">{order.recipientPhone}</span>
                                        </div>
                                    )}
                                    {order.shippingMethod && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">🚚 Способ доставки:</span>
                                            <span className="delivery-value">{getShippingMethodText(order.shippingMethod)}</span>
                                        </div>
                                    )}
                                    {order.shippingCost > 0 && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">💰 Стоимость доставки:</span>
                                            <span className="delivery-value">{order.shippingCost} ₽</span>
                                        </div>
                                    )}
                                    {order.deliveryNotes && (
                                        <div className="delivery-detail">
                                            <span className="delivery-label">📝 Примечания:</span>
                                            <span className="delivery-value">{order.deliveryNotes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {order.orderItems && order.orderItems.length > 0 && (
                            <div className="order-items">
                                <h4>Товары в заказе</h4>
                                <div className="items-list">
                                    {order.orderItems.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <div className="item-image">
                                                {item.product?.name?.charAt(0) || 'Т'}
                                            </div>
                                            <div className="item-info">
                                                <span className="item-name">
                                                    {item.product?.name || 'Товар'}
                                                </span>
                                                {item.product?.description && (
                                                    <span className="item-description">
                                                        {item.product.description}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="item-quantity">
                                                ×{item.quantity}
                                            </span>
                                            <span className="item-price">
                                                {item.product?.price ?
                                                    `${item.product.price * item.quantity} ₽` :
                                                    '—'
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="order-actions">
                            <button
                                onClick={() => handleReorder(order.id)}
                                className="reorder-btn"
                            >
                                🔄 Повторить заказ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length > 0 && (
                <div className="order-stats">
                    <p>
                        Показано {filteredOrders.length} из {orders.length} заказов
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;