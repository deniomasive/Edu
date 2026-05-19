import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, BarChart2, FileText, Video, TrendingUp, BookMarked,
  ChevronRight, Star, Trophy, Users, Award, ArrowRight,
} from "lucide-react";
import Layout from "@/components/Layout";

const features = [
  { icon: BookOpen, title: "Quizzes Interactivos", desc: "Teste os seus conhecimentos com quizzes em tempo real, com feedback imediato e pontuação detalhada.", href: "/quizzes", color: "from-blue-500 to-blue-600" },
  { icon: BarChart2, title: "Resultados Detalhados", desc: "Acompanhe o seu progresso com estatísticas detalhadas por disciplina e histórico de resultados.", href: "/dashboard", color: "from-green-500 to-green-600" },
  { icon: FileText, title: "Exames Resolvidos", desc: "Aceda a exames nacionais resolvidos passo a passo, com explicações e equações matemáticas.", href: "/exames", color: "from-purple-500 to-purple-600" },
  { icon: Video, title: "Vídeo-Aulas", desc: "Aprenda ao seu ritmo com vídeo-aulas de qualidade sobre todas as disciplinas do currículo.", href: "/videos", color: "from-red-500 to-red-600" },
  { icon: TrendingUp, title: "Classificação", desc: "Visualize a sua posição no ranking e compare com outros estudantes da plataforma.", href: "/classificacao", color: "from-yellow-500 to-yellow-600" },
  { icon: BookMarked, title: "Publicações Académicas", desc: "Leia artigos e publicações académicas para aprofundar os seus conhecimentos.", href: "/publicacoes", color: "from-teal-500 to-teal-600" },
];

const testimonials = [
  { nome: "Maria Sitoe", tipo: "Estudante, 12ª Classe", texto: "O Moz-Gondza transformou a minha forma de estudar. Graças aos exames resolvidos, passei com distinção!", stars: 5 },
  { nome: "Prof. António Cossa", tipo: "Professor de Matemática", texto: "Uma ferramenta indispensável para os meus alunos. Os quizzes interactivos motivam-nos a estudar mais.", stars: 5 },
  { nome: "Carlos Muiambo", tipo: "Estudante, 11ª Classe", texto: "A plataforma é muito fácil de usar. Os vídeos e exercícios ajudaram-me muito a preparar os exames.", stars: 5 },
];

function handleSaberMais(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8 text-white/90">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Plataforma educacional nº 1 de Moçambique
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Moz-Gondza
          </h1>
          <p className="text-xl sm:text-2xl text-white/85 mb-4 max-w-3xl mx-auto font-medium">
            Capacitando estudantes e professores através da aprendizagem interactiva
          </p>
          <p className="text-white/65 mb-12 max-w-2xl mx-auto leading-relaxed">
            Quizzes interactivos, exames resolvidos com LaTeX, vídeo-aulas e rankings — tudo numa única plataforma gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all">
                Começar Gratuitamente
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={handleSaberMais} className="border-white/30 text-white hover:bg-white/10 bg-transparent py-6 text-base rounded-xl">
              Saber Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features — fully clickable cards */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">O que oferecemos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tudo o que precisa para ter sucesso nos seus estudos, numa única plataforma.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, href, color }) => (
              <Link key={title} href={href}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{desc}</p>
                    <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-14 px-4 bg-primary text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1000+", label: "Exercícios Resolvidos", icon: BookOpen },
              { value: "500+", label: "Quizzes Disponíveis", icon: Award },
              { value: "100+", label: "Vídeo-Aulas", icon: Video },
              { value: "6+", label: "Disciplinas", icon: Users },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-white/80" />
                </div>
                <div className="text-3xl font-extrabold">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="sobre" className="py-20 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Sobre a Moz-Gondza</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Moz-Gondza nasceu da necessidade de criar uma plataforma educacional adaptada à realidade moçambicana. A nossa missão é democratizar o acesso à educação de qualidade, fornecendo ferramentas interactivas que ajudem os estudantes a atingir o seu máximo potencial.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A nossa visão é ser a principal plataforma educacional digital de Moçambique, contribuindo para a formação de uma geração de cidadãos bem preparados e capazes de enfrentar os desafios do mundo moderno.
              </p>
              <Link href="/registro">
                <Button className="bg-accent hover:bg-accent/90 text-white font-semibold">
                  Juntar-se à Comunidade <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "1000+", label: "Exercícios Resolvidos", href: "/exames" },
                { value: "500+", label: "Quizzes Disponíveis", href: "/quizzes" },
                { value: "100+", label: "Vídeo-Aulas", href: "/videos" },
                { value: "6+", label: "Disciplinas", href: "/publicacoes" },
              ].map(stat => (
                <Link key={stat.label} href={stat.href}>
                  <Card className="text-center p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-border">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section className="py-14 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Acesso Rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Exames", href: "/exames", icon: FileText },
              { label: "Quizzes", href: "/quizzes", icon: BookOpen },
              { label: "Vídeos", href: "/videos", icon: Video },
              { label: "Classificação", href: "/classificacao", icon: Trophy },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href}>
                <div className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer group">
                  <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">O que os nossos utilizadores dizem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.nome} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4 leading-relaxed">"{t.texto}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{t.nome}</p>
                    <p className="text-sm text-muted-foreground">{t.tipo}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-accent text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Junte-se à Moz-Gondza hoje e comece a aprender de forma mais inteligente!
          </h2>
          <p className="text-white/80 mb-8">Acesso gratuito a centenas de exercícios, quizzes e vídeo-aulas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="bg-white text-accent hover:bg-white/90 font-bold px-10">
                Criar Conta Gratuita
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent">
                Perguntas Frequentes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
