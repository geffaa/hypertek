import { createSlice } from "@reduxjs/toolkit";

// Try to load saved state from localStorage
const savedAuth = localStorage.getItem("auth")
  ? JSON.parse(localStorage.getItem("auth"))
  : null;

const initialState = savedAuth || {
  user: null,
  token: null,
  isLoggedInUser: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedInUser = true; // ✅ consistent

      // Save to localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: state.user, token: state.token, isLoggedInUser: true })
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedInUser = false; // ✅ consistent

      // Remove from localStorage
      localStorage.removeItem("auth");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
