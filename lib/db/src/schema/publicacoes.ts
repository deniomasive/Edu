import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publicacoesTable = pgTable("publicacoes", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  categoria: text("categoria").notNull(),
  resumo: text("resumo"),
  conteudo: text("conteudo").notNull(),
  autor: text("autor").notNull(),
  imagem: text("imagem"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPublicacaoSchema = createInsertSchema(publicacoesTable).omit({ id: true, createdAt: true });
export type InsertPublicacao = z.infer<typeof insertPublicacaoSchema>;
export type Publicacao = typeof publicacoesTable.$inferSelect;
