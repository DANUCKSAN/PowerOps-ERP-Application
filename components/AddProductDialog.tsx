"use client";

import { useActionState, useState } from "react";
import { PackagePlus } from "lucide-react";

import {
  createProductAction,
  type CreateProductState,
} from "@/app/(root)/products/action";
import { productCategoryLabels, type ProductCategory } from "@/lib/inventory-display";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AddProductDialogProps = {
  suppliers: { id: string; name: string }[];
  warehouses: { id: string; code: string; name: string }[];
};

const initialState: CreateProductState = {
  ok: false,
  message: "",
};

const productCategoryOptions = Object.entries(productCategoryLabels) as [
  ProductCategory,
  string,
][];

const AddProductDialog = ({ suppliers, warehouses }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-10 gap-2">
          <PackagePlus className="size-4" />
          Add product
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            Create a product catalog record with validation. Optional starting
            stock can be added to a warehouse at the same time.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="add-product-form">
          <div className="add-product-section">
            <h3>Product identity</h3>
            <div className="add-product-grid">
              <div className="add-product-field">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="EA-SP-ABC-500" required />
              </div>

              <div className="add-product-field">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sungrow 5kW Hybrid Inverter"
                  required
                />
              </div>

              <div className="add-product-field">
                <Label htmlFor="category">Category</Label>
                <select id="category" name="category" required>
                  {productCategoryOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-product-field">
                <Label htmlFor="supplierId">Supplier</Label>
                <select id="supplierId" name="supplierId" defaultValue="">
                  <option value="">No supplier selected</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-product-field">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" placeholder="Sungrow" required />
              </div>

              <div className="add-product-field">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" placeholder="SH5.0RS" required />
              </div>
            </div>
          </div>

          <div className="add-product-section">
            <h3>Stock and commercial</h3>
            <div className="add-product-grid">
              <div className="add-product-field">
                <Label htmlFor="unitOfMeasure">Unit</Label>
                <Input id="unitOfMeasure" name="unitOfMeasure" defaultValue="unit" />
              </div>

              <div className="add-product-field">
                <Label htmlFor="averageCost">Average cost</Label>
                <Input
                  id="averageCost"
                  name="averageCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="add-product-field">
                <Label htmlFor="reorderPoint">Reorder point</Label>
                <Input id="reorderPoint" name="reorderPoint" type="number" min="0" />
              </div>

              <div className="add-product-field">
                <Label htmlFor="preferredStockLevel">Preferred stock</Label>
                <Input
                  id="preferredStockLevel"
                  name="preferredStockLevel"
                  type="number"
                  min="0"
                />
              </div>

              <div className="add-product-field">
                <Label htmlFor="initialQuantity">Initial quantity</Label>
                <Input
                  id="initialQuantity"
                  name="initialQuantity"
                  type="number"
                  min="0"
                />
              </div>

              <div className="add-product-field">
                <Label htmlFor="warehouseId">Initial warehouse</Label>
                <select id="warehouseId" name="warehouseId" defaultValue="">
                  <option value="">Default main warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="add-product-section">
            <h3>Technical details</h3>
            <div className="add-product-grid">
              <div className="add-product-field">
                <Label htmlFor="powerRatingW">Power rating W</Label>
                <Input id="powerRatingW" name="powerRatingW" type="number" min="0" />
              </div>

              <div className="add-product-field">
                <Label htmlFor="capacityKwh">Capacity kWh</Label>
                <Input
                  id="capacityKwh"
                  name="capacityKwh"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="add-product-field">
                <Label htmlFor="phase">Phase</Label>
                <Input id="phase" name="phase" placeholder="Single phase" />
              </div>

              <div className="add-product-field">
                <Label htmlFor="voltage">Voltage</Label>
                <Input id="voltage" name="voltage" placeholder="240V AC" />
              </div>

              <div className="add-product-field">
                <Label htmlFor="warrantyYears">Warranty years</Label>
                <Input
                  id="warrantyYears"
                  name="warrantyYears"
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </div>

          {state.message && (
            <p
              className={
                state.ok ? "add-product-message-success" : "add-product-message"
              }
            >
              {state.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
