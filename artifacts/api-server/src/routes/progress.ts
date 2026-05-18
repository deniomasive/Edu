import { Router } from "express";
import { db, progressTable, examesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/progress", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const progresses = await db.select().from(progressTable).where(eq(progressTable.userId, userId));
    const exameIds = progresses.map(p => p.exameId);

    const disciplinas = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];
    const exames = exameIds.length > 0
      ? await db.select().from(examesTable)
      : await db.select().from(examesTable);

    const disciplinaMap: Record<string, { concluidos: number; total: number }> = {};
    for (const d of disciplinas) {
      const examesDisc = exames.filter(e => e.disciplina === d);
      const totalQuestoes = examesDisc.reduce((sum, e) => sum + ((e.questoes as unknown[]) || []).length, 0);
      const concluidos = progresses
        .filter(p => examesDisc.some(e => e.id === p.exameId))
        .reduce((sum, p) => sum + ((p.questoesCompletas as number[]) || []).length, 0);
      disciplinaMap[d] = { concluidos, total: totalQuestoes };
    }

    const exerciciosConcluidos = progresses.reduce((sum, p) => sum + ((p.questoesCompletas as number[]) || []).length, 0);
    const totalExercicios = exames.reduce((sum, e) => sum + ((e.questoes as unknown[]) || []).length, 0);
    const percentagemGeral = totalExercicios > 0 ? Math.round((exerciciosConcluidos / totalExercicios) * 100) : 0;

    res.json({
      quizzesFeitos: 0,
      exerciciosConcluidos,
      percentagemGeral,
      pontosTotais: 0,
      disciplinas: disciplinas.map(d => ({
        disciplina: d,
        percentagem: disciplinaMap[d].total > 0 ? Math.round((disciplinaMap[d].concluidos / disciplinaMap[d].total) * 100) : 0,
        exerciciosConcluidos: disciplinaMap[d].concluidos,
        totalExercicios: disciplinaMap[d].total,
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
