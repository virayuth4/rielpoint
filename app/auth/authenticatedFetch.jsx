import { getAuth, onAuthStateChanged } from "firebase/auth";

const authenticatedFetch = async (url, options = {}) => {
    const auth = getAuth();

    // Function to get the current user
    const getCurrentUser = () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, 
                (user) => {
                    unsubscribe();
                    resolve(user);
                },
                (error) => {
                    unsubscribe();
                    reject(error);
                }
            );
        });
    };

    try {
        const user = await getCurrentUser();

        if (!user) {
            // Not authenticated — return a proper 401 so callers can branch on it
            return new Response(
                JSON.stringify({ error: "User not authenticated" }),
                { status: 401 }
            );
        }

        const token = await user.getIdToken();

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Only set Content-Type for non-formData requests
                ...(!(options.body instanceof FormData) && {
                    'Content-Type': 'application/json'
                })
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            },
        };

        const response = await fetch(url, mergedOptions);

        // Don't throw on non-200 responses, let the calling code handle them
        return response;

    } catch (error) {
        console.error('Error in authenticatedFetch:', error);

        return new Response(
            JSON.stringify({ 
                error: error.message || "An unexpected error occurred",
                details: error.toString() 
            }), 
            { status: 500 }
        );
    }
};

export default authenticatedFetch;