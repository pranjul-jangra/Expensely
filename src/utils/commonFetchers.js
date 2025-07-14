import interceptor from "../middleware/AxiosInstance";
import { store } from "../reduxStates/store";
import { setUser, setToken, setError, clearError, setIsAuthorized, setExpensesPerMonth, setDonutData } from "../reduxStates/userSlice";


export const refreshAuthToken = async () => {
    try {
        store.dispatch(clearError());

        const response = await interceptor.get('/api/user/refresh');
        const newToken = response.data?.accessToken;

        if (newToken) {
            store.dispatch(setToken(newToken));
            return newToken;
        } else {
            throw new Error("No access token received");
        }

    } catch (error) {
        store.dispatch(setError(error.response?.data || "Failed to refresh token"));
        store.dispatch(setToken(""));
        throw error;
    }
};


export const fetchUser = async () => {
    try {
        const response = await interceptor.get('/api/user/data');
        const userData = response.data?.user;

        // Update store with user data
        store.dispatch(setUser(userData));
        store.dispatch(setIsAuthorized(true));
        return userData;

    } catch (error) {
        store.dispatch(setError(error.response?.data || "Failed to fetch user"));
        throw error;
    }
};


export const getExpensesPerMonth = async (year) => {
    try {
        const response = await interceptor.post('/api/expense/expenses-per-month', { year });
        const raw = response.data?.expenses;

        // Build a safe 12-length array
        const monthlySummary = new Array(12).fill(0);
        raw.forEach(item => {
            const index = item.month - 1;
            monthlySummary[index] = item.total;
        });

        store.dispatch(setExpensesPerMonth(monthlySummary));
        return monthlySummary;

    } catch (error) {
        store.dispatch(setError(error.response?.data || "Failed to get expenses per months"));
        throw error;
    }
}


export const getDonutData = async () => {
    try {
        const res = await interceptor.get('/api/expense/top-five-expenses');
        store.dispatch(setDonutData(res.data?.categories));
        return res.data?.categories;

    } catch (error) {
        throw error;
    }
}


export const refreshAllSummaryData = async (year) => {
  try {
    await Promise.all([
      fetchUser(),
      getExpensesPerMonth(year),
      getDonutData()
    ]);
  } catch (err) {
    console.error("Failed to refresh summary data:", err);
  }
};