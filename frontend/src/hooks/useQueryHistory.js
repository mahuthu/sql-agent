// Query history hook
import { useState, useEffect } from 'react';
import { getQueryHistory } from '../utils/api';

export const useQueryHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getQueryHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load query history:', error);
        } finally {
            setLoading(false);
        }
    };

    return { history, loading, refreshHistory: loadHistory };
}; 