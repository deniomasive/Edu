import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";

export default function Contacto() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setNome(""); setEmail(""); setAssunto(""); setMensagem("");
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">Contacte-nos</h1>
          <p className="text-muted-foreground">Estamos aqui para ajudar. Envie-nos uma mensagem e responderemos brevemente.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email", desc: "info@moz-gondza.mz", sub: "Respondemos em 24 horas" },
              { icon: Phone, title: "Telefone", desc: "+258 21 000 000", sub: "Segunda a Sexta, 8h-17h" },
              { icon: MapPin, title: "Endereço", desc: "Maputo, Moçambique", sub: "Capital da República" },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem Enviada!</h3>
                    <p className="text-muted-foreground mb-4">Obrigado pelo seu contacto. Responderemos em breve.</p>
                    <Button onClick={() => setSent(false)} variant="outline">Enviar outra mensagem</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="O seu nome" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="o-seu-email@exemplo.mz" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assunto">Assunto</Label>
                      <Input id="assunto" value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Assunto da mensagem" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem</Label>
                      <Textarea id="mensagem" value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Escreva a sua mensagem aqui..." required rows={5} className="resize-none" />
                    </div>
                    <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-primary/90">
                      {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A enviar...</> : "Enviar Mensagem"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
