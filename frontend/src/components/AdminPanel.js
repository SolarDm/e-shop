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
    }, [activeTab]);

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
            const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                    <h3>Пользователи</h3>
                    <p className="stat-number">{stats?.totalUsers || 0}</p>
                    <p className="stat-label">Всего зарегистрировано</p>
                </div>

                <div className="stat-card">
                    <h3>Заказы</h3>
                    <p className="stat-number">{stats?.totalOrders || 0}</p>
                    <p className="stat-label">Всего оформлено</p>
                </div>

                <div className="stat-card">
                    <h3>Товары</h3>
                    <p className="stat-number">{stats?.totalProducts || 0}</p>
                    <p className="stat-label">В каталоге</p>
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="orders-section">
            <h2>Управление заказами</h2>

            {orders.length === 0 ? (
                <p>Заказов нет</p>
            ) : (
                <div className="orders-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата</th>
                            <th>Пользователь</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>{order.user?.username || 'N/A'}</td>
                                <td>
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
                                </td>
                                <td>{order.totalPrice} ₽</td>
                                <td>
                                    <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                        className="btn-complete"
                                    >
                                        Завершить
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
                        <textarea
                            placeholder="Описание товара"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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
                    <button type="submit" className="btn-create">
                        Создать товар
                    </button>
                </form>
            </div>

            {editingProduct && (
                <div className="edit-product-form">
                    <h3>Редактирование товара: {editingProduct.name}</h3>
                    <form onSubmit={handleUpdateProduct}>
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
                            <textarea
                                placeholder="Описание товара"
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
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
                <h3>Список товаров</h3>
                {products.length === 0 ? (
                    <p>Товаров нет</p>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-admin-card">
                                <h4>{product.name}</h4>
                                <p>{product.description}</p>
                                <p className="price">{product.price} ₽</p>
                                <p className="category">
                                    Категория: {product.category?.name || 'Не указана'}
                                </p>
                                <div className="product-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleStartEdit(product)}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        Удалить
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
                <p>Пользователей нет</p>
            ) : (
                <div className="users-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя пользователя</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={getDisplayRole(user.roles)}
                                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="ROLE_USER">Пользователь</option>
                                        <option value="ROLE_ADMIN">Администратор</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-view">Просмотр</button>
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
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Панель администратора</h1>
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
    );
};

export default AdminPanel;