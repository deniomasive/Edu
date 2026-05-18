import { Router } from "express";
import { db, quizzesTable, quizAttemptsTable, usersTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/quizzes", async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "12"));
    const offset = (page - 1) * limit;
    const disciplina = String(req.query.disciplina || "");
    const dificuldade = String(req.query.dificuldade || "");
    const search = String(req.query.search || "");

    let query = db.select().from(quizzesTable);
    const conditions: ReturnType<typeof eq>[] = [];

    if (disciplina) conditions.push(eq(quizzesTable.disciplina, disciplina));
    if (dificuldade) conditions.push(eq(quizzesTable.dificuldade, dificuldade));
    if (search) conditions.push(ilike(quizzesTable.titulo, `%${search}%`));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const countQ = db.select({ count: sql<number>`count(*)` }).from(quizzesTable);
    const [quizzes, countResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(quizzesTable.createdAt),
      conditions.length > 0 ? countQ.where(and(...conditions)) : countQ,
    ]);

    res.json({ data: quizzes, total: Number(countResult[0].count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/quizzes", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { titulo, disciplina, dificuldade, descricao, tempLimite, perguntas } = req.body;
    if (!titulo || !disciplina || !dificuldade) {
      res.status(400).json({ error: "Campos obrigatórios em falta" }); return;
    }
    const perguntasWithId = (perguntas || []).map((p: Record<string, unknown>, i: number) => ({ ...p, id: i + 1 }));
    const [quiz] = await db.insert(quizzesTable).values({ titulo, disciplina, dificuldade, descricao, tempLimite, perguntas: perguntasWithId }).returning();
    res.status(201).json(quiz);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/quizzes/attempts", authenticate, async (req: AuthRequest, res) => {
  try {
    const attempts = await db.select().from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.userId, req.userId!))
      .orderBy(quizAttemptsTable.createdAt);

    const quizIds = [...new Set(attempts.map(a => a.quizId))];
    const quizMap: Record<number, string> = {};
    if (quizIds.length > 0) {
      const quizzes = await db.select({ id: quizzesTable.id, titulo: quizzesTable.titulo })
        .from(quizzesTable).where(sql`${quizzesTable.id} = ANY(${quizIds})`);
      quizzes.forEach(q => { quizMap[q.id] = q.titulo; });
    }

    res.json(attempts.map(a => ({ ...a, quizTitulo: quizMap[a.quizId] || null })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/quizzes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    if (!quiz) { res.status(404).json({ error: "Quiz não encontrado" }); return; }
    res.json(quiz);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/quizzes/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, disciplina, dificuldade, descricao, tempLimite } = req.body;
    const updates: Record<string, unknown> = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (disciplina !== undefined) updates.disciplina = disciplina;
    if (dificuldade !== undefined) updates.dificuldade = dificuldade;
    if (descricao !== undefined) updates.descricao = descricao;
    if (tempLimite !== undefined) updates.tempLimite = tempLimite;
    const [quiz] = await db.update(quizzesTable).set(updates).where(eq(quizzesTable.id, id)).returning();
    if (!quiz) { res.status(404).json({ error: "Quiz não encontrado" }); return; }
    res.json(quiz);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/quizzes/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/quizzes/:id/submit", authenticate, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const userId = req.userId!;
    const { respostas, tempoGasto } = req.body;

    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
    if (!quiz) { res.status(404).json({ error: "Quiz não encontrado" }); return; }

    const perguntas = (quiz.perguntas as Array<{ respostaCorreta: number }>) || [];
    let acertos = 0;
    perguntas.forEach((p, i) => {
      if (respostas[i] === p.respostaCorreta) acertos++;
    });

    const total = perguntas.length;
    const pontuacao = total > 0 ? Math.round((acertos / total) * 100) : 0;

    const [attempt] = await db.insert(quizAttemptsTable).values({
      quizId, userId, pontuacao, acertos, total, tempoGasto, respostas,
    }).returning();

    // Award points to user
    const pointsGained = acertos * 10;
    await db.update(usersTable)
      .set({ pontos: sql`${usersTable.pontos} + ${pointsGained}` })
      .where(eq(usersTable.id, userId));

    res.json({ ...attempt, quizTitulo: quiz.titulo });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
