import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  disciplina: text("disciplina").notNull(),
  dificuldade: text("dificuldade").notNull().default("Médio"),
  descricao: text("descricao"),
  tempLimite: integer("temp_limite"),
  perguntas: jsonb("perguntas").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
