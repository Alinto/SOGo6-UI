Add a new RTK Query endpoint to the relevant feature api slice.

Follow the canonical pattern in @src/features/mails/store/mails-api.ts:

1. Define a URL builder function above `injectEndpoints`
2. Add the endpoint inside `apiSlice.injectEndpoints()`
3. Add `transformResponse` to unwrap `BackendResponse<T>` → typed frontend response
4. Add `providesTags` (query) or `invalidatesTags` + `createApiNotificationHandler` (mutation)
5. If new tag types are needed, add them to the `tagTypes` array in @src/lib/redux/api/api-slice.ts
6. Export the generated hook and URL builder function

Also update:
- The feature's `*-types.ts` file if new types are needed
- `src/messages/en/<feature>.json` if new notification strings are needed
