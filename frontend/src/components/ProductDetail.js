import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {API_BASE_URL} from "../config";
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/products/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Товар не найден');
            }

            setProduct(data.product);
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            setError(error.message);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Требуется авторизация для добавления в корзину');
                navigate('/login');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/cart/add?productId=${id}&quantity=${quantity}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Ошибка добавления в корзину');
            }

            alert(data.message || `Товар добавлен в корзину (${quantity} шт.)`);
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert(error.message);
        }
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="product-detail loading">
                <div className="loading-spinner"></div>
                <p>Загрузка товара...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail error">
                <h2>Товар не найден</h2>
                <p>{error || 'Произошла ошибка при загрузке товара'}</p>
                <button onClick={() => navigate('/')} className="back-btn">
                    Вернуться к товарам
                </button>
            </div>
        );
    }

    return (
        <div className="product-detail">
            <div className="product-container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Назад
                </button>

                <div className="product-content">
                    <div className="product-image">
                        <div className="image-placeholder">
                            {product.name.charAt(0)}
                        </div>
                    </div>

                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-price">
                            <span className="price-value">{product.price} ₽</span>
                            {product.oldPrice && (
                                <span className="old-price">{product.oldPrice} ₽</span>
                            )}
                        </div>

                        {product.category && (
                            <div className="product-category">
                                Категория: <span>{product.category.name}</span>
                            </div>
                        )}

                        <div className="product-description">
                            <h3>Описание</h3>
                            <p>{product.description || 'Описание отсутствует'}</p>
                        </div>

                        <div className="product-actions">
                            <div className="quantity-selector">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    className="quantity-btn"
                                >
                                    −
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button
                                    onClick={incrementQuantity}
                                    className="quantity-btn"
                                >
                                    +
                                </button>
                            </div>

                            <button onClick={addToCart} className="add-to-cart-btn">
                                Добавить в корзину
                                <span className="total-price">
                                    {product.price * quantity} ₽
                                </span>
                            </button>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="meta-label">Артикул:</span>
                                <span className="meta-value">{product.id}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Доступность:</span>
                                <span className="meta-value in-stock">В наличии</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
