import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  };
case 'SET_LOADING':
  return {
    ...state,
    loading: action.payload,
  };
default:
  return state;
}
};
export const AuthProvider = ({ children }) => {
const [state, dispatch] = useReducer(authReducer, {
user: null,
token: null,
isAuthenticated: false,
loading: true,
});
useEffect(() => {
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (token && user) {
  dispatch({
    type: 'LOGIN_SUCCESS',
    payload: {
      token,
      user: JSON.parse(user),
    },
  });
} else {
  dispatch({ type: 'SET_LOADING', payload: false });
}
}, []);
const login = async (credentials) => {
try {
dispatch({ type: 'SET_LOADING', payload: true });
console.log('Sending data:', credentials); // ← Tambah ini
const response = await api.post('/login', credentials);
  const { employee, token } = response.data.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(employee));
  
  dispatch({
    type: 'LOGIN_SUCCESS',
    payload: {
      user: employee,
      token,
    },
  });
  
  return { success: true, data: response.data };
} catch (error) {
  console.log('Full error:', error.response); // ← Tambah ini
  console.log('Error data:', error.response?.data); // ← Tambah ini
  dispatch({ type: 'SET_LOADING', payload: false });
  return {
    success: false,
    message: error.response?.data?.message || 'Login failed',
  };
}
};
const register = async (userData) => {
try {
console.log('Sending register data:', userData); // ← Tambah ini
const response = await api.post('/register', userData);
return { success: true, data: response.data };
} catch (error) {
console.log('Register error response:', error.response?.data); // ← Tambah ini
return {
success: false,
message: error.response?.data?.message || 'Registration failed',
errors: error.response?.data?.errors,
};
}
};
const logout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
dispatch({ type: 'LOGOUT' });
};
return (
<AuthContext.Provider
value={{
...state,
login,
register,
logout,
}}
>
{children}
</AuthContext.Provider>
);
};
export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};