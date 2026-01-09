import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoot';
import AdminRoute from './components/AdminRoot';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';
import Header from './components/Header';
import ProductDetail from "./components/ProductDetail";
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<ProductList />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/product/:id" element={<ProductDetail />} />

                            <Route path="/cart" element={
                                <PrivateRoute>
                                    <Cart />
                                </PrivateRoute>
                            } />

                            <Route path="/orders" element={
                                <PrivateRoute>
                                    <OrderHistory />
                                </PrivateRoute>
                            } />

                            <Route path="/admin/*" element={
                                <PrivateRoute>
                                    <AdminRoute>
                                        <AdminPanel />
                                    </AdminRoute>
                                </PrivateRoute>
                            } />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;