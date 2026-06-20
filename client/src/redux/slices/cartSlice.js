import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/cart');
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load cart'));
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      toast.success('Added to cart');
      return data.cart;
    } catch (error) {
      const message = getErrorMessage(error, 'Could not add item to cart');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      return data.cart;
    } catch (error) {
      const message = getErrorMessage(error, 'Could not update item');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      toast.success('Removed from cart');
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not remove item'));
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart/clear');
      return { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not clear cart'));
    }
  }
);

const initialState = {
  cart: { items: [], totalItems: 0, totalPrice: 0 },
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.cart = { items: [], totalItems: 0, totalPrice: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('cart/') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('cart/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
