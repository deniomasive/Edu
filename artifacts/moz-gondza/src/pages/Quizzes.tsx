import { useState } from "react";
import { Link } from "wouter";
import { useListQuizzes } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, ChevronRight } from "lucide-react";

const DISCIPLINAS = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];
const DIFICULDADES = ["Fácil", "Médio", "Difícil"];
const DIFF_COLOR: Record<string, string> = { Fácil: "bg-green-100 text-green-800", Médio: "bg-yellow-100 text-yellow-800", Difícil: "bg-red-100 text-red-800" };

export default function Quizzes() {
  const [disciplina, setDisciplina] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListQuizzes({
    disciplina: disciplina || undefined,
    dificuldade: dificuldade || undefined,
    search: search || undefined,
    page,
    limit: 12,
  });

  const quizzes = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quizzes Interactivos</h1>
          <p className="text-muted-foreground">Teste os seus conhecimentos com quizzes cronometrados e feedback imediato.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar quizzes..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={disciplina} onValueChange={v => { setDisciplina(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Disciplina" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dificuldade} onValueChange={v => { setDificuldade(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {DIFICULDADES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{total} quiz(zes) encontrado(s)</p>
            {quizzes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum quiz encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {quizzes.map(quiz => {
                  const perguntas = (quiz.perguntas as unknown[]).length;
                  return (
                    <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
                      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="secondary">{quiz.disciplina}</Badge>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLOR[quiz.dificuldade] ?? "bg-gray-100 text-gray-800"}`}>
                              {quiz.dificuldade}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 leading-snug">{quiz.titulo}</h3>
                          {quiz.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{quiz.descricao}</p>}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {perguntas} perguntas</span>
                            {quiz.tempLimite && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.round(quiz.tempLimite / 60)} min</span>}
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
            {total > 12 && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 12)}</span>
                <Button variant="outline" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
