import { useState } from "react";
import { Link } from "wouter";
import { useGetExame, useCompleteExame } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import katex from "katex";

interface Questao {
  id: number;
  numero: number;
  enunciado: string;
  solucao: string;
  latex: string | null;
}

function renderLatex(latex: string) {
  try {
    return katex.renderToString(latex, { displayMode: true, throwOnError: false });
  } catch {
    return "";
  }
}

export default function ExameDetalhe({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const { data: exame, isLoading } = useGetExame(parseInt(params.id), {
    query: { queryKey: ["exame", params.id] }
  });
  const completeMutation = useCompleteExame();

  const questoes = (exame?.questoes as Questao[]) ?? [];
  const progressPct = questoes.length > 0 ? Math.round((completed.size / questoes.length) * 100) : 0;

  const toggleExpand = (id: number) => {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const markComplete = async (questaoId: number) => {
    if (!isAuthenticated) return;
    try {
      await completeMutation.mutateAsync({ id: parseInt(params.id), data: { questaoId } });
      setCompleted(prev => new Set([...prev, questaoId]));
    } catch { /* ignore */ }
  };

  if (isLoading) return <Layout><LoadingSpinner size="lg" /></Layout>;
  if (!exame) return <Layout><div className="p-8 text-center text-muted-foreground">Exame não encontrado.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/exames" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Voltar aos Exames
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary">{exame.disciplina}</Badge>
            <Badge variant="outline">{exame.ano}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{exame.titulo}</h1>
          {exame.descricao && <p className="text-muted-foreground">{exame.descricao}</p>}
        </div>

        {isAuthenticated && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">{completed.size}/{questoes.length} questões</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{progressPct}% concluído</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {questoes.map((q) => (
            <Card key={q.id} className={completed.has(q.id) ? "border-green-200 bg-green-50/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {completed.has(q.id) && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Questão {q.numero}</span>
                      <p className="text-foreground font-medium leading-relaxed">{q.enunciado}</p>
                      {q.latex && (
                        <div
                          className="mt-2 overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: renderLatex(q.latex) }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAuthenticated && !completed.has(q.id) && (
                      <Button size="sm" variant="outline" onClick={() => markComplete(q.id)} className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Concluída
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => toggleExpand(q.id)}>
                      {expanded.has(q.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="ml-1 text-xs">{expanded.has(q.id) ? "Ocultar" : "Resolução"}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expanded.has(q.id) && (
                <CardContent className="border-t bg-muted/30 rounded-b-lg">
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resolução Passo a Passo</p>
                    <p className="text-foreground leading-relaxed whitespace-pre-line">{q.solucao}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20 text-center">
            <p className="text-foreground font-medium mb-2">Acompanhe o seu progresso</p>
            <p className="text-sm text-muted-foreground mb-4">Inicie sessão para marcar questões como concluídas e acompanhar o seu progresso.</p>
            <Link href="/login"><Button className="bg-primary hover:bg-primary/90">Iniciar Sessão</Button></Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
