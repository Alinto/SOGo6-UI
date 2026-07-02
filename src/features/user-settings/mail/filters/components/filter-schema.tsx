import { createEmptyFilter } from '../mail-filters-utils'

export {
  createFiltersSchema,
  createSingleFilterSchema,
} from './filters-schema'
export type {
  FiltersFormValues,
  SingleFilterFormValues,
} from './filters-schema'

export const defaultFilterValues = createEmptyFilter()
