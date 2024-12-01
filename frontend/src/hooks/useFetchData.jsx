import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchData = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the token from localStorage
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the headers
                    },
                });
                console.log('API response:', response.data); // Log the entire response
                setData(response.data.data); // Ensure you're setting the correct part of the response
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

export default useFetchData;
