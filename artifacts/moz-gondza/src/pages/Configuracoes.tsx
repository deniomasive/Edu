import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpdateUser } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, Check, AlertCircle } from "lucide-react";

export default function Configuracoes() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const updateMutation = useUpdateUser();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) { setError("Preencha todos os campos."); return; }
    if (newPassword.length < 6) { setError("A nova palavra-passe deve ter pelo menos 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("As palavras-passe não coincidem."); return; }
    if (!user) return;
    try {
      await updateMutation.mutateAsync({ id: user.id, data: { password: newPassword } });
      setSuccess("Palavra-passe alterada com sucesso!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setError(apiErr?.data?.error || "Erro ao alterar palavra-passe.");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Alterar Palavra-passe</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPw">Palavra-passe Actual</Label>
                <Input id="currentPw" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPw">Nova Palavra-passe</Label>
                <Input id="newPw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPw">Confirmar Nova Palavra-passe</Label>
                <Input id="confirmPw" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a nova palavra-passe" />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A guardar...</> : "Guardar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="text-destructive text-base">Zona de Perigo</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Ao terminar sessão, será redirecionado para a página inicial.</p>
            <Button variant="destructive" onClick={logout}>Terminar Sessão</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
