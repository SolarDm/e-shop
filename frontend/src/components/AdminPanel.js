import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';
import {API_BASE_URL} from "../config";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    const [orderFilters, setOrderFilters] = useState({
        status: '',
        search: ''
    });

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: ''
    });

    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: ''
    });

    const [categories, setCategories] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editDeliveryInfo, setEditDeliveryInfo] = useState({
        shippingAddress: '',
        recipientPhone: '',
        recipientName: '',
        deliveryNotes: '',
        shippingMethod: '',
        shippingCost: ''
    });

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'products') {
            fetchProducts();
            fetchCategories();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab, orderFilters]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            setError(error.response?.data?.error || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = {};
            if (orderFilters.status) params.status = orderFilters.status;
            if (orderFilters.search) params.search = orderFilters.search;

            const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            setError(error.response?.data?.error || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/products`);

            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            setError(error.response?.data?.error || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/categories`);
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            setError(error.response?.data?.error || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderFilterChange = (e) => {
        const { name, value } = e.target;
        setOrderFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearOrderFilters = () => {
        setOrderFilters({
            status: '',
            search: ''
        });
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/admin/products?name=${newProduct.name}&description=${newProduct.description}&price=${newProduct.price}&categoryId=${newProduct.categoryId}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Товар успешно создан!');
                setNewProduct({ name: '', description: '', price: '', categoryId: '' });
                fetchProducts();
            }
        } catch (error) {
            console.error('Ошибка создания товара:', error);
            alert(error.response?.data?.error || 'Ошибка создания товара');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_BASE_URL}/admin/products/${productId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Товар успешно удален!');
                fetchProducts();
            }
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            alert(error.response?.data?.error || 'Ошибка удаления товара');
        }
    };

    const handleStartEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.category?.id || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setEditForm({
            name: '',
            description: '',
            price: '',
            categoryId: ''
        });
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/admin/products/${editingProduct.id}?name=${editForm.name}&description=${editForm.description}&price=${editForm.price}&categoryId=${editForm.categoryId}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Товар успешно обновлен!');
                handleCancelEdit();
                fetchProducts();
            }
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
            alert(error.response?.data?.error || 'Ошибка обновления товара');
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/admin/orders/${orderId}/status?status=${status}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Статус заказа обновлен!');
                fetchOrders();
            }
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert(error.response?.data?.error || 'Ошибка обновления статуса');
        }
    };

    const handleViewOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/admin/orders/${orderId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                const order = response.data.order;
                setSelectedOrder(order);
                setEditDeliveryInfo({
                    shippingAddress: order.shippingAddress || '',
                    recipientPhone: order.recipientPhone || '',
                    recipientName: order.recipientName || '',
                    deliveryNotes: order.deliveryNotes || '',
                    shippingMethod: order.shippingMethod || '',
                    shippingCost: order.shippingCost || ''
                });
                setShowOrderModal(true);
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей заказа:', error);
            alert(error.response?.data?.error || 'Ошибка загрузки деталей');
        }
    };

    const handleUpdateDeliveryInfo = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/admin/orders/${selectedOrder.id}/delivery-info`,
                editDeliveryInfo,
                { headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } }
            );

            if (response.data.success) {
                alert('Информация о доставке обновлена!');
                fetchOrders();
                setShowOrderModal(false);
            }
        } catch (error) {
            console.error('Ошибка обновления доставки:', error);
            alert(error.response?.data?.error || 'Ошибка обновления');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_BASE_URL}/admin/orders/${orderId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Заказ успешно удален!');
                fetchOrders();
            }
        } catch (error) {
            console.error('Ошибка удаления заказа:', error);
            alert(error.response?.data?.error || 'Ошибка удаления заказа');
        }
    };

    const handleUpdateUserRole = async (userId, role) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${userId}/role?role=${role}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Роль пользователя обновлена!');
                fetchUsers();
            }
        } catch (error) {
            console.error('Ошибка обновления роли:', error);
            alert(error.response?.data?.error || 'Ошибка обновления роли');
        }
    };

    const getDisplayRole = (roles) => {
        if (!roles || roles.length === 0) return 'ROLE_USER';

        const rolePriority = {
            'ROLE_ADMIN': 2,
            'ROLE_USER': 1
        };

        return roles.reduce((highestRole, currentRole) => {
            const currentPriority = rolePriority[currentRole.name] || 0;
            const highestPriority = rolePriority[highestRole.name] || 0;
             return currentPriority > highestPriority ? currentRole : highestRole;
        }).name;
    };

    const getStatusText = (status) => {
        const statusMap = {
            'NEW': 'Новый',
            'PROCESSING': 'В обработке',
            'SHIPPED': 'Отправлен',
            'DELIVERED': 'Доставлен',
            'CANCELLED': 'Отменен',
            'COMPLETED': 'Завершён'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        return `status-${status.toLowerCase()}`;
    };

    if (loading && activeTab === 'dashboard' && !stats) {
        return (
            <div className="admin-panel">
                <div className="loading">Загрузка...</div>
            </div>
        );
    }

    const renderDashboard = () => (
        <div className="dashboard">
            <h2>Панель управления</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>👥 Пользователи</h3>
                    <p className="stat-number">{stats?.totalUsers || 0}</p>
                    <p className="stat-label">Всего зарегистрировано</p>
                </div>

                <div className="stat-card">
                    <h3>📦 Заказы</h3>
                    <p className="stat-number">{stats?.totalOrders || 0}</p>
                    <p className="stat-label">Всего оформлено</p>
                </div>

                <div className="stat-card">
                    <h3>🛒 Товары</h3>
                    <p className="stat-number">{stats?.totalProducts || 0}</p>
                    <p className="stat-label">В каталоге</p>
                </div>
            </div>

            <div className="recent-orders">
                <h3>Последние заказы</h3>
                {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="recent-order-item">
                        <div className="order-id">#{order.id}</div>
                        <div className={`order-status ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                        </div>
                        <div className="order-total">{order.totalPrice} ₽</div>
                        <div className="order-date">
                            {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="orders-section">
            <div className="orders-header">
                <h2>Управление заказами</h2>

                <div className="order-filters">
                    <div className="filter-group">
                        <select
                            name="status"
                            value={orderFilters.status}
                            onChange={handleOrderFilterChange}
                            className="filter-select"
                        >
                            <option value="">Все статусы</option>
                            <option value="NEW">Новые</option>
                            <option value="PROCESSING">В обработке</option>
                            <option value="SHIPPED">Отправленные</option>
                            <option value="DELIVERED">Доставленные</option>
                            <option value="CANCELLED">Отмененные</option>
                            <option value="COMPLETED">Завершённые</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <input
                            type="text"
                            name="search"
                            value={orderFilters.search}
                            onChange={handleOrderFilterChange}
                            placeholder="Поиск по ID, имени, телефону..."
                            className="search-input"
                        />
                    </div>

                    <button onClick={clearOrderFilters} className="clear-filters-btn">
                        Очистить фильтры
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>Заказы не найдены</p>
                    <button onClick={fetchOrders} className="retry-btn">
                        Обновить
                    </button>
                </div>
            ) : (
                <div className="orders-table-container">
                    <div className="table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Дата</th>
                                    <th>Пользователь</th>
                                    <th>Получатель</th>
                                    <th>Статус</th>
                                    <th>Сумма</th>
                                    <th>Доставка</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="order-row">
                                        <td className="order-id-cell">
                                            <strong>#{order.id}</strong>
                                        </td>
                                        <td>
                                            {new Date(order.orderDate).toLocaleDateString('ru-RU', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-name">{order.user?.username}</div>
                                                <div className="user-email">{order.user?.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            {order.recipientName ? (
                                                <div className="recipient-info">
                                                    <div>{order.recipientName}</div>
                                                    <div className="recipient-phone">{order.recipientPhone}</div>
                                                </div>
                                            ) : (
                                                <span className="no-data">Не указан</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="status-cell">
                                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="NEW">Новый</option>
                                                    <option value="PROCESSING">В обработке</option>
                                                    <option value="SHIPPED">Отправлен</option>
                                                    <option value="DELIVERED">Доставлен</option>
                                                    <option value="CANCELLED">Отменен</option>
                                                    <option value="COMPLETED">Завершён</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{order.totalPrice} ₽</strong>
                                            {order.shippingCost > 0 && (
                                                <div className="shipping-cost">
                                                    (доставка: {order.shippingCost} ₽)
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {order.shippingAddress ? (
                                                <div className="delivery-info-short">
                                                    {order.shippingMethod && (
                                                        <div className="method">{order.shippingMethod}</div>
                                                    )}
                                                    <div className="address">{order.shippingAddress.substring(0, 30)}...</div>
                                                </div>
                                            ) : (
                                                <span className="no-data">Не указана</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="order-actions">
                                                <button
                                                    onClick={() => handleViewOrderDetails(order.id)}
                                                    className="btn-view btn-small"
                                                    title="Просмотр деталей"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                                    className="btn-complete btn-small"
                                                    title="Завершить заказ"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="btn-delete btn-small"
                                                    title="Удалить заказ"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="orders-footer">
                        <p>Показано {orders.length} заказов</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderProducts = () => (
        <div className="products-section">
            <h2>Управление товарами</h2>

            <div className="product-form">
                <h3>Добавить новый товар</h3>
                <form onSubmit={handleCreateProduct}>
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Название товара"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="number"
                                placeholder="Цена"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <select
                                value={newProduct.categoryId}
                                onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                                required
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="Описание товара"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            required
                            rows="3"
                        />
                    </div>
                    <button type="submit" className="btn-create">
                        Создать товар
                    </button>
                </form>
            </div>

            {editingProduct && (
                <div className="edit-product-form modal-form">
                    <h3>Редактирование товара: {editingProduct.name}</h3>
                    <form onSubmit={handleUpdateProduct}>
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Название товара"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="number"
                                    placeholder="Цена"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    value={editForm.categoryId}
                                    onChange={(e) => setEditForm({...editForm, categoryId: e.target.value})}
                                    required
                                >
                                    <option value="">Выберите категорию</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Описание товара"
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                required
                                rows="3"
                            />
                        </div>
                        <div className="edit-form-actions">
                            <button type="submit" className="btn-save">
                                Сохранить изменения
                            </button>
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleCancelEdit}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="products-list">
                <h3>Список товаров ({products.length})</h3>
                {products.length === 0 ? (
                    <div className="empty-state">
                        <p>Товаров нет</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-admin-card">
                                <div className="product-card-header">
                                    <h4>{product.name}</h4>
                                    <span className="product-price">{product.price} ₽</span>
                                </div>
                                <p className="product-description">{product.description}</p>
                                <p className="product-category">
                                    <strong>Категория:</strong> {product.category?.name || 'Не указана'}
                                </p>
                                <div className="product-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleStartEdit(product)}
                                    >
                                        ✏️ Редактировать
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="users-section">
            <h2>Управление пользователями</h2>

            {users.length === 0 ? (
                <div className="empty-state">
                    <p>Пользователей нет</p>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя пользователя</th>
                                <th>Email</th>
                                <th>Имя</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        <div className="user-cell">
                                            <strong>{user.username}</strong>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.fullName || 'Не указано'}</td>
                                    <td>
                                        <select
                                            value={getDisplayRole(user.roles)}
                                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="ROLE_USER">👤 Пользователь</option>
                                            <option value="ROLE_ADMIN">👑 Администратор</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="btn-view">👁️ Просмотр</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="admin-panel">
                <div className="admin-header">
                    <h1>👑 Панель администратора</h1>
                </div>

                <div className="admin-container">
                    <div className="admin-sidebar">
                        <button
                            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            📊 Дашборд
                        </button>
                        <button
                            className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            📦 Заказы
                        </button>
                        <button
                            className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            🛒 Товары
                        </button>
                        <button
                            className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 Пользователи
                        </button>
                    </div>

                    <div className="admin-content">
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'products' && renderProducts()}
                        {activeTab === 'users' && renderUsers()}
                    </div>
                </div>
            </div>

            {showOrderModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Детали заказа #{selectedOrder.id}</h3>
                            <button
                                className="close-modal"
                                onClick={() => setShowOrderModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="order-details-modal">
                                <div className="order-info-section">
                                    <h4>Основная информация</h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Дата заказа:</span>
                                            <span className="info-value">
                                                {new Date(selectedOrder.orderDate).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Статус:</span>
                                            <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Пользователь:</span>
                                            <span className="info-value">
                                                {selectedOrder.user?.username} ({selectedOrder.user?.email})
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Общая сумма:</span>
                                            <span className="info-value total-price">
                                                {selectedOrder.totalPrice} ₽
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="delivery-info-section">
                                    <h4>Информация о доставке</h4>
                                    <form onSubmit={handleUpdateDeliveryInfo}>
                                        <div className="form-group">
                                            <label>Имя получателя:</label>
                                            <input
                                                type="text"
                                                value={editDeliveryInfo.recipientName}
                                                onChange={(e) => setEditDeliveryInfo({
                                                    ...editDeliveryInfo,
                                                    recipientName: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Телефон:</label>
                                            <input
                                                type="text"
                                                value={editDeliveryInfo.recipientPhone}
                                                onChange={(e) => setEditDeliveryInfo({
                                                    ...editDeliveryInfo,
                                                    recipientPhone: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Адрес доставки:</label>
                                            <textarea
                                                value={editDeliveryInfo.shippingAddress}
                                                onChange={(e) => setEditDeliveryInfo({
                                                    ...editDeliveryInfo,
                                                    shippingAddress: e.target.value
                                                })}
                                                rows="2"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Способ доставки:</label>
                                                <select
                                                    value={editDeliveryInfo.shippingMethod}
                                                    onChange={(e) => setEditDeliveryInfo({
                                                        ...editDeliveryInfo,
                                                        shippingMethod: e.target.value
                                                    })}
                                                >
                                                    <option value="">Не указан</option>
                                                    <option value="STANDARD">Стандартная</option>
                                                    <option value="EXPRESS">Экспресс</option>
                                                    <option value="PICKUP">Самовывоз</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Стоимость доставки:</label>
                                                <input
                                                    type="number"
                                                    value={editDeliveryInfo.shippingCost}
                                                    onChange={(e) => setEditDeliveryInfo({
                                                        ...editDeliveryInfo,
                                                        shippingCost: e.target.value
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Примечания для курьера:</label>
                                            <textarea
                                                value={editDeliveryInfo.deliveryNotes}
                                                onChange={(e) => setEditDeliveryInfo({
                                                    ...editDeliveryInfo,
                                                    deliveryNotes: e.target.value
                                                })}
                                                rows="2"
                                            />
                                        </div>
                                        <div className="modal-actions">
                                            <button type="submit" className="btn-save">
                                                Сохранить изменения
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-cancel"
                                                onClick={() => setShowOrderModal(false)}
                                            >
                                                Закрыть
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                                    <div className="order-items-section">
                                        <h4>Товары в заказе</h4>
                                        <div className="order-items-list">
                                            {selectedOrder.orderItems.map(item => (
                                                <div key={item.id} className="order-item-row">
                                                    <div className="item-image">
                                                        {item.product?.name?.charAt(0) || 'Т'}
                                                    </div>
                                                    <div className="item-info">
                                                        <div className="item-name">
                                                            {item.product?.name || 'Товар'}
                                                        </div>
                                                        <div className="item-description">
                                                            {item.product?.description}
                                                        </div>
                                                    </div>
                                                    <div className="item-quantity">
                                                        ×{item.quantity}
                                                    </div>
                                                    <div className="item-price">
                                                        {item.product?.price ?
                                                            `${item.product.price * item.quantity} ₽` :
                                                            '—'
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPanel;