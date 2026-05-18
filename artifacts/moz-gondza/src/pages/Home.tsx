import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, BarChart2, FileText, Video, TrendingUp, BookMarked, ChevronRight, Star } from "lucide-react";
import Layout from "@/components/Layout";

const features = [
  { icon: BookOpen, title: "Quizzes Interactivos", desc: "Teste os seus conhecimentos com quizzes em tempo real, com feedback imediato e pontuação detalhada." },
  { icon: BarChart2, title: "Resultados Detalhados", desc: "Acompanhe o seu progresso com estatísticas detalhadas por disciplina e histórico de resultados." },
  { icon: FileText, title: "Exames Resolvidos", desc: "Aceda a exames nacionais resolvidos passo a passo, com explicações e equações matemáticas." },
  { icon: Video, title: "Vídeo-Aulas", desc: "Aprenda ao seu ritmo com vídeo-aulas de qualidade sobre todas as disciplinas do currículo." },
  { icon: TrendingUp, title: "Acompanhamento de Progresso", desc: "Visualize o seu progresso em cada disciplina e compare com outros estudantes." },
  { icon: BookMarked, title: "Publicações Académicas", desc: "Leia artigos e publicações académicas para aprofundar os seus conhecimentos." },
];

const testimonials = [
  { nome: "Maria Sitoe", tipo: "Estudante, 12ª Classe", texto: "O Moz-Gondza transformou a minha forma de estudar. Graças aos exames resolvidos, passei com distinção!", stars: 5 },
  { nome: "Prof. António Cossa", tipo: "Professor de Matemática", texto: "Uma ferramenta indispensável para os meus alunos. Os quizzes interactivos motivam-nos a estudar mais.", stars: 5 },
  { nome: "Carlos Muiambo", tipo: "Estudante, 11ª Classe", texto: "A plataforma é muito fácil de usar. Os vídeos e exercícios ajudaram-me muito a preparar os exames.", stars: 5 },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Moz-Gondza
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-4 max-w-3xl mx-auto">
            Capacitando estudantes e professores através da aprendizagem interactiva
          </p>
          <p className="text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed">
            Moz-Gondza é uma plataforma educacional que oferece quizzes interactivos, resultados detalhados, exames resolvidos e explicações passo a passo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
                Começar Gratuitamente
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#sobre">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                Saber Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">O que oferecemos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo o que precisa para ter sucesso nos seus estudos, numa única plataforma.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
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
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Juntar-se à Comunidade
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "1000+", label: "Exercícios Resolvidos" },
                { value: "500+", label: "Quizzes Disponíveis" },
                { value: "100+", label: "Vídeo-Aulas" },
                { value: "6", label: "Disciplinas" },
              ].map(stat => (
                <Card key={stat.label} className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
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
              <Card key={t.nome} className="p-6">
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
      <section className="py-20 px-4 bg-accent text-accent-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Junte-se à Moz-Gondza hoje e comece a aprender de forma mais inteligente!
          </h2>
          <p className="text-white/80 mb-8">
            Acesso gratuito a centenas de exercícios, quizzes e vídeo-aulas.
          </p>
          <Link href="/registro">
            <Button size="lg" className="bg-white text-accent hover:bg-white/90 font-semibold px-10">
              Criar Conta
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
