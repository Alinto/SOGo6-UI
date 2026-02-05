import { createSlice } from '@reduxjs/toolkit'
import type { UserPreferences } from './user-preferences-types'

interface UserPreferencesState {
  data: UserPreferences
}

const initialState: UserPreferencesState = {
  data: {} as UserPreferences,
}

const userPreferencesSlice = createSlice({
  name: 'UserPreferences',
  initialState,
  reducers: {},
})

export default userPreferencesSlice.reducer

// import { createSlice } from "@reduxjs/toolkit";
// import {
//   fetchPreferences,
//   updateGeneralPreferences,
//   updateCalendarPreferences,
//   updateAddressBookPreferences
// } from "./user-UserPreferences-api";

// const preferencesSlice = createSlice({
//   name: "UserPreferences",
//   initialState: {
//     data: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // GET
//       .addCase(fetchPreferences.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchPreferences.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload;
//       })
//       .addCase(fetchPreferences.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       })

//       // PATCH GENERAL
//       .addCase(updateGeneralPreferences.fulfilled, (state, action) => {
//         state.data.USER_GENERAL = action.payload;
//       })

//       // PATCH CALENDAR
//       .addCase(updateCalendarPreferences.fulfilled, (state, action) => {
//         state.data.USER_CALENDAR_GENERAL = action.payload;
//       })

//       // PATCH ADDRESS BOOK
//       .addCase(updateAddressBookPreferences.fulfilled, (state, action) => {
//         state.data.USER_CONTACT_GENERAL = action.payload;
//       });
//   },
// });

// export default preferencesSlice.reducer;

// // // permissionsSlice.js
// // import { createSlice } from "@reduxjs/toolkit";

// // const permissionsSlice = createSlice({
// //   name: "permissions",
// //   initialState: {
// //     list: [], // e.g. ["USER_READ", "USER_EDIT"]
// //     loaded: false
// //   },
// //   reducers: {
// //     setPermissions: (state, action) => {
// //       state.list = action.payload;
// //       state.loaded = true;
// //     },
// //     clearPermissions: (state) => {
// //       state.list = [];
// //       state.loaded = false;
// //     }
// //   }
// // });

// // export const { setPermissions, clearPermissions } = permissionsSlice.actions;
// // export default permissionsSlice.reducer;
