import { JOBS_SLICE, apiSlice } from '@/lib/redux/api/api-slice'
import type {
  ApiJobResponse,
  JobState,
} from '../jobs-api-types'
import { unwrapJobState } from '../utils/unwrap-job-data'

export interface JobResultBlob {
  blob: Blob
  contentType: string | null
  contentDisposition: string | null
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJob: builder.query<JobState, string>({
      query: (jobId) => `jobs/${encodeURIComponent(jobId)}`,
      transformResponse: (response: ApiJobResponse) => unwrapJobState(response),
      providesTags: (_result, _error, jobId) => [
        { type: JOBS_SLICE, id: jobId },
      ],
    }),
    cancelJob: builder.mutation<JobState, string>({
      query: (jobId) => ({
        url: `jobs/${encodeURIComponent(jobId)}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response: ApiJobResponse) => unwrapJobState(response),
      invalidatesTags: (_result, _error, jobId) => [
        { type: JOBS_SLICE, id: jobId },
      ],
    }),
    getJobResult: builder.query<
      JobResultBlob,
      { jobId: string; download?: boolean }
    >({
      query: ({ jobId, download }) => ({
        url: `jobs/${encodeURIComponent(jobId)}/result`,
        params: download ? { download: true } : undefined,
        responseHandler: async (response) => {
          const blob = await response.blob()
          return {
            blob,
            contentType: response.headers.get('content-type'),
            contentDisposition: response.headers.get('content-disposition'),
          } satisfies JobResultBlob
        },
      }),
    }),
  }),
})

export const {
  useGetJobQuery,
  useLazyGetJobQuery,
  useCancelJobMutation,
  useLazyGetJobResultQuery,
} = injectedEndpoints

export const jobsApiEndpoints = injectedEndpoints.endpoints
