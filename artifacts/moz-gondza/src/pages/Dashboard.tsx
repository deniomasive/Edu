import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useGetDashboardStats } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, TrendingUp, Award, FileText, Video, BookMarked } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) return <Layout><LoadingSpinner size="lg" /></Layout>;

  const disciplinas = stats?.disciplinaProgress ?? [];
  const recentAttempts = stats?.recentAttempts ?? [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, {user?.nome.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo do seu progresso de aprendizagem.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "Quizzes Feitos", value: stats?.quizzesFeitos ?? 0, color: "text-blue-600" },
            { icon: CheckCircle, label: "Exercícios Concluídos", value: stats?.exerciciosConcluidos ?? 0, color: "text-green-600" },
            { icon: TrendingUp, label: "Progresso Geral", value: `${stats?.percentagemGeral ?? 0}%`, color: "text-orange-600" },
            { icon: Award, label: "Pontos Totais", value: stats?.pontos ?? user?.pontos ?? 0, color: "text-purple-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress by subject */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso por Disciplina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {disciplinas.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum progresso registado ainda. Comece a resolver exercícios!</p>
                ) : (
                  disciplinas.map(d => (
                    <div key={d.disciplina}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">{d.disciplina}</span>
                        <span className="text-muted-foreground">{d.exerciciosConcluidos}/{d.totalExercicios} exercícios</span>
                      </div>
                      <Progress value={d.percentagem} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{d.percentagem}% concluído</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick access */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { href: "/exames", icon: FileText, label: "Ver Exames" },
                  { href: "/quizzes", icon: BookOpen, label: "Fazer Quiz" },
                  { href: "/videos", icon: Video, label: "Ver Vídeos" },
                  { href: "/publicacoes", icon: BookMarked, label: "Publicações" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tentativas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttempts.map(attempt => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-foreground">{attempt.quizTitulo ?? "Quiz"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(attempt.createdAt).toLocaleDateString("pt-PT")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{attempt.acertos}/{attempt.total} acertos</span>
                      <Badge variant={attempt.pontuacao >= 60 ? "default" : "destructive"}>
                        {attempt.pontuacao}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
