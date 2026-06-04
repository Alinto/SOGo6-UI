import dynamic from 'next/dynamic'
import { ComponentType, ReactElement } from 'react'
import { ComponentLoader } from './lazy-components'

/**
 * Next.js Dynamic Imports for Better Performance
 *
 * Next.js `dynamic()` provides better optimization than React.lazy()
 * for client-side code splitting and SSR compatibility.
 */

// Working examples with existing components
// export const DynamicButton = dynamic(
//   () =>
//     import('@/components/ui/button').then((mod) => ({ default: mod.Button })),
//   {
//     loading: () => <ComponentLoader />,
//     ssr: true,
//   }
// )

// export const DynamicCard = dynamic(
//   () => import('@/components/ui/card').then((mod) => ({ default: mod.Card })),
//   {
//     loading: () => <ComponentLoader />,
//     ssr: true,
//   }
// )

/**
 * Development Build Optimization Strategies:
 *
 * 1. Route-level splitting:
 * export default dynamic(() => import('./HeavyPage'), {
 *   loading: () => <PageLoader />,
 * })
 *
 * 2. Feature-based splitting:
 * const MailFeature = dynamic(() => import('@/features/mails'), {
 *   loading: () => <PageLoader />,
 * })
 *
 * 3. Component-level splitting:
 * const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
 *   loading: () => <ComponentLoader />,
 *   ssr: false, // For client-only components
 * })
 *
 * 4. Conditional loading:
 * const [showEditor, setShowEditor] = useState(false)
 * const Editor = dynamic(() => import('./Editor'), { ssr: false })
 *
 * {showEditor && <Editor />}
 *
 * 5. Third-party library splitting:
 * const Chart = dynamic(() => import('recharts'), { ssr: false })
 */

// Utility function for creating dynamic imports with default options
export function createDynamicComponent<P extends object = object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: () => ReactElement
    ssr?: boolean
  } = {}
): ComponentType<P> {
  const { loading = () => <ComponentLoader />, ssr = true } = options

  return dynamic(importFn, { loading, ssr }) as ComponentType<P>
}

// Example usage:
// export const MyLazyComponent = createDynamicComponent(
//   () => import('@/components/MyComponent'),
//   { ssr: false, loading: () => <FormLoader /> }
// )
