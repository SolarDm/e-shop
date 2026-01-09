import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {API_BASE_URL} from "../config";
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/api/products`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Ошибка загрузки товаров');
            }

            setProducts(response.data.products || []);
            setFilteredProducts(response.data.products || []);

            if (response.data.products && response.data.products.length > 0) {
                const maxPrice = Math.max(...response.data.products.map(p => p.price));
                setPriceRange(prev => ({ ...prev, max: Math.ceil(maxPrice) }));
            }

        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            setError(error.response?.data?.error || error.message || 'Ошибка загрузки товаров');
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/products/categories`);
            if (response.data.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category && product.category.id.toString() === selectedCategory
            );
        }

        filtered = filtered.filter(product => {
            const price = Number(product.price);
            return price >= priceRange.min && price <= priceRange.max;
        });

        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-desc':
                filtered.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    const addToCart = async (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Требуется авторизация для добавления в корзину');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/cart/add?productId=${productId}&quantity=1`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.error || 'Ошибка добавления в корзину');
            }

            alert(response.data.message || 'Товар добавлен в корзину!');

            if (window.updateCartCount) {
                window.updateCartCount();
            }

        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert(error.response?.data?.error || error.message || 'Ошибка добавления в корзину');
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchProducts();
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/products/search?name=${searchTerm}`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Ошибка поиска');
            }

            setProducts(response.data.products || []);

        } catch (error) {
            console.error('Ошибка поиска:', error);
            alert(error.response?.data?.error || error.message || 'Ошибка поиска');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = async (categoryId) => {
        if (categoryId === 'all') {
            fetchProducts();
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/products/category/${categoryId}`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Ошибка фильтрации');
            }

            setProducts(response.data.products || []);

        } catch (error) {
            console.error('Ошибка фильтрации по категории:', error);
            alert(error.response?.data?.error || error.message || 'Ошибка фильтрации');
            fetchProducts();
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSortBy('default');
        setPriceRange({ min: 0, max: priceRange.max });
        fetchProducts();
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ← Назад
                </button>

                {startPage > 1 && (
                    <>
                        <button onClick={() => paginate(1)} className="pagination-btn">1</button>
                        {startPage > 2 && <span className="pagination-dots">...</span>}
                    </>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                        <button onClick={() => paginate(totalPages)} className="pagination-btn">
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Вперед →
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="product-list">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Загрузка товаров...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list">
                <div className="error">
                    <h3>Ошибка загрузки товаров</h3>
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="retry-btn">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="product-list">
            <div className="page-header">
                <h1>Каталог товаров</h1>
                <p>Найдено товаров: {filteredProducts.length}</p>
            </div>

            <div className="filters-container">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Поиск товаров..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button onClick={handleSearch} className="search-btn">
                            🔍
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="toggle-filters-btn"
                    >
                        {showFilters ? 'Скрыть фильтры ▲' : 'Показать фильтры ▼'}
                    </button>
                </div>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <h3>Категории</h3>
                            <div className="categories-list">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        handleCategoryFilter('all');
                                    }}
                                    className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                >
                                    Все товары
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id.toString());
                                            handleCategoryFilter(category.id);
                                        }}
                                        className={`category-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Сортировка</h3>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                <option value="default">По умолчанию</option>
                                <option value="price-asc">Цена: по возрастанию</option>
                                <option value="price-desc">Цена: по убыванию</option>
                                <option value="name-asc">Название: А-Я</option>
                                <option value="name-desc">Название: Я-А</option>
                                <option value="newest">Сначала новые</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <h3>Диапазон цен</h3>
                            <div className="price-inputs-container">
                                <div className="price-input-group">
                                    <label className="price-label">От:</label>
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => {
                                            const value = Math.max(0, parseInt(e.target.value) || 0);
                                            setPriceRange({...priceRange, min: value});
                                        }}
                                        className="price-input"
                                        min="0"
                                        step="100"
                                    />
                                </div>
                                <div className="price-input-group">
                                    <label className="price-label">До:</label>
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => {
                                            const value = Math.max(priceRange.min, parseInt(e.target.value) || priceRange.max);
                                            setPriceRange({...priceRange, max: value});
                                        }}
                                        className="price-input"
                                        min={priceRange.min}
                                        step="100"
                                    />
                                </div>
                                <div className="price-currency">₽</div>
                            </div>
                            <div className="price-range-info">
                                <span>Диапазон: {priceRange.min} - {priceRange.max} ₽</span>
                                <button
                                    onClick={() => setPriceRange({min: 0, max: priceRange.max})}
                                    className="reset-price-btn"
                                    title="Сбросить минимальную цену"
                                >
                                    Сбросить
                                </button>
                            </div>
                        </div>

                        <button onClick={clearFilters} className="clear-filters-btn">
                            ❌ Очистить фильтры
                        </button>
                    </div>
                )}
            </div>

            {filteredProducts.length === 0 ? (
                <div className="empty-products">
                    <div className="empty-icon">😔</div>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                    <button onClick={clearFilters} className="reset-filters-btn">
                        Сбросить фильтры
                    </button>
                </div>
            ) : (
                <>
                    <div className="products-grid">
                        {currentProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`} className="product-link">
                                    <div className="product-image">
                                        <div className="image-placeholder">
                                            {product.name.charAt(0)}
                                        </div>
                                        {product.category && (
                                            <span className="product-category-badge">
                                                {product.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-info">
                                    <h3 className="product-title">{product.name}</h3>
                                        <p className="product-description">
                                            {product.description || 'Описание отсутствует'}
                                        </p>
                                        <div className="product-price">
                                            <span className="price-value">{product.price} ₽</span>
                                        </div>
                                        <div className="product-actions">
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={(e) => addToCart(product.id, e)}
                                            >
                                                🛒 Добавить в корзину
                                            </button>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="view-details-btn"
                                            >
                                                Подробнее →
                                            </Link>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && renderPagination()}

                    <div className="products-summary">
                        <p>
                            Показано {currentProducts.length} из {filteredProducts.length} товаров
                            {selectedCategory !== 'all' && ` в категории "${categories.find(c => c.id.toString() === selectedCategory)?.name}"`}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductList;