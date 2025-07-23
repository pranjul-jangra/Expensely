import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    user: {},
    expensesPerMonth: null,
    transactionToEdit: {},
    donutData: null,
    token: "",
    loader: false,
    rateLimitExceeds: false,
    retryAfter: 60,
    error: null,
    isAuthorized: true,
}

// Slice
const userSlice = createSlice({
    name: 'user',
    initialState,

    reducers: {
        setUser: (state, action) => { state.user = action.payload; },
        setExpensesPerMonth: (state, action) => { state.expensesPerMonth = action.payload },
        setToken: (state, action) => { state.token = action.payload; },
        setLoader: (state, action) => { state.loader = action.payload; },
        setRateLimitExceeds: (state, action) => { state.rateLimitExceeds = action.payload; },
        setRetryAfter: (state, action) => { state.retryAfter = action.payload; },
        setError: (state, action) => { state.error = action.payload; },
        setIsAuthorized: (state, action) => { state.isAuthorized = action.payload },
        setDonutData: (state, action) => { state.donutData = action.payload },
        setTransactionToEdit: (state, action) => { state.transactionToEdit = action.payload },
        clearError: (state) => { state.error = null; },
        
        clearUser: (state) => { 
            state.user = {}; 
            state.expensesPerMonth = null, 
            state.token = ""; 
            state.error = null; 
            state.isAuthorized = false; 
            state.transactionToEdit = {};
        },
    }
});

export const {
    setUser, setToken, setLoader,
    clearUser, setRateLimitExceeds, setRetryAfter,
    setError, clearError, setIsAuthorized,
    setExpensesPerMonth, setDonutData,
    setTransactionToEdit
} = userSlice.actions;


export default userSlice.reducer;