import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "./index";
import {
  inventoryStock,
  products,
  purchaseOrderItems,
  purchaseOrders,
  stockMovements,
  suppliers,
  users,
  warehouses,
} from "./schema";

type NewProduct = typeof products.$inferInsert;

const ids = {
  users: {
    admin: "user_admin_powerops",
    warehouseManager: "user_warehouse_manager",
    warehouseStaff: "user_warehouse_staff",
  },
  suppliers: {
    solarDistribution: "supplier_solar_distribution",
    batteryEnergy: "supplier_battery_energy",
    evWholesale: "supplier_ev_wholesale",
    electricalTrade: "supplier_electrical_trade",
  },
  warehouses: {
    smithfield: "warehouse_smithfield_main",
    installVanOne: "warehouse_install_van_01",
    siteHolding: "warehouse_project_site_holding",
  },
  purchaseOrders: {
    q3Solar: "po_2026_0001",
    batteryRestock: "po_2026_0002",
  },
};

const productSeed: NewProduct[] = [
  {
    id: "prod_trina_vertex_s_440w",
    sku: "EA-SP-TRI-440-BF",
    name: "Trina Vertex S+ 440W Dual Glass Solar Panel",
    category: "SOLAR_PANEL",
    brand: "Trina Solar",
    model: "Vertex S+ TSM-440NEG9R.25",
    description:
      "N-type dual glass panel commonly used for residential rooftop systems.",
    supplierId: ids.suppliers.solarDistribution,
    unitOfMeasure: "panel",
    reorderPoint: 80,
    preferredStockLevel: 240,
    averageCost: "148.00",
    powerRatingW: 440,
    warrantyYears: 25,
    panelCellType: "N-type TOPCon",
    dimensionsMm: "1762 x 1134 x 30",
    weightKg: "21.00",
  },
  {
    id: "prod_jinko_tiger_neo_475w",
    sku: "EA-SP-JIN-475-N",
    name: "Jinko Tiger Neo 475W Solar Panel",
    category: "SOLAR_PANEL",
    brand: "Jinko Solar",
    model: "Tiger Neo JKM475N",
    description:
      "High-output N-type solar panel suited to residential and small commercial installs.",
    supplierId: ids.suppliers.solarDistribution,
    unitOfMeasure: "panel",
    reorderPoint: 60,
    preferredStockLevel: 180,
    averageCost: "156.50",
    powerRatingW: 475,
    warrantyYears: 25,
    panelCellType: "N-type mono",
    dimensionsMm: "1903 x 1134 x 30",
    weightKg: "24.20",
  },
  {
    id: "prod_sungrow_sbr096",
    sku: "EA-BAT-SUN-SBR096",
    name: "Sungrow SBR096 Battery Module Stack",
    category: "BATTERY",
    brand: "Sungrow",
    model: "SBR096",
    description:
      "9.6kWh modular high-voltage battery stack for hybrid solar systems.",
    supplierId: ids.suppliers.batteryEnergy,
    unitOfMeasure: "stack",
    reorderPoint: 8,
    preferredStockLevel: 24,
    averageCost: "5150.00",
    capacityKwh: "9.60",
    voltage: "High voltage",
    warrantyYears: 10,
    batteryChemistry: "Lithium iron phosphate",
    ipRating: "IP55",
    weightKg: "114.00",
    isSerialTracked: true,
  },
  {
    id: "prod_tesla_powerwall_3",
    sku: "EA-BAT-TES-PW3",
    name: "Tesla Powerwall 3",
    category: "BATTERY",
    brand: "Tesla",
    model: "Powerwall 3",
    description:
      "Residential battery with integrated solar inverter for backup and self-consumption.",
    supplierId: ids.suppliers.batteryEnergy,
    unitOfMeasure: "unit",
    reorderPoint: 4,
    preferredStockLevel: 12,
    averageCost: "10950.00",
    capacityKwh: "13.50",
    powerRatingW: 11500,
    phase: "Single phase",
    warrantyYears: 10,
    batteryChemistry: "Lithium iron phosphate",
    ipRating: "IP67",
    weightKg: "130.00",
    isSerialTracked: true,
  },
  {
    id: "prod_sungrow_sh5rs",
    sku: "EA-INV-SUN-SH5RS",
    name: "Sungrow 5kW Hybrid Single Phase Inverter",
    category: "INVERTER",
    brand: "Sungrow",
    model: "SH5.0RS",
    description:
      "Hybrid inverter for residential solar and battery installations.",
    supplierId: ids.suppliers.batteryEnergy,
    unitOfMeasure: "unit",
    reorderPoint: 10,
    preferredStockLevel: 32,
    averageCost: "1420.00",
    powerRatingW: 5000,
    phase: "Single phase",
    warrantyYears: 10,
    inverterType: "Hybrid",
    ipRating: "IP65",
    weightKg: "21.00",
    isSerialTracked: true,
  },
  {
    id: "prod_fronius_primo_8_2",
    sku: "EA-INV-FRO-PRIMO82",
    name: "Fronius Primo 8.2kW Single Phase Inverter",
    category: "INVERTER",
    brand: "Fronius",
    model: "Primo 8.2-1",
    description:
      "Premium string inverter for larger residential rooftop systems.",
    supplierId: ids.suppliers.solarDistribution,
    unitOfMeasure: "unit",
    reorderPoint: 5,
    preferredStockLevel: 16,
    averageCost: "2240.00",
    powerRatingW: 8200,
    phase: "Single phase",
    warrantyYears: 10,
    inverterType: "String",
    ipRating: "IP65",
    weightKg: "21.50",
    isSerialTracked: true,
  },
  {
    id: "prod_tesla_wall_connector",
    sku: "EA-EVC-TES-WCGEN3",
    name: "Tesla Wall Connector Gen 3",
    category: "EV_CHARGER",
    brand: "Tesla",
    model: "Wall Connector Gen 3",
    description: "Wall-mounted EV charger for residential and fleet charging.",
    supplierId: ids.suppliers.evWholesale,
    unitOfMeasure: "unit",
    reorderPoint: 6,
    preferredStockLevel: 18,
    averageCost: "720.00",
    powerRatingW: 22000,
    phase: "Single or three phase",
    currentAmp: "32.00",
    warrantyYears: 4,
    evConnectorType: "Type 2",
    ipRating: "IP55",
    isSerialTracked: true,
  },
  {
    id: "prod_zappi_7kw_type2",
    sku: "EA-EVC-MYE-ZAPPI7",
    name: "myenergi zappi 7kW Type 2 EV Charger",
    category: "EV_CHARGER",
    brand: "myenergi",
    model: "zappi 7kW Type 2",
    description:
      "Solar-aware EV charger for homes with rooftop solar generation.",
    supplierId: ids.suppliers.evWholesale,
    unitOfMeasure: "unit",
    reorderPoint: 5,
    preferredStockLevel: 15,
    averageCost: "1180.00",
    powerRatingW: 7000,
    phase: "Single phase",
    currentAmp: "32.00",
    warrantyYears: 3,
    evConnectorType: "Type 2 tethered",
    ipRating: "IP65",
    isSerialTracked: true,
  },
  {
    id: "prod_reclaim_co2_315l",
    sku: "EA-HP-REC-315CO2",
    name: "Reclaim Energy CO2 Heat Pump 315L",
    category: "HEAT_PUMP",
    brand: "Reclaim Energy",
    model: "CO2 315L",
    description:
      "Efficient heat pump hot water system for residential electrification upgrades.",
    supplierId: ids.suppliers.electricalTrade,
    unitOfMeasure: "system",
    reorderPoint: 3,
    preferredStockLevel: 9,
    averageCost: "3890.00",
    heatPumpTankLitres: 315,
    warrantyYears: 6,
    ipRating: "IP24",
    weightKg: "102.00",
    isSerialTracked: true,
  },
  {
    id: "prod_clenergy_rail_4400",
    sku: "EA-MNT-CLE-RAIL4400",
    name: "Clenergy PV-ezRack Solar Rail 4400mm",
    category: "MOUNTING",
    brand: "Clenergy",
    model: "ER-R-ECO/4400",
    description:
      "Aluminium mounting rail used for pitched roof solar installations.",
    supplierId: ids.suppliers.electricalTrade,
    unitOfMeasure: "rail",
    reorderPoint: 120,
    preferredStockLevel: 360,
    averageCost: "31.80",
    dimensionsMm: "4400",
    weightKg: "2.90",
  },
  {
    id: "prod_dc_solar_cable_6mm",
    sku: "EA-CAB-DC-6MM-RED",
    name: "6mm2 Solar DC Cable Red",
    category: "CABLE",
    brand: "Prysmian",
    model: "PV1-F 6mm2 Red",
    description:
      "UV-resistant solar DC cable for rooftop array string wiring.",
    supplierId: ids.suppliers.electricalTrade,
    unitOfMeasure: "metre",
    reorderPoint: 500,
    preferredStockLevel: 1800,
    averageCost: "1.85",
    voltage: "1500V DC",
    cableCoreSizeMm: "6.00",
  },
  {
    id: "prod_ac_isolator_32a",
    sku: "EA-ACC-ISO-32A",
    name: "32A AC Solar Isolator IP66",
    category: "ACCESSORY",
    brand: "NHP",
    model: "ISO32A-IP66",
    description:
      "Weatherproof AC isolator used in solar inverter installations.",
    supplierId: ids.suppliers.electricalTrade,
    unitOfMeasure: "unit",
    reorderPoint: 40,
    preferredStockLevel: 120,
    averageCost: "24.50",
    currentAmp: "32.00",
    voltage: "240V AC",
    ipRating: "IP66",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 10);

  await db
    .insert(users)
    .values([
      {
        id: ids.users.admin,
        name: "PowerOps Admin",
        username: "admin",
        email: "admin@powerops.com",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      {
        id: ids.users.warehouseManager,
        name: "Smithfield Warehouse Manager",
        username: "warehouse.manager",
        email: "warehouse.manager@powerops.local",
        passwordHash,
        role: "WAREHOUSE_MANAGER",
        status: "ACTIVE",
      },
      {
        id: ids.users.warehouseStaff,
        name: "Warehouse Team Member",
        username: "warehouse.staff",
        email: "warehouse.staff@powerops.local",
        passwordHash,
        role: "WAREHOUSE_STAFF",
        status: "ACTIVE",
      },
    ])
    .onConflictDoNothing();

  const adminUser = await db.query.users.findFirst({
    where: eq(users.username, "admin"),
  });

  if (!adminUser) {
    throw new Error("Admin user could not be found after seeding users.");
  }

  await db
    .insert(suppliers)
    .values([
      {
        id: ids.suppliers.solarDistribution,
        name: "Solar Distribution Australia",
        contactName: "Trade Sales",
        email: "trade@solardistribution.example",
        phone: "02 9000 1100",
        website: "https://www.solardistribution.example",
        suburb: "Wetherill Park",
        state: "NSW",
        postcode: "2164",
      },
      {
        id: ids.suppliers.batteryEnergy,
        name: "Battery Energy Wholesale",
        contactName: "Account Management",
        email: "orders@batteryenergy.example",
        phone: "02 9000 2200",
        website: "https://www.batteryenergy.example",
        suburb: "Silverwater",
        state: "NSW",
        postcode: "2128",
      },
      {
        id: ids.suppliers.evWholesale,
        name: "EV Charging Wholesale",
        contactName: "EV Trade Desk",
        email: "sales@evchargingwholesale.example",
        phone: "02 9000 3300",
        website: "https://www.evchargingwholesale.example",
        suburb: "Alexandria",
        state: "NSW",
        postcode: "2015",
      },
      {
        id: ids.suppliers.electricalTrade,
        name: "Electrical Trade Supplies NSW",
        contactName: "Electrical Counter",
        email: "smithfield@electricaltrade.example",
        phone: "02 9000 4400",
        website: "https://www.electricaltrade.example",
        suburb: "Smithfield",
        state: "NSW",
        postcode: "2164",
      },
    ])
    .onConflictDoNothing();

  await db.insert(products).values(productSeed).onConflictDoNothing();

  await db
    .insert(warehouses)
    .values([
      {
        id: ids.warehouses.smithfield,
        code: "SMF-MAIN",
        name: "Smithfield Main Warehouse",
        type: "MAIN",
        addressLine1: "142 Gipps Road",
        suburb: "Smithfield",
        state: "NSW",
        postcode: "2164",
        managerUserId: ids.users.warehouseManager,
      },
      {
        id: ids.warehouses.installVanOne,
        code: "VAN-01",
        name: "Installation Van 01",
        type: "SERVICE_VAN",
        suburb: "Smithfield",
        state: "NSW",
        postcode: "2164",
        managerUserId: ids.users.warehouseStaff,
      },
      {
        id: ids.warehouses.siteHolding,
        code: "SITE-HOLD",
        name: "Project Site Holding",
        type: "PROJECT_SITE",
        suburb: "Greater Sydney",
        state: "NSW",
        managerUserId: ids.users.warehouseManager,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(inventoryStock)
    .values([
      {
        id: "stock_trina_smithfield",
        productId: "prod_trina_vertex_s_440w",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 186,
        quantityReserved: 44,
        binLocation: "A1-PANEL-RACK",
      },
      {
        id: "stock_jinko_smithfield",
        productId: "prod_jinko_tiger_neo_475w",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 94,
        quantityReserved: 18,
        binLocation: "A2-PANEL-RACK",
      },
      {
        id: "stock_sungrow_battery_smithfield",
        productId: "prod_sungrow_sbr096",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 17,
        quantityReserved: 6,
        binLocation: "B1-BATTERY",
      },
      {
        id: "stock_powerwall_smithfield",
        productId: "prod_tesla_powerwall_3",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 5,
        quantityReserved: 3,
        binLocation: "B2-BATTERY",
      },
      {
        id: "stock_sungrow_inv_smithfield",
        productId: "prod_sungrow_sh5rs",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 23,
        quantityReserved: 8,
        binLocation: "C1-INVERTER",
      },
      {
        id: "stock_fronius_smithfield",
        productId: "prod_fronius_primo_8_2",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 9,
        quantityReserved: 2,
        binLocation: "C2-INVERTER",
      },
      {
        id: "stock_tesla_wc_smithfield",
        productId: "prod_tesla_wall_connector",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 14,
        quantityReserved: 4,
        binLocation: "D1-EV",
      },
      {
        id: "stock_zappi_smithfield",
        productId: "prod_zappi_7kw_type2",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 7,
        quantityReserved: 2,
        binLocation: "D2-EV",
      },
      {
        id: "stock_heatpump_smithfield",
        productId: "prod_reclaim_co2_315l",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 4,
        quantityReserved: 1,
        binLocation: "E1-HEATPUMP",
      },
      {
        id: "stock_rail_smithfield",
        productId: "prod_clenergy_rail_4400",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 282,
        quantityReserved: 74,
        binLocation: "M1-RAILS",
      },
      {
        id: "stock_cable_smithfield",
        productId: "prod_dc_solar_cable_6mm",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 1260,
        quantityReserved: 340,
        binLocation: "K1-CABLE",
      },
      {
        id: "stock_isolator_smithfield",
        productId: "prod_ac_isolator_32a",
        warehouseId: ids.warehouses.smithfield,
        quantityOnHand: 86,
        quantityReserved: 22,
        binLocation: "K4-ISOLATORS",
      },
      {
        id: "stock_trina_van_01",
        productId: "prod_trina_vertex_s_440w",
        warehouseId: ids.warehouses.installVanOne,
        quantityOnHand: 18,
        quantityReserved: 18,
        binLocation: "VAN-RACK",
      },
      {
        id: "stock_sungrow_inv_van_01",
        productId: "prod_sungrow_sh5rs",
        warehouseId: ids.warehouses.installVanOne,
        quantityOnHand: 1,
        quantityReserved: 1,
        binLocation: "VAN-SHELF",
      },
      {
        id: "stock_rail_van_01",
        productId: "prod_clenergy_rail_4400",
        warehouseId: ids.warehouses.installVanOne,
        quantityOnHand: 24,
        quantityReserved: 24,
        binLocation: "VAN-ROOF",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(stockMovements)
    .values([
      {
        id: "move_2026_0001",
        productId: "prod_trina_vertex_s_440w",
        warehouseId: ids.warehouses.smithfield,
        movementType: "PURCHASE_RECEIVED",
        quantity: 120,
        reference: "PO-2026-0001",
        notes: "Panels received for July residential installs.",
        performedByUserId: adminUser.id,
      },
      {
        id: "move_2026_0002",
        productId: "prod_sungrow_sbr096",
        warehouseId: ids.warehouses.smithfield,
        movementType: "PURCHASE_RECEIVED",
        quantity: 12,
        reference: "PO-2026-0002",
        notes: "Battery restock for hybrid system pipeline.",
        performedByUserId: adminUser.id,
      },
      {
        id: "move_2026_0003",
        productId: "prod_clenergy_rail_4400",
        warehouseId: ids.warehouses.installVanOne,
        movementType: "TRANSFER_IN",
        quantity: 24,
        reference: "TRF-SMF-VAN01",
        notes: "Loaded into installation van for scheduled rooftop jobs.",
        performedByUserId: ids.users.warehouseStaff,
      },
      {
        id: "move_2026_0004",
        productId: "prod_ac_isolator_32a",
        warehouseId: ids.warehouses.smithfield,
        movementType: "MANUAL_ADJUSTMENT",
        quantity: -2,
        reference: "COUNT-2026-07",
        notes: "Cycle count correction after warehouse stocktake.",
        performedByUserId: ids.users.warehouseManager,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(purchaseOrders)
    .values([
      {
        id: ids.purchaseOrders.q3Solar,
        poNumber: "PO-2026-0001",
        supplierId: ids.suppliers.solarDistribution,
        status: "PARTIALLY_RECEIVED",
        orderedAt: "2026-07-01",
        expectedAt: "2026-07-08",
        notes: "Q3 panel and inverter replenishment for NSW installs.",
        createdByUserId: adminUser.id,
      },
      {
        id: ids.purchaseOrders.batteryRestock,
        poNumber: "PO-2026-0002",
        supplierId: ids.suppliers.batteryEnergy,
        status: "ORDERED",
        orderedAt: "2026-07-02",
        expectedAt: "2026-07-12",
        notes: "Battery stock for hybrid and backup upgrade bookings.",
        createdByUserId: adminUser.id,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(purchaseOrderItems)
    .values([
      {
        id: "poi_2026_0001_1",
        purchaseOrderId: ids.purchaseOrders.q3Solar,
        productId: "prod_trina_vertex_s_440w",
        quantityOrdered: 240,
        quantityReceived: 120,
        unitCost: "148.00",
      },
      {
        id: "poi_2026_0001_2",
        purchaseOrderId: ids.purchaseOrders.q3Solar,
        productId: "prod_fronius_primo_8_2",
        quantityOrdered: 12,
        quantityReceived: 0,
        unitCost: "2240.00",
      },
      {
        id: "poi_2026_0002_1",
        purchaseOrderId: ids.purchaseOrders.batteryRestock,
        productId: "prod_sungrow_sbr096",
        quantityOrdered: 18,
        quantityReceived: 12,
        unitCost: "5150.00",
      },
      {
        id: "poi_2026_0002_2",
        purchaseOrderId: ids.purchaseOrders.batteryRestock,
        productId: "prod_tesla_powerwall_3",
        quantityOrdered: 6,
        quantityReceived: 0,
        unitCost: "10950.00",
      },
    ])
    .onConflictDoNothing();

  console.log("PowerOps production seed data created");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
