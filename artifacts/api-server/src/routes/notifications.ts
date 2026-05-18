import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/notifications", authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId!))
      .orderBy(notificationsTable.createdAt);
    res.json(notifications);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/notifications/:id/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [notif] = await db.update(notificationsTable)
      .set({ lida: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.userId!)))
      .returning();
    if (!notif) { res.status(404).json({ error: "Notificação não encontrada" }); return; }
    res.json(notif);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/notifications/mark-all-read", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable)
      .set({ lida: true })
      .where(eq(notificationsTable.userId, req.userId!));
    res.json({ message: "Todas as notificações marcadas como lidas" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
