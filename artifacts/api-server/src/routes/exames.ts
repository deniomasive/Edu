import { Router } from "express";
import { db, examesTable, progressTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/exames", async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "12"));
    const offset = (page - 1) * limit;
    const disciplina = String(req.query.disciplina || "");
    const ano = req.query.ano ? parseInt(String(req.query.ano)) : null;
    const search = String(req.query.search || "");

    let query = db.select().from(examesTable);
    const conditions: ReturnType<typeof eq>[] = [];

    if (disciplina) conditions.push(eq(examesTable.disciplina, disciplina));
    if (ano) conditions.push(eq(examesTable.ano, ano));
    if (search) conditions.push(ilike(examesTable.titulo, `%${search}%`));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const countQ = db.select({ count: sql<number>`count(*)` }).from(examesTable);
    const [exames, countResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(examesTable.ano),
      conditions.length > 0
        ? countQ.where(and(...conditions))
        : countQ,
    ]);

    res.json({ data: exames, total: Number(countResult[0].count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/exames", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { titulo, disciplina, ano, descricao, questoes } = req.body;
    if (!titulo || !disciplina || !ano) {
      res.status(400).json({ error: "Campos obrigatórios em falta" }); return;
    }
    const questoesWithId = (questoes || []).map((q: Record<string, unknown>, i: number) => ({ ...q, id: i + 1 }));
    const [exame] = await db.insert(examesTable).values({ titulo, disciplina, ano, descricao, questoes: questoesWithId }).returning();
    res.status(201).json(exame);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/exames/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [exame] = await db.select().from(examesTable).where(eq(examesTable.id, id));
    if (!exame) { res.status(404).json({ error: "Exame não encontrado" }); return; }
    res.json(exame);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/exames/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, disciplina, ano, descricao } = req.body;
    const updates: Record<string, unknown> = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (disciplina !== undefined) updates.disciplina = disciplina;
    if (ano !== undefined) updates.ano = ano;
    if (descricao !== undefined) updates.descricao = descricao;
    const [exame] = await db.update(examesTable).set(updates).where(eq(examesTable.id, id)).returning();
    if (!exame) { res.status(404).json({ error: "Exame não encontrado" }); return; }
    res.json(exame);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/exames/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(examesTable).where(eq(examesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/exames/:id/complete", authenticate, async (req: AuthRequest, res) => {
  try {
    const exameId = parseInt(req.params.id);
    const { questaoId } = req.body;
    const userId = req.userId!;

    const existing = await db.select().from(progressTable)
      .where(and(eq(progressTable.userId, userId), eq(progressTable.exameId, exameId)));

    if (existing.length > 0) {
      const prog = existing[0];
      const questoes = (prog.questoesCompletas as number[]) || [];
      if (!questoes.includes(questaoId)) questoes.push(questaoId);
      const [exame] = await db.select().from(examesTable).where(eq(examesTable.id, exameId));
      const total = exame ? (exame.questoes as unknown[]).length : 1;
      const percentagem = Math.round((questoes.length / total) * 100);
      const [updated] = await db.update(progressTable).set({ questoesCompletas: questoes, updatedAt: new Date() })
        .where(eq(progressTable.id, prog.id)).returning();
      res.json({ userId, exameId, questoesCompletas: updated.questoesCompletas, percentagem });
    } else {
      const [exame] = await db.select().from(examesTable).where(eq(examesTable.id, exameId));
      const total = exame ? (exame.questoes as unknown[]).length : 1;
      const questoes = [questaoId];
      const percentagem = Math.round((questoes.length / total) * 100);
      const [created] = await db.insert(progressTable).values({ userId, exameId, questoesCompletas: questoes }).returning();
      res.json({ userId, exameId, questoesCompletas: created.questoesCompletas, percentagem });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
