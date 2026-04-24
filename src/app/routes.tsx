import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Storefront } from "./components/Storefront";
import { Checkout } from "./components/Checkout";
import { Success } from "./components/Success";

// 1. REMOVE the direct AdminDashboard import
// import { AdminDashboard } from "./components/AdminDashboard";

// 2. ADD the new secure AdminRoute import
import AdminRoute from "./components/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Storefront },
      { path: "checkout", Component: Checkout },
      { path: "success", Component: Success },
    ],
  },
  {
    path: "/admin",
    // 3. SWAP the component here to point to the secure wrapper
    Component: AdminRoute, 
  }
]);