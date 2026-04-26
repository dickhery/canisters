import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/Layout";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";

// Lazy-loaded pages
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const CanistersPage = lazy(() => import("@/pages/Canisters"));
const CanisterDetailPage = lazy(() => import("@/pages/CanisterDetail"));
const AccountPage = lazy(() => import("@/pages/Account"));

const PageLoader = () => (
  <div className="flex h-full items-center justify-center py-24">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Layout>
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const canistersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/canisters",
  component: CanistersPage,
});

const canisterDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/canisters/$canisterId",
  component: CanisterDetailPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: AccountPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  canistersRoute,
  canisterDetailRoute,
  accountRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
