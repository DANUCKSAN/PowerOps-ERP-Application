import { asc } from "drizzle-orm";

import { db } from "@/db";
import { suppliers, warehouses } from "@/db/schema";
import AddProductDialog from "./AddProductDialog";
import ProductStats from "./ProductStats";

const Dashboard = async () => {
  const [supplierRows, warehouseRows] = await Promise.all([
    db.select().from(suppliers).orderBy(asc(suppliers.name)),
    db.select().from(warehouses).orderBy(asc(warehouses.code)),
  ]);

  return (
    <section className="w-full p-5">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Inventory Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Overview of solar stock, batteries, inverters and installation
            materials.
          </p>
        </div>

        <AddProductDialog
          suppliers={supplierRows.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
          }))}
          warehouses={warehouseRows.map((warehouse) => ({
            id: warehouse.id,
            code: warehouse.code,
            name: warehouse.name,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ProductStats
          name="Solar Panels"
          category="Solar Panel"
          quantity={320}
          unit="units"
          status="In Stock"
          note="+12 received today"
        />

        <ProductStats
          name="Batteries"
          category="Battery"
          quantity={42}
          unit="units"
          status="Low Stock"
          note="Reorder soon"
        />

        <ProductStats
          name="Inverters"
          category="Inverter"
          quantity={85}
          unit="units"
          status="In Stock"
          note="+5 added this week"
        />

        <ProductStats
          name="EV Chargers"
          category="EV Charger"
          quantity={8}
          unit="units"
          status="Out of Stock"
          note="Waiting for supplier"
        />
      </div>
    </section>
  );
};

export default Dashboard;
