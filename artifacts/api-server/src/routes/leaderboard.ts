import { Router } from "express";
import { db, usersTable, quizAttemptsTable } from "@workspace/db";
import { desc, inArray, sql } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit || "20"));
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.pontos)).limit(limit);
    const userIds = users.map(u => u.id);

    const attemptCounts: Record<number, number> = {};
    if (userIds.length > 0) {
      const counts = await db.select({
        userId: quizAttemptsTable.userId,
        count: sql<number>`count(*)`,
      }).from(quizAttemptsTable)
        .where(inArray(quizAttemptsTable.userId, userIds))
        .groupBy(quizAttemptsTable.userId);
      counts.forEach(c => { attemptCounts[c.userId] = Number(c.count); });
    }

    res.json(users.map((u, i) => ({
      posicao: i + 1,
      id: u.id,
      nome: u.nome,
      avatar: u.avatar,
      pontos: u.pontos,
      quizzesFeitos: attemptCounts[u.id] || 0,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
