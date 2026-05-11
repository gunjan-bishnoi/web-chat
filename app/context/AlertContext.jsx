"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        type: 'info', // 'info', 'success', 'warning', 'error'
        confirm: false,
        onConfirm: null,
        onCancel: null,
    });

    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, show: false }));
    }, []);

    const showAlert = useCallback((message, type = 'info') => {
        setAlert({
            show: true,
            message,
            type,
            confirm: false,
            onConfirm: null,
            onCancel: null,
        });
    }, []);

    const showConfirm = useCallback((message, onConfirm, onCancel = undefined, type = 'warning') => {
        setAlert({
            show: true,
            message,
            type,
            confirm: true,
            onConfirm: () => {
                hideAlert();
                if (typeof onConfirm === 'function') onConfirm();
            },
            onCancel: () => {
                hideAlert();
                if (typeof onCancel === 'function') onCancel();
            },
        });
    }, [hideAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, hideAlert, alert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
