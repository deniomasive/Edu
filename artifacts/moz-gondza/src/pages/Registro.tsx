import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";

export default function Registro() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nome || !email || !password || !confirmPassword) { setError("Por favor, preencha todos os campos."); return; }
    if (nome.trim().length < 2) { setError("O nome deve ter pelo menos 2 caracteres."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Por favor, introduza um email válido."); return; }
    if (password.length < 6) { setError("A palavra-passe deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("As palavras-passe não coincidem."); return; }
    try {
      const result = await registerMutation.mutateAsync({ data: { nome, email, password } });
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string }; message?: string };
      setError(apiErr?.data?.error || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <BookOpen className="h-7 w-7" />
            Moz-Gondza
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>Junte-se à comunidade Moz-Gondza gratuitamente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" type="text" placeholder="O seu nome completo" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="o-seu-email@exemplo.mz" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                <Input id="confirmPassword" type="password" placeholder="Repita a palavra-passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A criar conta...</> : "Criar Conta Gratuitamente"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Iniciar sessão</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
