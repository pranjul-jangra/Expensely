import axios from "axios";
import { store } from "../reduxStates/store";
import { setToken, clearUser, setLoader, setRateLimitExceeds, setRetryAfter, setIsAuthorized } from "../reduxStates/userSlice";

// Global variable to track refresh promise (prevent multiple refesh token calls)
let refreshPromise = null;

// Interceptor configuration
const interceptor = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL,
    withCredentials: true,
});

// Request interceptor
interceptor.interceptors.request.use(
    (config) => {
        store.dispatch(setLoader(true));
        const states = store.getState();

        if (states.user?.token) {
            config.headers.Authorization = `Bearer ${states.user.token}`;
        }
        return config;
    },
    (error) => {
        store.dispatch(setLoader(false));
        return Promise.reject(error);
    }
);

// Response interceptor
interceptor.interceptors.response.use(
    response => {
        store.dispatch(setLoader(false));
        store.dispatch(setIsAuthorized(true));
        return response;
    },

    async error => {
        const originalRequest = error.config;

        // Handle 401 errors with token refreshment
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/refresh')) {
            originalRequest._retry = true;

            try {
                // Check if refresh request is already in progress
                if (!refreshPromise) {
                    // Start new refresh request
                    refreshPromise = axios.get('/api/user/refresh', {
                        baseURL: import.meta.env.VITE_API_BASEURL,
                        withCredentials: true
                    }).finally(() => {
                        refreshPromise = null;
                    });
                }

                // Wait for the refresh request
                const response = await refreshPromise;
                const newToken = response.data?.accessToken;

                if (newToken) {
                    store.dispatch(setToken(newToken));
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return interceptor(originalRequest);
                }

                // If no token received
                store.dispatch(setLoader(false));
                store.dispatch(clearUser());
                return Promise.reject(new Error("Token refresh failed"));

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                store.dispatch(setLoader(false));
                store.dispatch(clearUser());
                store.dispatch(setIsAuthorized(false));
                return Promise.reject(refreshError);
            }
        }

        // Handle 429 rate limiting errors
        if (error.response?.status === 429) {
            store.dispatch(setLoader(false));

            const retryAfterText = error.response.data?.retryAfter || "60s";
            const retrySeconds = parseInt(retryAfterText.replace(/[^\d]/g, "")) || 60;

            store.dispatch(setRetryAfter(retrySeconds));
            store.dispatch(setRateLimitExceeds(true));
            return Promise.reject(error);
        }

        // Set loader to false for all other errors
        store.dispatch(setLoader(false));
        return Promise.reject(error);
    }
);

export default interceptor;