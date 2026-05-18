import { useState } from "react";
import { Link } from "wouter";
import { useListExames } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, ChevronRight } from "lucide-react";

const DISCIPLINAS = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];
const ANOS = Array.from({ length: 23 }, (_, i) => 2026 - i);

export default function Exames() {
  const [disciplina, setDisciplina] = useState("");
  const [ano, setAno] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListExames({
    disciplina: disciplina || undefined,
    ano: ano ? parseInt(ano) : undefined,
    search: search || undefined,
    page,
    limit: 12,
  });

  const exames = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Exames Nacionais Resolvidos</h1>
          <p className="text-muted-foreground">Aceda a exames nacionais com soluções detalhadas passo a passo.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar exames..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={disciplina} onValueChange={v => { setDisciplina(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as disciplinas</SelectItem>
              {DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ano} onValueChange={v => { setAno(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {ANOS.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{total} exame(s) encontrado(s)</p>
            {exames.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum exame encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de pesquisa</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {exames.map(exame => (
                  <Link key={exame.id} href={`/exames/${exame.id}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary">{exame.disciplina}</Badge>
                          <span className="text-sm font-semibold text-primary">{exame.ano}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 leading-snug">{exame.titulo}</h3>
                        {exame.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{exame.descricao}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {(exame.questoes as unknown[]).length} questão(ões)
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
