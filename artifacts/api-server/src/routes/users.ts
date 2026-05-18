import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = String(req.query.search || "");
    const offset = (page - 1) * limit;

    let query = db.select().from(usersTable);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(usersTable);

    if (search) {
      const cond = or(ilike(usersTable.nome, `%${search}%`), ilike(usersTable.email, `%${search}%`));
      query = query.where(cond) as typeof query;
      countQuery = countQuery.where(cond) as typeof countQuery;
    }

    const [users, [{ count }]] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery,
    ]);

    res.json({
      data: users.map(u => ({ id: u.id, nome: u.nome, email: u.email, role: u.role, pontos: u.pontos, avatar: u.avatar, bio: u.bio, createdAt: u.createdAt })),
      total: Number(count),
      page,
      limit,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/users/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "Utilizador não encontrado" }); return; }
    res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role, pontos: user.pontos, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/users/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.userId !== id && req.userRole !== "admin") {
      res.status(403).json({ error: "Sem permissão" }); return;
    }
    const { nome, bio, avatar, role, password } = req.body;
    const updates: Record<string, unknown> = {};
    if (nome !== undefined) updates.nome = nome;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined && req.userRole === "admin") updates.role = role;
    if (password !== undefined) updates.passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Utilizador não encontrado" }); return; }
    res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role, pontos: user.pontos, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/users/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
