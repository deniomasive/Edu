import { Router } from "express";
import { db, publicacoesTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/publicacoes", async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "12"));
    const offset = (page - 1) * limit;
    const categoria = String(req.query.categoria || "");
    const search = String(req.query.search || "");

    let query = db.select().from(publicacoesTable);
    const conditions: ReturnType<typeof eq>[] = [];
    if (categoria) conditions.push(eq(publicacoesTable.categoria, categoria));
    if (search) conditions.push(ilike(publicacoesTable.titulo, `%${search}%`));
    if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;

    const countQ = db.select({ count: sql<number>`count(*)` }).from(publicacoesTable);
    const [publicacoes, countResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(publicacoesTable.createdAt),
      conditions.length > 0 ? countQ.where(and(...conditions)) : countQ,
    ]);

    res.json({ data: publicacoes, total: Number(countResult[0].count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/publicacoes", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { titulo, categoria, resumo, conteudo, autor, imagem } = req.body;
    if (!titulo || !categoria || !conteudo || !autor) {
      res.status(400).json({ error: "Campos obrigatórios em falta" }); return;
    }
    const [pub] = await db.insert(publicacoesTable).values({ titulo, categoria, resumo, conteudo, autor, imagem }).returning();
    res.status(201).json(pub);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/publicacoes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [pub] = await db.select().from(publicacoesTable).where(eq(publicacoesTable.id, id));
    if (!pub) { res.status(404).json({ error: "Publicação não encontrada" }); return; }
    res.json(pub);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/publicacoes/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, categoria, resumo, conteudo, autor, imagem } = req.body;
    const updates: Record<string, unknown> = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (categoria !== undefined) updates.categoria = categoria;
    if (resumo !== undefined) updates.resumo = resumo;
    if (conteudo !== undefined) updates.conteudo = conteudo;
    if (autor !== undefined) updates.autor = autor;
    if (imagem !== undefined) updates.imagem = imagem;
    const [pub] = await db.update(publicacoesTable).set(updates).where(eq(publicacoesTable.id, id)).returning();
    if (!pub) { res.status(404).json({ error: "Publicação não encontrada" }); return; }
    res.json(pub);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/publicacoes/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(publicacoesTable).where(eq(publicacoesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
