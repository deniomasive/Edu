import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useListUsers, useListExames, useListQuizzes, useListVideos, useListPublicacoes,
  useCreateExame, useCreateQuiz, useCreateVideo, useCreatePublicacao,
  useDeleteExame, useDeleteQuiz, useDeleteVideo, useDeletePublicacao,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Users, FileText, BookOpen, Video, BookMarked, Trash2, Plus, Loader2, Check } from "lucide-react";

const DISCIPLINAS = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];

function StatCard({ icon: Icon, label, value, color }: { icon: React.FC<{ className?: string }>, label: string, value: number, color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");
  const showMsg = (text: string, type: "ok" | "err" = "ok") => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(""), 3000); };

  const { data: users, isLoading: loadUsers } = useListUsers();
  const { data: examesData } = useListExames({ page: 1, limit: 50 });
  const { data: quizzesData } = useListQuizzes({ page: 1, limit: 50 });
  const { data: videosData } = useListVideos({ page: 1, limit: 50 });
  const { data: pubsData } = useListPublicacoes({ page: 1, limit: 50 });

  const exames = examesData?.data ?? [];
  const quizzes = quizzesData?.data ?? [];
  const videos = (videosData?.data ?? []) as Array<{ id: number; titulo: string; disciplina: string; youtubeId: string; duracao: string | null }>;
  const pubs = pubsData?.data ?? [];

  const deleteExame = useDeleteExame();
  const deleteQuiz = useDeleteQuiz();
  const deleteVideo = useDeleteVideo();
  const deletePub = useDeletePublicacao();

  // Create Exame state
  const [eTitle, setETitle] = useState(""); const [eDisciplina, setEDisciplina] = useState(""); const [eAno, setEAno] = useState(""); const [eDescricao, setEDescricao] = useState("");
  const [eOpen, setEOpen] = useState(false);
  const createExame = useCreateExame();
  const handleCreateExame = async () => {
    try {
      await createExame.mutateAsync({ data: { titulo: eTitle, disciplina: eDisciplina, ano: parseInt(eAno), descricao: eDescricao, questoes: [] } });
      qc.invalidateQueries({ queryKey: ["/api/exames"] });
      setEOpen(false); setETitle(""); setEDisciplina(""); setEAno(""); setEDescricao("");
      showMsg("Exame criado com sucesso!");
    } catch { showMsg("Erro ao criar exame.", "err"); }
  };

  // Create Quiz state
  const [qTitle, setQTitle] = useState(""); const [qDisciplina, setQDisciplina] = useState(""); const [qDif, setQDif] = useState(""); const [qDesc, setQDesc] = useState(""); const [qOpen, setQOpen] = useState(false);
  const createQuiz = useCreateQuiz();
  const handleCreateQuiz = async () => {
    try {
      await createQuiz.mutateAsync({ data: { titulo: qTitle, disciplina: qDisciplina, dificuldade: qDif, descricao: qDesc, perguntas: [] } });
      qc.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setQOpen(false); setQTitle(""); setQDisciplina(""); setQDif(""); setQDesc("");
      showMsg("Quiz criado com sucesso!");
    } catch { showMsg("Erro ao criar quiz.", "err"); }
  };

  // Create Video state
  const [vTitle, setVTitle] = useState(""); const [vDisciplina, setVDisciplina] = useState(""); const [vDesc, setVDesc] = useState(""); const [vYtId, setVYtId] = useState(""); const [vDuracao, setVDuracao] = useState(""); const [vOpen, setVOpen] = useState(false);
  const createVideo = useCreateVideo();
  const handleCreateVideo = async () => {
    try {
      await createVideo.mutateAsync({ data: { titulo: vTitle, disciplina: vDisciplina, descricao: vDesc, youtubeId: vYtId, duracao: vDuracao || null } });
      qc.invalidateQueries({ queryKey: ["/api/videos"] });
      setVOpen(false); setVTitle(""); setVDisciplina(""); setVDesc(""); setVYtId(""); setVDuracao("");
      showMsg("Vídeo criado com sucesso!");
    } catch { showMsg("Erro ao criar vídeo.", "err"); }
  };

  // Create Publication state
  const [pTitle, setPTitle] = useState(""); const [pCategoria, setPCategoria] = useState(""); const [pResumo, setPResumo] = useState(""); const [pConteudo, setPConteudo] = useState(""); const [pAutor, setPAutor] = useState(""); const [pOpen, setPOpen] = useState(false);
  const createPub = useCreatePublicacao();
  const handleCreatePub = async () => {
    try {
      await createPub.mutateAsync({ data: { titulo: pTitle, categoria: pCategoria, resumo: pResumo, conteudo: pConteudo, autor: pAutor } });
      qc.invalidateQueries({ queryKey: ["/api/publicacoes"] });
      setPOpen(false); setPTitle(""); setPCategoria(""); setPResumo(""); setPConteudo(""); setPAutor("");
      showMsg("Publicação criada com sucesso!");
    } catch { showMsg("Erro ao criar publicação.", "err"); }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(`Confirma a eliminação deste ${type}?`)) return;
    try {
      if (type === "exame") { await deleteExame.mutateAsync({ id }); qc.invalidateQueries({ queryKey: ["/api/exames"] }); }
      if (type === "quiz") { await deleteQuiz.mutateAsync({ id }); qc.invalidateQueries({ queryKey: ["/api/quizzes"] }); }
      if (type === "vídeo") { await deleteVideo.mutateAsync({ id }); qc.invalidateQueries({ queryKey: ["/api/videos"] }); }
      if (type === "publicação") { await deletePub.mutateAsync({ id }); qc.invalidateQueries({ queryKey: ["/api/publicacoes"] }); }
      showMsg(`${type.charAt(0).toUpperCase() + type.slice(1)} eliminado!`);
    } catch { showMsg(`Erro ao eliminar ${type}.`, "err"); }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel de Administração</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.nome}</p>
          </div>
        </div>

        {msg && (
          <Alert className={`mb-4 ${msgType === "ok" ? "border-green-200 bg-green-50" : "border-destructive bg-destructive/10"}`}>
            {msgType === "ok" ? <Check className="h-4 w-4 text-green-600" /> : null}
            <AlertDescription className={msgType === "ok" ? "text-green-700" : "text-destructive"}>{msg}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Utilizadores" value={users?.length ?? 0} color="bg-blue-100 text-blue-600" />
          <StatCard icon={FileText} label="Exames" value={exames.length} color="bg-purple-100 text-purple-600" />
          <StatCard icon={BookOpen} label="Quizzes" value={quizzes.length} color="bg-yellow-100 text-yellow-600" />
          <StatCard icon={Video} label="Vídeos" value={videos.length} color="bg-red-100 text-red-600" />
          <StatCard icon={BookMarked} label="Publicações" value={pubs.length} color="bg-green-100 text-green-600" />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="exames">Exames</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="publicacoes">Publicações</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Utilizadores Registados</CardTitle></CardHeader>
              <CardContent className="p-0">
                {loadUsers ? <LoadingSpinner /> : (
                  <div className="divide-y divide-border">
                    {users?.map(u => (
                      <div key={u.id} className="flex items-center gap-4 px-6 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{u.nome}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{u.pontos} pts</span>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role === "admin" ? "Admin" : "User"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exames">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Exames</CardTitle>
                <Dialog open={eOpen} onOpenChange={setEOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="h-4 w-4 mr-1" /> Novo Exame</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Criar Novo Exame</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Título</Label><Input value={eTitle} onChange={e => setETitle(e.target.value)} className="mt-1" /></div>
                      <div><Label>Disciplina</Label>
                        <Select value={eDisciplina} onValueChange={setEDisciplina}><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                          <SelectContent>{DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Ano</Label><Input type="number" value={eAno} onChange={e => setEAno(e.target.value)} className="mt-1" /></div>
                      <div><Label>Descrição</Label><Textarea value={eDescricao} onChange={e => setEDescricao(e.target.value)} className="mt-1 resize-none" rows={2} /></div>
                      <Button onClick={handleCreateExame} disabled={createExame.isPending} className="w-full bg-primary hover:bg-primary/90">
                        {createExame.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Exame"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {exames.map(e => (
                    <div key={e.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{e.titulo}</p>
                        <p className="text-xs text-muted-foreground">{e.disciplina} · {e.ano}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("exame", e.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quizzes</CardTitle>
                <Dialog open={qOpen} onOpenChange={setQOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="h-4 w-4 mr-1" /> Novo Quiz</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Criar Novo Quiz</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Título</Label><Input value={qTitle} onChange={e => setQTitle(e.target.value)} className="mt-1" /></div>
                      <div><Label>Disciplina</Label>
                        <Select value={qDisciplina} onValueChange={setQDisciplina}><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                          <SelectContent>{DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Dificuldade</Label>
                        <Select value={qDif} onValueChange={setQDif}><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                          <SelectContent><SelectItem value="Fácil">Fácil</SelectItem><SelectItem value="Médio">Médio</SelectItem><SelectItem value="Difícil">Difícil</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label>Descrição</Label><Textarea value={qDesc} onChange={e => setQDesc(e.target.value)} className="mt-1 resize-none" rows={2} /></div>
                      <Button onClick={handleCreateQuiz} disabled={createQuiz.isPending} className="w-full bg-primary hover:bg-primary/90">
                        {createQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Quiz"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {quizzes.map(q => (
                    <div key={q.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{q.titulo}</p>
                        <p className="text-xs text-muted-foreground">{q.disciplina} · {q.dificuldade}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("quiz", q.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos */}
          <TabsContent value="videos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vídeos</CardTitle>
                <Dialog open={vOpen} onOpenChange={setVOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="h-4 w-4 mr-1" /> Novo Vídeo</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Vídeo</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Título</Label><Input value={vTitle} onChange={e => setVTitle(e.target.value)} className="mt-1" /></div>
                      <div><Label>Disciplina</Label>
                        <Select value={vDisciplina} onValueChange={setVDisciplina}><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                          <SelectContent>{DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>ID do YouTube</Label><Input value={vYtId} onChange={e => setVYtId(e.target.value)} placeholder="ex: dQw4w9WgXcQ" className="mt-1" /></div>
                      <div><Label>Duração (ex: 15:30)</Label><Input value={vDuracao} onChange={e => setVDuracao(e.target.value)} placeholder="00:00" className="mt-1" /></div>
                      <div><Label>Descrição</Label><Textarea value={vDesc} onChange={e => setVDesc(e.target.value)} className="mt-1 resize-none" rows={2} /></div>
                      <Button onClick={handleCreateVideo} disabled={createVideo.isPending} className="w-full bg-primary hover:bg-primary/90">
                        {createVideo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar Vídeo"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {videos.map(v => (
                    <div key={v.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{v.titulo}</p>
                        <p className="text-xs text-muted-foreground">{v.disciplina} · {v.youtubeId}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("vídeo", v.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publicações */}
          <TabsContent value="publicacoes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Publicações</CardTitle>
                <Dialog open={pOpen} onOpenChange={setPOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="h-4 w-4 mr-1" /> Nova Publicação</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Nova Publicação</DialogTitle></DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      <div><Label>Título</Label><Input value={pTitle} onChange={e => setPTitle(e.target.value)} className="mt-1" /></div>
                      <div><Label>Categoria</Label><Input value={pCategoria} onChange={e => setPCategoria(e.target.value)} placeholder="ex: Tecnologia" className="mt-1" /></div>
                      <div><Label>Autor</Label><Input value={pAutor} onChange={e => setPAutor(e.target.value)} className="mt-1" /></div>
                      <div><Label>Resumo</Label><Textarea value={pResumo} onChange={e => setPResumo(e.target.value)} className="mt-1 resize-none" rows={2} /></div>
                      <div><Label>Conteúdo</Label><Textarea value={pConteudo} onChange={e => setPConteudo(e.target.value)} className="mt-1 resize-none" rows={5} /></div>
                    </div>
                    <Button onClick={handleCreatePub} disabled={createPub.isPending} className="w-full bg-primary hover:bg-primary/90 mt-3">
                      {createPub.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pubs.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.titulo}</p>
                        <p className="text-xs text-muted-foreground">{p.categoria} · {p.autor}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("publicação", p.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
