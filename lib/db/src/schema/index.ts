import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "operator", "viewer", "client"]);
export const orderStatusEnum = pgEnum("order_status", [
  "received",
  "queued",
  "in_process",
  "quality_check",
  "completed",
  "dispatched",
  "on_hold",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "received",
  "in_process",
  "status_change",
  "quality_check",
  "completed",
  "dispatched",
  "note",
]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  materialCode: text("material_code").notNull(),
  description: text("description").notNull(),
  grade: text("grade"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "restrict" }),
  orderCode: text("order_code").notNull().unique(),
  processType: text("process_type").notNull(),
  quantity: integer("quantity").notNull(),
  status: orderStatusEnum("status").notNull().default("received"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workOrderEvents = pgTable("work_order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: eventTypeEnum("event_type").notNull().default("note"),
  message: text("message").notNull(),
  statusAfter: orderStatusEnum("status_after"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  detailsJson: text("details_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customerRelations = relations(customers, ({ many }) => ({
  users: many(users),
  materials: many(materials),
  workOrders: many(workOrders),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [users.customerId],
    references: [customers.id],
  }),
  workOrderEvents: many(workOrderEvents),
  documents: many(documents),
  auditLogs: many(auditLogs),
}));

export const materialRelations = relations(materials, ({ one, many }) => ({
  customer: one(customers, {
    fields: [materials.customerId],
    references: [customers.id],
  }),
  workOrders: many(workOrders),
}));

export const workOrderRelations = relations(workOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [workOrders.customerId],
    references: [customers.id],
  }),
  material: one(materials, {
    fields: [workOrders.materialId],
    references: [materials.id],
  }),
  events: many(workOrderEvents),
  documents: many(documents),
}));