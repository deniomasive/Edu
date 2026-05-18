import Layout from "@/components/Layout";

export default function Termos() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Utilização</h1>
        <p className="text-muted-foreground mb-8">Última actualização: Janeiro de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {[
            { title: "1. Aceitação dos Termos", text: "Ao utilizar a plataforma Moz-Gondza, você concorda em cumprir estes Termos de Utilização. Se não concordar com estes termos, por favor não utilize a plataforma. O Moz-Gondza reserva-se o direito de modificar estes termos a qualquer momento, sendo que as alterações entram em vigor imediatamente após a publicação." },
            { title: "2. Utilização da Plataforma", text: "O Moz-Gondza é uma plataforma educacional destinada a estudantes e professores moçambicanos. A utilização da plataforma deve ser feita de forma responsável e ética. É proibido partilhar as credenciais de acesso com terceiros, publicar conteúdos ofensivos ou ilegais, tentar comprometer a segurança da plataforma ou usar a plataforma para fins comerciais sem autorização prévia." },
            { title: "3. Conta de Utilizador", text: "Para aceder a certas funcionalidades, é necessário criar uma conta. Você é responsável por manter a confidencialidade da sua palavra-passe e por todas as actividades realizadas com a sua conta. Notifique-nos imediatamente em caso de uso não autorizado da sua conta." },
            { title: "4. Propriedade Intelectual", text: "Todo o conteúdo disponível no Moz-Gondza, incluindo textos, imagens, vídeos e exercícios, é protegido por direitos de autor. Não é permitida a reprodução ou distribuição do conteúdo sem autorização expressa do Moz-Gondza." },
            { title: "5. Privacidade e Dados Pessoais", text: "Os seus dados pessoais são tratados de acordo com a nossa Política de Privacidade. Recolhemos apenas os dados necessários para fornecer os nossos serviços e nunca os partilhamos com terceiros sem o seu consentimento, salvo quando exigido por lei." },
            { title: "6. Limitação de Responsabilidade", text: "O Moz-Gondza fornece os conteúdos na plataforma com base no melhor conhecimento disponível, mas não garante a sua precisão absoluta. A plataforma não é responsável por quaisquer danos directos ou indirectos resultantes da utilização dos conteúdos disponíveis." },
            { title: "7. Contacto", text: "Para questões relacionadas com estes Termos de Utilização, por favor contacte-nos através do formulário de contacto disponível na plataforma ou por email para info@moz-gondza.mz." },
          ].map(section => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
