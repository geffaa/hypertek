// redux/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admin: null,
    isLoggedIn: false,
  },
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isLoggedIn = true;
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
