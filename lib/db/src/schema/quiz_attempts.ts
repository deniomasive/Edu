import { pgTable, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  userId: integer("user_id").notNull(),
  pontuacao: integer("pontuacao").notNull().default(0),
  acertos: integer("acertos").notNull().default(0),
  total: integer("total").notNull().default(0),
  tempoGasto: integer("tempo_gasto").notNull().default(0),
  respostas: jsonb("respostas"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttemptsTable).omit({ id: true, createdAt: true });
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
