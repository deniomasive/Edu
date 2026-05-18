import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpdateUser } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Award, Edit3, Check, X, Loader2 } from "lucide-react";

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const updateMutation = useUpdateUser();

  if (!user) return null;

  const handleSave = async () => {
    setError("");
    try {
      const updated = await updateMutation.mutateAsync({ id: user.id, data: { nome, bio } });
      updateUser(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao actualizar perfil.");
    }
  };

  const handleCancel = () => { setNome(user.nome); setBio(user.bio ?? ""); setEditing(false); };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">O Meu Perfil</h1>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">Perfil actualizado com sucesso!</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Conte um pouco sobre si..." className="mt-1 resize-none" rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span className="ml-1">Guardar</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}><X className="h-4 w-4" /><span className="ml-1">Cancelar</span></Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-foreground">{user.nome}</h2>
                      {user.role === "admin" && <Badge className="bg-accent text-accent-foreground text-xs">Admin</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                    {user.bio ? <p className="text-sm text-foreground mt-2">{user.bio}</p> : <p className="text-sm text-muted-foreground italic">Sem biografia. Edite o seu perfil para adicionar uma.</p>}
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="mt-3">
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar Perfil
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Estatísticas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <Award className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.pontos}</p>
              <p className="text-xs text-muted-foreground">Pontos Totais</p>
            </div>
            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <User className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-sm font-medium text-foreground capitalize">{user.role === "admin" ? "Administrador" : "Utilizador"}</p>
              <p className="text-xs text-muted-foreground">Tipo de Conta</p>
            </div>
            <div className="col-span-2 text-center p-4 bg-muted/40 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Membro desde {new Date(user.createdAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
