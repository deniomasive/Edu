import Layout from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "O que é o Moz-Gondza?", a: "O Moz-Gondza é uma plataforma educacional moçambicana que oferece exames nacionais resolvidos, quizzes interactivos, vídeo-aulas e publicações académicas, tudo em português, adaptado ao currículo moçambicano." },
  { q: "O acesso à plataforma é gratuito?", a: "Sim! O acesso básico à plataforma é completamente gratuito. Pode criar uma conta e aceder a todos os conteúdos disponíveis sem qualquer custo." },
  { q: "Que disciplinas estão disponíveis?", a: "Actualmente oferecemos conteúdos em Matemática, Física, Química, Biologia, Português e História, com foco no currículo do ensino secundário moçambicano (10ª a 12ª classe)." },
  { q: "Como funcionam os quizzes?", a: "Os quizzes são interactivos e cronometrados. Seleccione a disciplina e o nível de dificuldade desejado, responda às perguntas dentro do tempo limite e receba o resultado imediato com explicações detalhadas para cada resposta." },
  { q: "Como são calculados os pontos?", a: "Os pontos são atribuídos cada vez que completa um quiz ou exercício com sucesso. A pontuação depende do número de respostas correctas e do nível de dificuldade do quiz." },
  { q: "Posso aceder aos exames nacionais anteriores?", a: "Sim! Temos uma colecção crescente de exames nacionais resolvidos passo a passo. Pode filtrar por disciplina e ano para encontrar exactamente o que precisa." },
  { q: "Como posso contribuir com conteúdos?", a: "Pode contactar-nos através do formulário de contacto para propor a adição de exercícios, sugerir melhorias ou reportar erros. A sua contribuição é muito valiosa para melhorar a plataforma." },
  { q: "Existe aplicação móvel?", a: "Ainda não temos uma aplicação móvel, mas o Moz-Gondza foi desenvolvido com design responsivo, pelo que pode ser utilizado confortavelmente em qualquer dispositivo móvel através do navegador." },
  { q: "Como posso repor a minha palavra-passe?", a: "Na página de início de sessão, entre nas configurações da sua conta e utilize a opção 'Alterar Palavra-passe'. Se tiver dificuldades, contacte-nos através do formulário de contacto." },
];

export default function FAQ() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">Encontre respostas às dúvidas mais comuns sobre o Moz-Gondza.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-8 bg-muted/40 rounded-xl">
          <h3 className="font-semibold text-foreground mb-2">Não encontrou a resposta que procurava?</h3>
          <p className="text-sm text-muted-foreground mb-4">Entre em contacto connosco e teremos todo o gosto em ajudar.</p>
          <Link href="/contacto">
            <Button className="bg-primary hover:bg-primary/90">Contactar-nos</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
