import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TOKEN_KEY = 'token';

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function extractErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      saveToken(data.token);
      toast.success('Registration successful!');
      return data.user;
    } catch (error) {
      const message = extractErrorMessage(error, 'Registration failed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', userData);
      saveToken(data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (error) {
      const message = extractErrorMessage(error, 'Login failed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue('No saved session found');

      const { data } = await api.get('/auth/profile');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        removeToken();
      }
      return rejectWithValue(
        extractErrorMessage(error, 'Session could not be restored')
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', userData);
      toast.success('Profile updated successfully');
      return data.user;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to update profile');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      removeToken();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      toast.success('Signed out');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const setFulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    };

    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(register.pending, setPending)
      .addCase(register.fulfilled, setFulfilled)
      .addCase(register.rejected, setRejected)
      .addCase(login.pending, setPending)
      .addCase(login.fulfilled, setFulfilled)
      .addCase(login.rejected, setRejected)
      .addCase(loadUser.pending, setPending)
      .addCase(loadUser.fulfilled, setFulfilled)
      .addCase(loadUser.rejected, setRejected)
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.fulfilled, setFulfilled)
      .addCase(updateProfile.rejected, setRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
