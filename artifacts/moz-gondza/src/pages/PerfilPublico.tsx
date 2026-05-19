import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User, Award, BookOpen, CheckCircle2, TrendingUp, Calendar,
  Trophy, Star, Zap, Medal, Target, Clock,
} from "lucide-react";

interface PublicUser {
  id: number;
  nome: string;
  email: string;
  role: string;
  pontos: number;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

interface UserQuizAttempt {
  id: number;
  quizId: number;
  quizTitle: string;
  quizDisciplina: string;
  pontuacao: number;
  acertos: number;
  total: number;
  tempoGasto: number;
  createdAt: string;
}

interface SubjectProgress {
  disciplina: string;
  percentagem: number;
  quizzesFeitos: number;
  mediaScore: number;
}

interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  icon: typeof Trophy;
  earned: boolean;
  color: string;
}

const DISCIPLINA_COLORS: Record<string, string> = {
  "Matemática": "bg-blue-500",
  "Física": "bg-purple-500",
  "Química": "bg-green-500",
  "Biologia": "bg-teal-500",
  "Português": "bg-orange-500",
  "História": "bg-red-500",
  "Informática": "bg-cyan-500",
  "Economia": "bg-yellow-500",
};

function Avatar({ nome, size = "lg" }: { nome: string; size?: "sm" | "md" | "lg" }) {
  const initials = nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "lg" ? "w-24 h-24 text-3xl" : size === "md" ? "w-14 h-14 text-xl" : "w-9 h-9 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function buildAchievements(stats: { quizzesFeitos: number; pontos: number; posicao: number; mediaAcertos: number }): Achievement[] {
  const { quizzesFeitos, pontos, posicao, mediaAcertos } = stats;
  return [
    { id: "primeiro_quiz", titulo: "Primeiro Quiz", descricao: "Completou o seu primeiro quiz", icon: BookOpen, earned: quizzesFeitos >= 1, color: "text-blue-500" },
    { id: "cinco_quizzes", titulo: "5 Quizzes", descricao: "Completou 5 quizzes", icon: Zap, earned: quizzesFeitos >= 5, color: "text-yellow-500" },
    { id: "dez_quizzes", titulo: "10 Quizzes Resolvidos", descricao: "Completou 10 quizzes", icon: Medal, earned: quizzesFeitos >= 10, color: "text-orange-500" },
    { id: "vinte_cinco_quizzes", titulo: "25 Quizzes", descricao: "Completou 25 quizzes", icon: Star, earned: quizzesFeitos >= 25, color: "text-purple-500" },
    { id: "cem_pontos", titulo: "100 Pontos", descricao: "Acumulou 100 pontos", icon: Award, earned: pontos >= 100, color: "text-green-500" },
    { id: "quinhentos_pontos", titulo: "500 Pontos", descricao: "Acumulou 500 pontos", icon: Trophy, earned: pontos >= 500, color: "text-yellow-600" },
    { id: "top10", titulo: "Top 10 do Ranking", descricao: "Está no top 10 da classificação", icon: TrendingUp, earned: posicao > 0 && posicao <= 10, color: "text-red-500" },
    { id: "top3", titulo: "Pódio!", descricao: "Está no top 3 da classificação", icon: Trophy, earned: posicao > 0 && posicao <= 3, color: "text-amber-500" },
    { id: "perfeccionista", titulo: "Perfeccionista", descricao: "Média de acertos acima de 80%", icon: Target, earned: mediaAcertos >= 80, color: "text-teal-500" },
    { id: "velocista", titulo: "Velocista", descricao: "Completou um quiz em menos de 3 minutos", icon: Clock, earned: quizzesFeitos >= 1, color: "text-cyan-500" },
  ];
}

