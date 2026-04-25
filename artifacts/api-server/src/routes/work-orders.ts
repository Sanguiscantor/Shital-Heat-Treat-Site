import { Router, type IRouter } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  auditLogs,
  clientNotifications,
  customers,
  db,
  materials,
  workOrderEvents,
  workOrders,
} from "@workspace/db";
import { requireAuth, requireRoles } from "../lib/auth-middleware";

const router: IRouter = Router();

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

router.get("/work-orders", requireAuth, async (req, res) => {
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
  const includeArchived = req.query["includeArchived"] === "true";
  const limitParam = Number(req.query["limit"] ?? 25);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 25;
  const clauses = [];

  if (req.auth!.role === "client") {
    if (!req.auth!.customerId) {
      res.json({ items: [] });
      return;
    }
    clauses.push(eq(workOrders.customerId, req.auth!.customerId));
  }
  if (status) {
    clauses.push(eq(workOrders.status, status as typeof workOrders.$inferSelect.status));
  }
  if (!includeArchived) {
    clauses.push(isNull(workOrders.archivedAt));
  }

  const list = await db.query.workOrders.findMany({
    where: clauses.length > 0 ? and(...clauses) : undefined,
    orderBy: [desc(workOrders.updatedAt)],
    limit,
    with: {
      material: true,
      customer: true,
      events: {
        orderBy: [desc(workOrderEvents.createdAt)],
        limit: 5,
      },
    },
  });

  res.json({ items: list });
});

router.post(
  "/work-orders",
  requireAuth,
  requireRoles("admin", "operator"),
  async (req, res) => {
    const body = req.body as {
      customerId?: string;
      materialId?: string;
      orderCode?: string;
      processType?: string;
      quantity?: number;
      status?: typeof workOrders.$inferInsert.status;
      initialInspection?: "ok" | "not_ok";
      stressRelieving?: boolean;
      hardening?: boolean;
      temperingCycles?: number;
      finalInspection?: "ok" | "not_ok";
      remarks?: string | null;
      dueDate?: string | null;
      notes?: string | null;
    };

    if (
      !body.customerId ||
      !body.materialId ||
      !body.orderCode ||
      !body.processType ||
      typeof body.quantity !== "number"
    ) {
      res.status(400).json({ message: "Missing required fields for work order creation." });
      return;
    }

    const [created] = await db
      .insert(workOrders)
      .values({
        customerId: body.customerId,
        materialId: body.materialId,
        orderCode: body.orderCode,
        processType: body.processType,
        quantity: body.quantity,
        status: body.status ?? "received",
        initialInspection: body.initialInspection ?? "ok",
        stressRelieving: body.stressRelieving ?? false,
        hardening: body.hardening ?? false,
        temperingCycles: body.temperingCycles ?? 2,
        finalInspection: body.finalInspection ?? "ok",
        remarks: body.remarks ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes ?? null,
      })
      .returning();

    await db.insert(workOrderEvents).values({
      workOrderId: created.id,
      actorUserId: req.auth!.sub,
      eventType: "received",
      message: "Work order created",
      statusAfter: created.status,
    });

    await db.insert(auditLogs).values({
      actorUserId: req.auth!.sub,
      action: "work_order_created",
      entityType: "work_order",
      entityId: created.id,
      detailsJson: JSON.stringify({
        orderCode: created.orderCode,
      }),
    });

    res.status(201).json(created);
  },
);

router.get(
  "/materials",
  requireAuth,
  requireRoles("admin", "operator", "viewer"),
  async (req, res) => {
    const customerId = typeof req.query["customerId"] === "string" ? req.query["customerId"] : undefined;
    const clauses = [];
    if (req.auth!.role === "client" && req.auth!.customerId) {
      clauses.push(eq(materials.customerId, req.auth!.customerId));
    } else if (customerId) {
      clauses.push(eq(materials.customerId, customerId));
    }
    const items = await db.query.materials.findMany({
      where: clauses.length > 0 ? and(...clauses) : undefined,
      orderBy: [desc(materials.createdAt)],
    });
    res.json({ items });
  },
);

