import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthContext } from '../types'
import Layout from '@/components/Layout'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})
