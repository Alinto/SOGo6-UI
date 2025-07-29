import { ComponentType, lazy, ReactNode, Suspense } from 'react'

// Loading fallback components
export const ComponentLoader = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
  </div>
)

export const PageLoader = () => {
  const loadingText = 'Loading...'
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  )
}

export const FormLoader = () => (
  <div className="space-y-4">
    <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
    <div className="bg-muted h-10 animate-pulse rounded"></div>
    <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>
    <div className="bg-muted h-10 animate-pulse rounded"></div>
  </div>
)

export const TableLoader = () => (
  <div className="space-y-3">
    <div className="bg-muted h-8 animate-pulse rounded"></div>
    <div className="bg-muted h-4 animate-pulse rounded"></div>
    <div className="bg-muted h-4 animate-pulse rounded"></div>
    <div className="bg-muted h-4 animate-pulse rounded"></div>
  </div>
)

// Simple lazy wrapper for any component
export function LazyWrapper({
  children,
  fallback = <ComponentLoader />,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

// Simple utility to make any import lazy
export function createLazyImport(
  importFn: () => Promise<{ default: ComponentType }>,
  fallback: ReactNode = <ComponentLoader />
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: Record<string, unknown>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Usage Examples:
 *
 * 1. Basic lazy wrapper:
 * <LazyWrapper fallback={<FormLoader />}>
 *   <HeavyComponent />
 * </LazyWrapper>
 *
 * 2. Create lazy components:
 * const LazyDataTable = createLazyImport(
 *   () => import('@/components/ui/data-table'),
 *   <TableLoader />
 * )
 *
 * 3. Direct lazy imports in pages:
 * const HeavyFeature = lazy(() => import('@/features/heavy-feature'))
 *
 * function MyPage() {
 *   return (
 *     <Suspense fallback={<PageLoader />}>
 *       <HeavyFeature />
 *     </Suspense>
 *   )
 * }
 *
 * 4. Route-level splitting:
 * export default lazy(() => import('./HeavyPage'))
 */

// For development build optimization, consider:
// - Using dynamic imports in route components
// - Splitting large feature modules
// - Using React.memo for components that don't need frequent re-renders
// - Code-splitting at the page/route level with Next.js dynamic imports
