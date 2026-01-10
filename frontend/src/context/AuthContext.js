import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {API_BASE_URL} from "../config";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    const checkRolesFromToken = (token) => {
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));

                let extractedRoles = [];

                if (payload.roles) {
                    extractedRoles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
                } else if (payload.authorities) {
                    extractedRoles = Array.isArray(payload.authorities) ? payload.authorities : [payload.authorities];
                } else if (payload.scope) {
                    extractedRoles = Array.isArray(payload.scope) ? payload.scope : [payload.scope];
                }

                const normalizedRoles = extractedRoles.map(role =>
                    role.replace('ROLE_', '').toUpperCase()
                );

                setRoles(normalizedRoles);
                setIsAdmin(normalizedRoles.includes('ADMIN'));

                return normalizedRoles;
            }
        } catch (error) {
            console.error('Error parsing token:', error);
        }
        return [];
    };

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const tokenRoles = checkRolesFromToken(token);

            const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                const userData = response.data;

                if (userData.roles && userData.roles.length > 0) {
                    const normalizedRoles = userData.roles.map(role =>
                        role.replace('ROLE_', '').toUpperCase()
                    );
                    setRoles(normalizedRoles);
                    setIsAdmin(normalizedRoles.includes('ADMIN'));
                }

                setUser({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    roles: userData.roles || []
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);

            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const tokenParts = token.split('.');
                    if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        setUser({
                            username: payload.sub || payload.username,
                            email: payload.email
                        });
                    }
                } catch (tokenError) {
                    console.error('Error parsing token:', tokenError);
                }
            }

            localStorage.removeItem('token');
            setUser(null);
            setIsAdmin(false);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.token) {
                const token = response.data.token;
                localStorage.setItem('token', token);

                setUser({
                    username: response.data.username,
                    email: response.data.email,
                    roles: response.data.roles || []
                });

                const isAdmin = (response.data.roles || []).includes('ROLE_ADMIN');
                setIsAdmin(isAdmin);
                setRoles(response.data.roles || []);

                console.log('Успешный вход. Роли:', response.data.roles);
                console.log('Админ?', isAdmin);

                return { success: true };
            } else {
                throw new Error('Неверный ответ от сервера');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.error || error.message || 'Ошибка входа');
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.error || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw new Error(error.response?.data?.error || error.message || 'Ошибка регистрации');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
        setRoles([]);
    };

    const hasRole = (roleName) => {
        const normalizedRole = roleName.replace('ROLE_', '').toUpperCase();
        return roles.includes(normalizedRole);
    };

    const hasAnyRole = (roleNames) => {
        return roleNames.some(roleName => hasRole(roleName));
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        isAdmin,
        roles,
        loading,
        login,
        register,
        logout,
        hasRole,
        hasAnyRole,
        updateUser,
        refreshUser: fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column'
                }}>
                    <div className="loading-spinner"></div>
                    <p>Загрузка...</p>
                </div>
            )}
        </AuthContext.Provider>
    );
};
