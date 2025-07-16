import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
    settings: boolean;
}

const initialState: SettingsState = {
    settings: false,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleSettings: (state) => {
            state.settings = !state.settings;
        },
    },
});

export const { toggleSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
