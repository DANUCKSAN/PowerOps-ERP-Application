import {
  pgTable,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "VIEWER",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "DISABLED",
  "INVITED",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  role: userRoleEnum("role").notNull().default("VIEWER"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});