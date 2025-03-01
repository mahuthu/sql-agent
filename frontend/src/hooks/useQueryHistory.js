// Query history hook
import { useState, useEffect } from 'react';
import { getQueryHistory } from '../utils/api';
import { useCustomToast } from './useCustomToast';

export const useQueryHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showErrorToast } = useCustomToast();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await getQueryHistory();
            // Ensure we're setting an array
            setHistory(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching query history:', error);
            showErrorToast('Error', 'Failed to load query history');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const refreshHistory = () => {
        fetchHistory();
    };

    return {
        history,
        loading,
        refreshHistory,
    };
}; 