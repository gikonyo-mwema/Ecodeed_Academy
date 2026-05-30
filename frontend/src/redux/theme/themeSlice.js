/**
 * Theme Redux Slice — Light/dark mode state management.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Manages global UI theme preference (light/dark mode). Integrated with Redux store
 * and persisted via Redux Persist for user preference preservation.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE SHAPE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * {
 *   theme: 'light' | 'dark'
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * toggleTheme: Switches theme between 'light' and 'dark'
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * import { useDispatch, useSelector } from 'react-redux';
 * import { toggleTheme } from '@/redux/theme/themeSlice';
 *
 * function ThemeToggle() {
 *   const dispatch = useDispatch();
 *   const theme = useSelector(state => state.theme.theme);
 *
 *   return (
 *     <button onClick={() => dispatch(toggleTheme())}>
 *       {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
 *     </button>
 *   );
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TAILWIND CSS INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Apply theme to HTML root element:
 *   <html className={theme === 'dark' ? 'dark' : ''}>
 *
 * Components automatically support:
 *   dark:bg-gray-900
 *   dark:text-white
 *   etc.
 *
 * @module ThemeSlice
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        /**
         * Toggle theme between 'light' and 'dark'
         * @param {object} state - Current theme state
         */
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
}
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;