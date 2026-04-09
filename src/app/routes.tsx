import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Storefront } from "./components/Storefront";
import { Checkout } from "./components/Checkout";
import { Success } from "./components/Success";
import { AdminDashboard } from "./components/AdminDashboard";

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
    Component: AdminDashboard,
  }
]);
