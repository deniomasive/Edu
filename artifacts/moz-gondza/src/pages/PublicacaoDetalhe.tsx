import { Link } from "wouter";
import { useGetPublicacao } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User, Calendar } from "lucide-react";

export default function PublicacaoDetalhe({ params }: { params: { id: string } }) {
  const { data: pub, isLoading } = useGetPublicacao(parseInt(params.id), { query: { queryKey: ["pub", params.id] } });

  if (isLoading) return <Layout><LoadingSpinner size="lg" /></Layout>;
  if (!pub) return <Layout><div className="p-8 text-center text-muted-foreground">Publicação não encontrada.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/publicacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Voltar às Publicações
        </Link>

        <article>
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">{pub.categoria}</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{pub.titulo}</h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{pub.resumo}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {pub.autor}
              </span>
              {pub.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(pub.createdAt).toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
            </div>
          </header>

          <div className="prose prose-slate max-w-none">
            {pub.conteudo.split("\n\n").map((para, i) => (
              <p key={i} className="text-foreground leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </article>

        <div className="mt-10 pt-6 border-t border-border">
          <Link href="/publicacoes">
            <span className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              <ChevronLeft className="h-4 w-4" /> Ver todas as publicações
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
