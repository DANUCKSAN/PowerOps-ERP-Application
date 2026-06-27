import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  FolderKanban,
  CreditCard,
  RotateCcw,
  BarChart3,
  Settings,
} from "lucide-react";

export const adminSidebarLinks = [
  {
    title: "MAIN",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "INVENTORY",
    items: [
      {
        title: "Inventory",
        href: "/inventory",
        icon: Boxes,
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
      },
      {
        title: "Warehouses",
        href: "/warehouses",
        icon: Warehouse,
      },
    ],
  },

  {
    title: "OPERATIONS",
    items: [
      {
        title: "Purchase Orders",
        href: "/purchase-orders",
        icon: ShoppingCart,
      },
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
    ],
  },

  {
    title: "FINANCE",
    items: [
      {
        title: "Payments",
        href: "/payments",
        icon: CreditCard,
      },
      {
        title: "Returns & Refunds",
        href: "/returns",
        icon: RotateCcw,
      },
    ],
  },

  {
    title: "SYSTEM",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export const dummyUser=[
    
]