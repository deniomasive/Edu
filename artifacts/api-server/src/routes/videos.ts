import { Router } from "express";
import { db, videosTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/videos", async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "12"));
    const offset = (page - 1) * limit;
    const disciplina = String(req.query.disciplina || "");
    const search = String(req.query.search || "");

    let query = db.select().from(videosTable);
    const conditions: ReturnType<typeof eq>[] = [];
    if (disciplina) conditions.push(eq(videosTable.disciplina, disciplina));
    if (search) conditions.push(ilike(videosTable.titulo, `%${search}%`));
    if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;

    const countQ = db.select({ count: sql<number>`count(*)` }).from(videosTable);
    const [videos, countResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(videosTable.createdAt),
      conditions.length > 0 ? countQ.where(and(...conditions)) : countQ,
    ]);

    res.json({ data: videos, total: Number(countResult[0].count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/videos", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { titulo, disciplina, descricao, youtubeId, duracao } = req.body;
    if (!titulo || !disciplina || !youtubeId) {
      res.status(400).json({ error: "Campos obrigatórios em falta" }); return;
    }
    const [video] = await db.insert(videosTable).values({ titulo, disciplina, descricao, youtubeId, duracao }).returning();
    res.status(201).json(video);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/videos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [video] = await db.select().from(videosTable).where(eq(videosTable.id, id));
    if (!video) { res.status(404).json({ error: "Vídeo não encontrado" }); return; }
    res.json(video);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/videos/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, disciplina, descricao, youtubeId, duracao } = req.body;
    const updates: Record<string, unknown> = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (disciplina !== undefined) updates.disciplina = disciplina;
    if (descricao !== undefined) updates.descricao = descricao;
    if (youtubeId !== undefined) updates.youtubeId = youtubeId;
    if (duracao !== undefined) updates.duracao = duracao;
    const [video] = await db.update(videosTable).set(updates).where(eq(videosTable.id, id)).returning();
    if (!video) { res.status(404).json({ error: "Vídeo não encontrado" }); return; }
    res.json(video);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/videos/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(videosTable).where(eq(videosTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
