"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { inventoryStock, products, warehouses } from "@/db/schema";

export type CreateProductState = {
  ok: boolean;
  message: string;
};

const canManageProducts = new Set(["ADMIN", "WAREHOUSE_MANAGER"]);

const createProductSchema = z.object({
  sku: z.string().trim().min(3, "SKU must be at least 3 characters."),
  name: z.string().trim().min(2, "Product name is required."),
  category: z.enum([
    "SOLAR_PANEL",
    "BATTERY",
    "INVERTER",
    "EV_CHARGER",
    "HEAT_PUMP",
    "MOUNTING",
    "CABLE",
    "ACCESSORY",
  ]),
  brand: z.string().trim().min(2, "Brand is required."),
  model: z.string().trim().min(1, "Model is required."),
  supplierId: z.string().trim().optional(),
  unitOfMeasure: z.string().trim().min(1, "Unit is required."),
  averageCost: z.coerce.number().min(0, "Average cost cannot be negative."),
  reorderPoint: z.coerce.number().int().min(0),
  preferredStockLevel: z.coerce.number().int().min(0),
  initialQuantity: z.coerce.number().int().min(0),
  warehouseId: z.string().trim().optional(),
  powerRatingW: z.coerce.number().int().min(0).optional(),
  capacityKwh: z.coerce.number().min(0).optional(),
  phase: z.string().trim().optional(),
  voltage: z.string().trim().optional(),
  warrantyYears: z.coerce.number().int().min(0).optional(),
});

const getOptionalString = (value: FormDataEntryValue | null) => {
  const text = value?.toString().trim();
  return text ? text : undefined;
};

const getOptionalNumber = (value: number | undefined) =>
  value && value > 0 ? value : undefined;

const requireManageProductsAccess = async () => {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!role || !canManageProducts.has(role)) {
    throw new Error("Only admins and warehouse managers can add products.");
  }
};

export const getProducts = async () => {
  return db.select().from(products);
};

export const createProductAction = async (
  _prevState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> => {
  try {
    await requireManageProductsAccess();

    const parsed = createProductSchema.parse({
      sku: formData.get("sku"),
      name: formData.get("name"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      supplierId: getOptionalString(formData.get("supplierId")),
      unitOfMeasure: formData.get("unitOfMeasure") || "unit",
      averageCost: formData.get("averageCost") || 0,
      reorderPoint: formData.get("reorderPoint") || 0,
      preferredStockLevel: formData.get("preferredStockLevel") || 0,
      initialQuantity: formData.get("initialQuantity") || 0,
      warehouseId: getOptionalString(formData.get("warehouseId")),
      powerRatingW: getOptionalString(formData.get("powerRatingW")),
      capacityKwh: getOptionalString(formData.get("capacityKwh")),
      phase: getOptionalString(formData.get("phase")),
      voltage: getOptionalString(formData.get("voltage")),
      warrantyYears: getOptionalString(formData.get("warrantyYears")),
    });

    const existingProduct = await db.query.products.findFirst({
      where: eq(products.sku, parsed.sku),
    });

    if (existingProduct) {
      return {
        ok: false,
        message: `A product with SKU ${parsed.sku} already exists.`,
      };
    }

    const productId = randomUUID();

    await db.insert(products).values({
      id: productId,
      sku: parsed.sku,
      name: parsed.name,
      category: parsed.category,
      brand: parsed.brand,
      model: parsed.model,
      supplierId: parsed.supplierId,
      unitOfMeasure: parsed.unitOfMeasure,
      averageCost: parsed.averageCost.toFixed(2),
      reorderPoint: parsed.reorderPoint,
      preferredStockLevel: parsed.preferredStockLevel,
      powerRatingW: getOptionalNumber(parsed.powerRatingW),
      capacityKwh: getOptionalNumber(parsed.capacityKwh)?.toFixed(2),
      phase: parsed.phase,
      voltage: parsed.voltage,
      warrantyYears: getOptionalNumber(parsed.warrantyYears),
      isSerialTracked: [
        "BATTERY",
        "INVERTER",
        "EV_CHARGER",
        "HEAT_PUMP",
      ].includes(parsed.category),
    });

    if (parsed.initialQuantity > 0) {
      const warehouseId =
        parsed.warehouseId ??
        (
          await db.query.warehouses.findFirst({
            where: eq(warehouses.type, "MAIN"),
          })
        )?.id;

      if (warehouseId) {
        await db.insert(inventoryStock).values({
          id: randomUUID(),
          productId,
          warehouseId,
          quantityOnHand: parsed.initialQuantity,
          quantityReserved: 0,
          binLocation: "NEW-STOCK",
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath("/inventory");

    return {
      ok: true,
      message: `${parsed.name} was added successfully.`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Please check the product form.",
      };
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the product.",
    };
  }
};
