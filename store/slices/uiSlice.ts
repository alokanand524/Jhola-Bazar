import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isTabBarVisible: boolean;
}

const initialState: UIState = {
  isTabBarVisible: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    hideTabBar: (state) => {
      state.isTabBarVisible = false;
    },
    showTabBar: (state) => {
      state.isTabBarVisible = true;
    },
  },
});

export const { hideTabBar, showTabBar } = uiSlice.actions;
export default uiSlice.reducer;