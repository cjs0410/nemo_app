import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    scraps: [],
}

export const scrapSlice = createSlice({
    name: 'scraps',
    initialState,
    reducers: {
        loadScraps: (state, action) => {
            state.scraps = action.payload;
        },
        addScrap: (state, action) => {
            state.scraps = [...state.scraps, action.payload];
        },
        deleteScrap: (state, action) => {
            state.scraps = state.scraps.filter((scrap) => (
                scrap.post_id !== action.payload.post_id
            ))
        }
    }
})

export const {
    loadScraps, addScrap, deleteScrap,
} = scrapSlice.actions;

export default scrapSlice.reducer;