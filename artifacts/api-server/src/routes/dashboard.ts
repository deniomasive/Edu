import { Router } from "express";
import { db, usersTable, examesTable, quizzesTable, videosTable, publicacoesTable, quizAttemptsTable, progressTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/stats", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const attempts = await db.select().from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.userId, userId))
      .orderBy(desc(quizAttemptsTable.createdAt))
      .limit(5);

    const progresses = await db.select().from(progressTable).where(eq(progressTable.userId, userId));
    const exerciciosConcluidos = progresses.reduce((sum, p) => sum + ((p.questoesCompletas as number[]) || []).length, 0);

    const exames = await db.select().from(examesTable);
    const totalExercicios = exames.reduce((sum, e) => sum + ((e.questoes as unknown[]) || []).length, 0);
    const percentagemGeral = totalExercicios > 0 ? Math.round((exerciciosConcluidos / totalExercicios) * 100) : 0;

    const disciplinas = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];
    const disciplinaProgress = disciplinas.map(d => {
      const examesDisc = exames.filter(e => e.disciplina === d);
      const totalQ = examesDisc.reduce((sum, e) => sum + ((e.questoes as unknown[]) || []).length, 0);
      const concluidos = progresses
        .filter(p => examesDisc.some(e => e.id === p.exameId))
        .reduce((sum, p) => sum + ((p.questoesCompletas as number[]) || []).length, 0);
      return {
        disciplina: d,
        percentagem: totalQ > 0 ? Math.round((concluidos / totalQ) * 100) : 0,
        exerciciosConcluidos: concluidos,
        totalExercicios: totalQ,
      };
    });

    const quizIds = [...new Set(attempts.map(a => a.quizId))];
    const quizMap: Record<number, string> = {};
    if (quizIds.length > 0) {
      const quizzes = await db.select({ id: quizzesTable.id, titulo: quizzesTable.titulo })
        .from(quizzesTable).where(sql`${quizzesTable.id} = ANY(${quizIds})`);
      quizzes.forEach(q => { quizMap[q.id] = q.titulo; });
    }

    res.json({
      quizzesFeitos: attempts.length > 0 ? (await db.select({ count: sql<number>`count(*)` }).from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, userId)))[0].count : 0,
      exerciciosConcluidos,
      percentagemGeral,
      pontos: user?.pontos || 0,
      recentAttempts: attempts.map(a => ({ ...a, quizTitulo: quizMap[a.quizId] || null })),
      disciplinaProgress,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/dashboard/admin-stats", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [userCount, exameCount, quizCount, videoCount, pubCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(usersTable),
      db.select({ count: sql<number>`count(*)` }).from(examesTable),
      db.select({ count: sql<number>`count(*)` }).from(quizzesTable),
      db.select({ count: sql<number>`count(*)` }).from(videosTable),
      db.select({ count: sql<number>`count(*)` }).from(publicacoesTable),
    ]);

    const recentUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);

    res.json({
      totalUsers: Number(userCount[0].count),
      totalExames: Number(exameCount[0].count),
      totalQuizzes: Number(quizCount[0].count),
      totalVideos: Number(videoCount[0].count),
      totalPublicacoes: Number(pubCount[0].count),
      recentUsers: recentUsers.map(u => ({ id: u.id, nome: u.nome, email: u.email, role: u.role, pontos: u.pontos, avatar: u.avatar, bio: u.bio, createdAt: u.createdAt })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