export default function PerfilPublico() {
  const params = useParams<{ userId: string }>();
  const userId = parseInt(params.userId || "0");

  const [user, setUser] = useState<PublicUser | null>(null);
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [leaderboardPos, setLeaderboardPos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("moz-gondza-token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`/api/users/${userId}`, { headers }).then(r => r.json()),
      fetch(`/api/users/${userId}/quizzes`, { headers }).then(r => r.json()),
      fetch(`/api/leaderboard?limit=100`).then(r => r.json()),
    ]).then(([userData, quizzesData, leaderboard]) => {
      if (userData.error) { setError("Utilizador não encontrado."); setLoading(false); return; }
      setUser(userData);
      const att: UserQuizAttempt[] = Array.isArray(quizzesData) ? quizzesData : [];
      setAttempts(att);

      // Build subject progress from attempts
      const byDisciplina: Record<string, { scores: number[]; count: number }> = {};
      att.forEach(a => {
        const d = a.quizDisciplina || "Outros";
        if (!byDisciplina[d]) byDisciplina[d] = { scores: [], count: 0 };
        byDisciplina[d].scores.push(a.pontuacao);
        byDisciplina[d].count++;
      });
      setSubjectProgress(
        Object.entries(byDisciplina).map(([disciplina, { scores, count }]) => {
          const media = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          return { disciplina, percentagem: media, quizzesFeitos: count, mediaScore: media };
        }).sort((a, b) => b.quizzesFeitos - a.quizzesFeitos)
      );

      // Leaderboard position
      if (Array.isArray(leaderboard)) {
        const pos = leaderboard.findIndex((e: { id: number }) => e.id === userId);
        setLeaderboardPos(pos >= 0 ? pos + 1 : 0);
      }
      setLoading(false);
    }).catch(() => { setError("Erro ao carregar perfil."); setLoading(false); });
  }, [userId]);

  if (loading) return <Layout><div className="py-20"><LoadingSpinner /></div></Layout>;
  if (error || !user) return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h2 className="text-xl font-bold text-foreground mb-2">Utilizador não encontrado</h2>
        <p className="text-muted-foreground mb-6">{error || "Este perfil não existe ou foi removido."}</p>
        <Link href="/classificacao"><span className="text-primary hover:underline">← Voltar à Classificação</span></Link>
      </div>
    </Layout>
  );

  const mediaAcertos = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.total > 0 ? (a.acertos / a.total) * 100 : 0), 0) / attempts.length)
    : 0;
  const achievements = buildAchievements({ quizzesFeitos: attempts.length, pontos: user.pontos, posicao: leaderboardPos, mediaAcertos });
  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Profile header */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <Avatar nome={user.nome} size="lg" />
              <div className="flex-1 min-w-0 pt-12 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{user.nome}</h1>
                  {user.role === "admin" && <Badge className="bg-accent text-white text-xs">Admin</Badge>}
                  {leaderboardPos > 0 && leaderboardPos <= 3 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">🏆 Top {leaderboardPos}</Badge>
                  )}
                </div>
                {user.bio && <p className="text-muted-foreground text-sm mt-1">{user.bio}</p>}
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Membro desde {new Date(user.createdAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pontos Totais", value: user.pontos, icon: Award, color: "text-yellow-500" },
            { label: "Quizzes Feitos", value: attempts.length, icon: BookOpen, color: "text-blue-500" },
            { label: "Média de Acertos", value: `${mediaAcertos}%`, icon: Target, color: "text-green-500" },
            { label: "Posição", value: leaderboardPos > 0 ? `#${leaderboardPos}` : "—", icon: Trophy, color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject progress */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Progresso por Disciplina</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {subjectProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum quiz concluído ainda.</p>
              ) : (
                subjectProgress.map(sp => (
                  <div key={sp.disciplina}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${DISCIPLINA_COLORS[sp.disciplina] ?? "bg-gray-400"}`} />
                        <span className="text-sm font-medium text-foreground">{sp.disciplina}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary">{sp.percentagem}%</span>
                        <span className="text-xs text-muted-foreground ml-2">({sp.quizzesFeitos} quiz)</span>
                      </div>
                    </div>
                    <Progress value={sp.percentagem} className="h-2" />
                  </div>
                ))
              )}
              {subjectProgress.length === 0 && (
                <div className="space-y-3">
                  {["Matemática", "Física", "Química", "Biologia", "Português", "História"].map(d => (
                    <div key={d}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${DISCIPLINA_COLORS[d] ?? "bg-gray-400"}`} />
                          <span className="text-sm font-medium text-foreground">{d}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" /> Conquistas
                <Badge variant="secondary" className="ml-auto">{earnedAchievements.length}/{achievements.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map(ach => {
                  const Icon = ach.icon;
                  return (
                    <div key={ach.id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${ach.earned ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 opacity-50"}`}>
                      <Icon className={`h-5 w-5 flex-shrink-0 ${ach.earned ? ach.color : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${ach.earned ? "text-foreground" : "text-muted-foreground"}`}>{ach.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate">{ach.descricao}</p>
                      </div>
                      {ach.earned && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz history */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Histórico de Quizzes</CardTitle></CardHeader>
          <CardContent className="p-0">
            {attempts.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhum quiz concluído ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {attempts.slice(0, 10).map(a => {
                  const pct = a.total > 0 ? Math.round((a.acertos / a.total) * 100) : 0;
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${pct >= 70 ? "bg-green-100" : pct >= 40 ? "bg-yellow-100" : "bg-red-100"}`}>
                        <span className={`text-sm font-bold ${pct >= 70 ? "text-green-700" : pct >= 40 ? "text-yellow-700" : "text-red-700"}`}>{pct}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.quizTitle || `Quiz #${a.quizId}`}</p>
                        <p className="text-xs text-muted-foreground">{a.quizDisciplina} · {a.acertos}/{a.total} acertos</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">{a.pontuacao} pts</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("pt-PT")}</p>
                      </div>
                    </div>
                  );
                })}
                {attempts.length > 10 && (
                  <div className="px-6 py-3 text-center text-xs text-muted-foreground">
                    + {attempts.length - 10} mais tentativas
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