router.patch(
  "/work-orders/:id/status",
  requireAuth,
  requireRoles("admin", "operator"),
  async (req, res) => {
    const id = firstParam(req.params["id"]);
    const { status, message } = req.body as {
      status?: typeof workOrders.$inferInsert.status;
      message?: string;
    };
    if (!id || !status) {
      res.status(400).json({ message: "id and status are required." });
      return;
    }

    const [updated] = await db
      .update(workOrders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(workOrders.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }

    await db.insert(workOrderEvents).values({
      workOrderId: id,
      actorUserId: req.auth!.sub,
      eventType: "status_change",
      message: message?.trim() || `Status changed to ${status}`,
      statusAfter: status,
    });

    await db.insert(auditLogs).values({
      actorUserId: req.auth!.sub,
      action: "work_order_status_updated",
      entityType: "work_order",
      entityId: id,
      detailsJson: JSON.stringify({ status }),
    });

    res.json(updated);
  },
);

router.patch(
  "/work-orders/:id/worker-fields",
  requireAuth,
  requireRoles("admin", "operator"),
  async (req, res) => {
    const id = firstParam(req.params["id"]);
    if (!id) {
      res.status(400).json({ message: "id is required." });
      return;
    }
    const body = req.body as Partial<{
      status: typeof workOrders.$inferInsert.status;
      initialInspection: "ok" | "not_ok";
      stressRelieving: boolean;
      hardening: boolean;
      temperingCycles: number;
      finalInspection: "ok" | "not_ok";
      remarks: string | null;
      notes: string | null;
    }>;

    const [updated] = await db
      .update(workOrders)
      .set({
        ...(body.status ? { status: body.status } : {}),
        ...(body.initialInspection ? { initialInspection: body.initialInspection } : {}),
        ...(typeof body.stressRelieving === "boolean"
          ? { stressRelieving: body.stressRelieving }
          : {}),
        ...(typeof body.hardening === "boolean" ? { hardening: body.hardening } : {}),
        ...(typeof body.temperingCycles === "number"
          ? { temperingCycles: body.temperingCycles }
          : {}),
        ...(body.finalInspection ? { finalInspection: body.finalInspection } : {}),
        ...(typeof body.remarks !== "undefined" ? { remarks: body.remarks } : {}),
        ...(typeof body.notes !== "undefined" ? { notes: body.notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(workOrders.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }
    res.json(updated);
  },
);

router.post(
  "/work-orders/:id/submit",
  requireAuth,
  requireRoles("admin", "operator"),
  async (req, res) => {
    const id = firstParam(req.params["id"]);
    if (!id) {
      res.status(400).json({ message: "id is required." });
      return;
    }
    const source = await db.query.workOrders.findFirst({ where: eq(workOrders.id, id) });
    if (!source) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }

    if (source.finalInspection === "not_ok" && !(source.remarks ?? "").trim()) {
      res.status(400).json({ message: "Remarks are required when final inspection is not OK." });
      return;
    }

    const [updated] = await db
      .update(workOrders)
      .set({
        archivedAt: source.status === "dispatched" ? new Date() : source.archivedAt,
        updatedAt: new Date(),
      })
      .where(eq(workOrders.id, id))
      .returning();

    const statusMessage = `Status submitted as ${updated.status}`;

    await db.insert(workOrderEvents).values({
      workOrderId: id,
      actorUserId: req.auth!.sub,
      eventType:
        updated.status === "dispatched"
          ? "dispatched"
          : updated.status === "ready_for_dispatch"
            ? "ready_for_dispatch"
            : "status_change",
      message: statusMessage,
      statusAfter: updated.status,
    });

    await db.insert(clientNotifications).values({
      customerId: updated.customerId,
      workOrderId: id,
      title: "Job status update",
      message: `${updated.orderCode}: ${updated.status.replaceAll("_", " ")}`,
      status: "pending",
      channel: "in_app",
    });

    await db.insert(auditLogs).values({
      actorUserId: req.auth!.sub,
      action: "work_order_submitted",
      entityType: "work_order",
      entityId: id,
      detailsJson: JSON.stringify({ status: updated.status }),
    });

    res.json(updated);
  },
);

router.get("/customers", requireAuth, requireRoles("admin", "operator", "viewer"), async (_req, res) => {
  const data = await db.query.customers.findMany({
    where: eq(customers.isActive, true),
    orderBy: [desc(customers.createdAt)],
  });
  res.json({ items: data });
});

router.post("/materials", requireAuth, requireRoles("admin", "operator"), async (req, res) => {
  const body = req.body as {
    customerId?: string;
    materialCode?: string;
    description?: string;
    grade?: string | null;
  };
  if (!body.customerId || !body.materialCode || !body.description) {
    res.status(400).json({ message: "customerId, materialCode, description are required." });
    return;
  }
  const [created] = await db
    .insert(materials)
    .values({
      customerId: body.customerId,
      materialCode: body.materialCode,
      description: body.description,
      grade: body.grade ?? null,
    })
    .returning();
  res.status(201).json(created);
});

router.post("/customers", requireAuth, requireRoles("admin", "operator"), async (req, res) => {
  const body = req.body as {
    companyName?: string;
    contactName?: string | null;
    contactEmail?: string;
    contactPhone?: string | null;
  };
  if (!body.companyName || !body.contactEmail) {
    res.status(400).json({ message: "companyName and contactEmail are required." });
    return;
  }
  const [created] = await db
    .insert(customers)
    .values({
      companyName: body.companyName,
      contactName: body.contactName ?? null,
      contactEmail: body.contactEmail.toLowerCase().trim(),
      contactPhone: body.contactPhone ?? null,
    })
    .returning();
  res.status(201).json(created);
});

router.get("/work-orders/:id/events", requireAuth, async (req, res) => {
  const id = firstParam(req.params["id"]);
  if (!id) {
    res.status(400).json({ message: "Missing order id." });
    return;
  }
  const order = await db.query.workOrders.findFirst({
    where: eq(workOrders.id, id),
  });
  if (!order) {
    res.status(404).json({ message: "Not found." });
    return;
  }
  if (req.auth!.role === "client" && order.customerId !== req.auth!.customerId) {
    res.status(403).json({ message: "Not allowed." });
    return;
  }
  const events = await db.query.workOrderEvents.findMany({
    where: eq(workOrderEvents.workOrderId, id),
    orderBy: [desc(workOrderEvents.createdAt)],
  });
  res.json({ items: events });
});

router.get("/notifications", requireAuth, async (req, res) => {
  const clauses = [];
  if (req.auth!.role === "client") {
    if (!req.auth!.customerId) {
      res.json({ items: [] });
      return;
    }
    clauses.push(eq(clientNotifications.customerId, req.auth!.customerId));
  }
  const items = await db.query.clientNotifications.findMany({
    where: clauses.length ? and(...clauses) : undefined,
    orderBy: [desc(clientNotifications.createdAt)],
    limit: 100,
  });
  res.json({ items });
});

export default router;

