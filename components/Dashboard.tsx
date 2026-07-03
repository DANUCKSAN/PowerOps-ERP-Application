import ProductStats from "./ProductStats";

const Dashboard = () => {
  return (
    <section className="w-full p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Inventory Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of solar stock, batteries, inverters and installation materials.
        </p>
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
