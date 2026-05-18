import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examesTable = pgTable("exames", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  disciplina: text("disciplina").notNull(),
  ano: integer("ano").notNull(),
  descricao: text("descricao"),
  questoes: jsonb("questoes").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExameSchema = createInsertSchema(examesTable).omit({ id: true, createdAt: true });
export type InsertExame = z.infer<typeof insertExameSchema>;
export type Exame = typeof examesTable.$inferSelect;
