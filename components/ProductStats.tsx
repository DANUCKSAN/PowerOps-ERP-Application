interface ProductCardProps {
  name: string;
  category:
    | "Solar Panel"
    | "Battery"
    | "Inverter"
    | "Mounting"
    | "Cable"
    | "EV Charger";
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  note: string;
}

const statusStyles: Record<ProductCardProps["status"], string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const ProductStats = ({
  name,
  category,
  quantity,
  unit,
  status,
  note,
}: ProductCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{category}</p>
          <h4 className="mt-1 text-lg font-semibold text-foreground">
            {name}
          </h4>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-5">
        <h2 className="text-3xl font-bold text-foreground">
          {quantity}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </div>
    </div>
  );
};

export default ProductStats;