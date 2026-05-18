import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">Moz-Gondza</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Plataforma educacional moçambicana dedicada a capacitar estudantes e professores através da aprendizagem interactiva.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navegação</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/exames" className="hover:text-white transition-colors">Exames</Link></li>
              <li><Link href="/quizzes" className="hover:text-white transition-colors">Quizzes</Link></li>
              <li><Link href="/videos" className="hover:text-white transition-colors">Vídeos</Link></li>
              <li><Link href="/publicacoes" className="hover:text-white transition-colors">Publicações</Link></li>
              <li><Link href="/classificacao" className="hover:text-white transition-colors">Classificação</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Suporte</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Utilização</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 mt-8 pt-6 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Moz-Gondza. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
