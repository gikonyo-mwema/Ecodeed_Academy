/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THEME REDUX SLICE - DARK MODE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages application theme state (light/dark mode) using Redux Toolkit.
 * 
 * State Structure:
 * {
 *   theme: 'light' | 'dark'  // Current active theme
 * }
 * 
 * Actions:
 * - toggleTheme()  - Switches between light and dark theme
 * 
 * Usage in Components:
 * import { useSelector, useDispatch } from 'react-redux';
 * import { toggleTheme } from '@/redux/theme/themeSlice';
 * 
 * const MyComponent = () => {
 *   const theme = useSelector(state => state.theme.theme);
 *   const dispatch = useDispatch();
 *   
 *   return (
 *     <button onClick={() => dispatch(toggleTheme())}>
 *       Current: {theme}
 *     </button>
 *   );
 * };
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {createSlice} from '@reduxjs/toolkit';

/**
 * Initial state for theme reducer
 * @type {Object}
 * @property {string} theme - The current theme ('light' or 'dark')
 */
const initialState = {
    theme: 'light',
};

/**
 * Redux slice for managing theme (light/dark mode) state
 * 
 * Features:
 * - Light theme as default
 * - Toggle between light and dark modes
 * - Persisted through Redux store
 * 
 * @type {Object}
 */
const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        /**
         * Toggles the current theme between light and dark
         * 
         * @param {Object} state - Current Redux state
         * @param {string} state.theme - Current theme value
         * 
         * @example
         * dispatch(toggleTheme());  // Changes light to dark or dark to light
         */
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
    },
});

/**
 * Action to toggle theme between light and dark
 * @type {Function}
 */
export const { toggleTheme } = themeSlice.actions;

/**
 * Theme reducer for Redux store
 * @type {Function}
 */
export default themeSlice.reducer;