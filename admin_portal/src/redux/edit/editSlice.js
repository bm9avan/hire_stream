import { createSlice } from "@reduxjs/toolkit";

const editSlice = createSlice({
  name: "config",
  initialState: { cId: null, jId: null },
  reducers: {
    startEditingCompany(state, actions) {
      state.cId = actions.payload;
      state.jId = null;
    },
    endEditingCompany(state) {
      state.cId = null;
      state.jId = null;
    },
    startEditingJob(state, actions) {
      state.jId = actions.payload;
      state.cId = null;
    },
    endEditingJob(state) {
      state.jId = null;
      state.cId = null;
    },
  },
});

export const editActions = editSlice.actions;
export const editReducer = editSlice.reducer;
