import { useState } from "react";
import { Link } from "wouter";
import { useListPublicacoes } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookMarked, ChevronRight } from "lucide-react";

const CATEGORIAS = ["Tecnologia", "Estudo", "História", "Matemática", "Ciência", "Educação"];

export default function Publicacoes() {
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListPublicacoes({ categoria: categoria || undefined, search: search || undefined, page, limit: 9 });
  const publicacoes = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Publicações Académicas</h1>
          <p className="text-muted-foreground">Artigos e publicações para aprofundar os seus conhecimentos.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar publicações..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={categoria} onValueChange={v => { setCategoria(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{total} publicação(ões) encontrada(s)</p>
            {publicacoes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhuma publicação encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {publicacoes.map(pub => (
                  <Link key={pub.id} href={`/publicacoes/${pub.id}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-1">
                        <Badge variant="secondary" className="w-fit mb-3">{pub.categoria}</Badge>
                        <h3 className="font-semibold text-foreground text-lg mb-2 leading-snug">{pub.titulo}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{pub.resumo}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">Por {pub.autor}</span>
                          <span className="flex items-center gap-1 text-xs text-primary hover:underline">
                            Ler mais <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            {total > 9 && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 9)}</span>
                <Button variant="outline" disabled={page >= Math.ceil(total / 9)} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
