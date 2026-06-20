import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const getMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

// ─── Async Actions ─────────────────────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/stats');
      return data.stats;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Failed to load stats'));
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/orders', { params });
      return data;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Failed to load orders'));
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrder',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}`, { status });
      toast.success('Order status updated');
      return data.order;
    } catch (error) {
      const message = getMessage(error, 'Failed to update order status');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/products');
      return data.products;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Failed to load products'));
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/products', productData);
      toast.success('Product created successfully');
      return data.product;
    } catch (error) {
      const message = getMessage(error, 'Product creation failed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, data: productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/products/${id}`, productData);
      toast.success('Product updated successfully');
      return data.product;
    } catch (error) {
      const message = getMessage(error, 'Product update failed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      toast.success('Product deleted');
      return productId;
    } catch (error) {
      const message = getMessage(error, 'Product deletion failed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users');
      return data.users;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Failed to load users'));
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  stats: null,
  orders: [],
  products: [],
  users: [],
  loading: false,
  error: null,
  totalOrders: 0,
  totalUsers: 0,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchDashboardStats.pending, setPending)
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, setRejected)

      .addCase(fetchAdminOrders.pending, setPending)
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.total;
      })
      .addCase(fetchAdminOrders.rejected, setRejected)

      .addCase(updateOrderStatus.pending, setPending)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(updateOrderStatus.rejected, setRejected)

      .addCase(fetchAdminProducts.pending, setPending)
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, setRejected)

      .addCase(createProduct.pending, setPending)
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, setRejected)

      .addCase(updateProduct.pending, setPending)
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateProduct.rejected, setRejected)

      .addCase(deleteProduct.pending, setPending)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, setRejected)

      .addCase(fetchAdminUsers.pending, setPending)
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.totalUsers = action.payload.length;
      })
      .addCase(fetchAdminUsers.rejected, setRejected);
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
