import { Link } from "wouter";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, LucideIcon } from "lucide-react";

interface MedalDef {
  icon: LucideIcon;
  color: string;
  label: string;
}

const MEDALS: MedalDef[] = [
  { icon: Trophy, color: "text-yellow-500 bg-yellow-50", label: "1º" },
  { icon: Medal, color: "text-gray-400 bg-gray-50", label: "2º" },
  { icon: Award, color: "text-amber-600 bg-amber-50", label: "3º" },
];

function MedalIcon({ def }: { def: MedalDef }) {
  const Icon = def.icon;
  return <Icon className={`h-3.5 w-3.5 ${def.color.split(" ")[0]}`} />;
}

function PodiumMedalIcon({ def }: { def: MedalDef }) {
  const Icon = def.icon;
  return <Icon className={`h-7 w-7 ${def.color.split(" ")[0]}`} />;
}

export default function Classificacao() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const entries = leaderboard ?? [];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Tabela de Classificação</h1>
          <p className="text-muted-foreground">Os estudantes com mais pontos na plataforma Moz-Gondza.</p>
        </div>

        {/* Top 3 podium */}
        {!isLoading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
              const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              if (!entry) return <div key={`podium-${rank}`} />;
              const def = MEDALS[rank - 1];
              if (!def) return null;
              return (
                <Link key={entry.id} href={`/perfil/${entry.id}`}>
                  <div className={`text-center cursor-pointer group ${podiumIdx === 1 ? "-mt-4" : ""}`}>
                    <div className={`w-16 h-16 rounded-full ${def.color} flex items-center justify-center mx-auto mb-2 border-2 border-border shadow-md group-hover:scale-105 transition-transform`}>
                      <PodiumMedalIcon def={def} />
                    </div>
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{entry.nome}</p>
                    <p className="text-xs text-muted-foreground">{entry.pontos} pts</p>
                    <Badge variant="outline" className="mt-1 text-xs">{rank}º</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Classificação Geral</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <LoadingSpinner /> : (
              <div className="divide-y divide-border">
                {entries.map((entry, idx) => {
                  const isCurrentUser = user?.id === entry.id;
                  const def = MEDALS[idx];
                  return (
                    <Link key={entry.id} href={`/perfil/${entry.id}`}>
                      <div className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"}`}>
                        <div className="w-8 text-center">
                          {idx < 3 && def ? (
                            <div className={`w-7 h-7 rounded-full ${def.color} flex items-center justify-center`}>
                              <MedalIcon def={def} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium">{idx + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate hover:text-primary transition-colors ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                            {entry.nome}{" "}
                            {isCurrentUser && <span className="text-xs font-normal text-muted-foreground">(você)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(entry as { quizzesFeitos?: number }).quizzesFeitos ?? 0} quizzes realizados
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">{entry.pontos}</span>
                          <span className="text-xs text-muted-foreground ml-1">pts</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {entries.length === 0 && (
                  <div className="py-16 text-center text-muted-foreground">
                    <p>Nenhum resultado ainda. Seja o primeiro a pontuar!</p>
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
