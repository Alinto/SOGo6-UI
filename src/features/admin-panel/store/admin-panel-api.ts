import type {
  //AdminConfig,
  AdminConfigSection,
} from '@/features/admin-panel/types/admin-panel'
import {
  ADMIN_CONFIG_SLICE,
  ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_SLICE,
  ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE,
  ADMIN_V1_CONFIG_RULES_SLICE,
  ADMIN_V1_CONFIG_SYSTEM_SLICE,
  apiSlice,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { Rule } from '../types/admin-panel'

export type DomainItem = {
  name: string
  extra_infos?: Record<string, string>
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getSystem: builder.query<string[], void>({
      query: () => ({
        url: '/admin/v1/config/system',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_SYSTEM_SLICE],
    }),
    getDomains: builder.query<DomainItem[], void>({
      query: () => ({
        url: '/admin/v1/config/domains',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DOMAINS_SLICE],
    }),
    getRules: builder.query<Rule[], void>({
      query: () => ({
        url: '/admin/v1/config/rules',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_RULES_SLICE],
    }),
    getDynamicForm: builder.query<string[], void>({
      query: () => ({
        url: '/admin/v1/config/dynamic-form',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE],
    }),
    // New: fetch domain default settings
    getDomainDefault: builder.query<Record<string, any>, void>({
      query: () => ({
        url: '/admin/v1/config/domain-default',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE],
    }),
    getCustomDomainConfig: builder.query<AdminConfigSection, string>({
      query: (domainName) => ({
        url: `/admin/v1/config/domains/${domainName}`,
        method: 'GET',
      }),
      providesTags: (result, error, domainName) => [
        ADMIN_CONFIG_SLICE,
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE, id: domainName },
      ],
    }),
    saveCustomDomainConfig: builder.mutation<
      Record<string, unknown>,
      { customDomainId: string; config: Record<string, unknown> }
    >({
      query: ({ config }) => ({
        url: `/admin/v1/config/domains`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
      ],
    }),

    // PATCH for domain-default
    patchDomainDefault: builder.mutation<
      Record<string, unknown>,
      { config: Record<string, unknown> }
    >({
      query: ({ config }) => ({
        url: `/admin/v1/config/domain-default`,
        method: 'PATCH',
        body: { settings: config },
      }),
      // you can invalidate specific tags if needed — here we invalidate domain config tag
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
        ADMIN_CONFIG_SLICE,
        ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE,
      ],
    }),

    // PATCH for a specific custom domain
    patchCustomDomainConfig: builder.mutation<
      Record<string, unknown>,
      { customDomainId: string; config: Record<string, unknown> }
    >({
      query: ({ customDomainId, config }) => ({
        url: `/admin/v1/config/domains/${customDomainId}`,
        method: 'PATCH',
        body: config,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE, id: arg?.customDomainId },
        ADMIN_CONFIG_SLICE,
      ],
    }),

    // DELETE domain mutation
    deleteDomain: builder.mutation<Record<string, unknown>, string>({
      query: (domainName) => ({
        url: `/admin/v1/config/domains/${domainName}`,
        method: 'DELETE',
      }),
      // invalidate domains list so getDomains refetches
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
      ],
    }),
    getCustomDomainConfig: builder.query<AdminConfig, string>({
      query: (customDomainId) => ({
        url: `/adminConfig/domain/${customDomainId}`,
        method: 'GET',
      }),
      providesTags: (result, error, customDomainId) => [
        { type: 'adminConfig/domain', id: customDomainId },
      ],
    }),
    saveCustomDomainConfig: builder.mutation<
      Record<string, any>, // <-- type de retour de l'api, à changer quand on aura la vrai api
      { customDomainId: string; config: Record<string, any> }
    >({
      query: ({ customDomainId, config }) => ({
        url: `/adminConfig/domain/${customDomainId}`, //url de l'api à changer quan disponible
        method: 'POST',
        body: config,
      }),
      invalidatesTags: (result, error, { customDomainId }) => [
        { type: 'adminConfig/domain', id: customDomainId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSystemQuery,
  useGetDomainsQuery,
  useGetRulesQuery,
  useGetDynamicFormQuery,
  useGetDomainDefaultQuery,
  useGetCustomDomainConfigQuery,
  useSaveCustomDomainConfigMutation,
  usePatchDomainDefaultMutation,
  usePatchCustomDomainConfigMutation,
  useDeleteDomainMutation,
} = injectedEndpoints
