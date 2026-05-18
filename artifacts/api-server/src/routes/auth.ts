import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, signToken, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
      res.status(400).json({ error: "Todos os campos são obrigatórios" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "A palavra-passe deve ter pelo menos 6 caracteres" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Email já registado" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ nome, email, passwordHash, role: "user", pontos: 0 }).returning();
    const token = signToken(user.id, user.role);
    res.status(201).json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role, pontos: user.pontos, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e palavra-passe são obrigatórios" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }
    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role, pontos: user.pontos, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/auth/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) { res.status(404).json({ error: "Utilizador não encontrado" }); return; }
    res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role, pontos: user.pontos, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
