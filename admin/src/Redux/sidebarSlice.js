// redux/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    refreshCategories: false, // toggle to trigger re-fetch
  },
  reducers: {
    triggerCategoryRefresh: (state) => {
      state.refreshCategories = !state.refreshCategories;
    },
  },
});

export const { triggerCategoryRefresh } = sidebarSlice.actions;
export default sidebarSlice.reducer;
