import { useState } from "react";
import { useListVideos } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Play, Clock, Video } from "lucide-react";

const DISCIPLINAS = ["Matemática", "Física", "Química", "Biologia", "Português", "História"];

interface VideoItem {
  id: number;
  titulo: string;
  disciplina: string;
  descricao: string | null;
  youtubeId: string;
  duracao: string | null;
}

export default function Videos() {
  const [disciplina, setDisciplina] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const { data, isLoading } = useListVideos({ disciplina: disciplina || undefined, search: search || undefined, page, limit: 12 });
  const videos = (data?.data as VideoItem[]) ?? [];
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vídeo-Aulas</h1>
          <p className="text-muted-foreground">Aprenda ao seu ritmo com as nossas aulas em vídeo de alta qualidade.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar vídeos..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={disciplina} onValueChange={v => { setDisciplina(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Disciplina" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{total} vídeo(s) encontrado(s)</p>
            {videos.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum vídeo encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {videos.map(video => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                    <div className="relative bg-black aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.titulo}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-3 shadow-lg">
                          <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      {video.duracao && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {video.duracao}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{video.disciplina}</Badge>
                      <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{video.titulo}</h3>
                      {video.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.descricao}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {total > 12 && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 12)}</span>
                <Button variant="outline" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </>
        )}

        <Dialog open={!!selectedVideo} onOpenChange={open => !open && setSelectedVideo(null)}>
          {selectedVideo && (
            <DialogContent className="max-w-3xl p-0">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.titulo}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
              <div className="p-4">
                <DialogHeader>
                  <Badge variant="secondary" className="w-fit mb-1">{selectedVideo.disciplina}</Badge>
                  <DialogTitle>{selectedVideo.titulo}</DialogTitle>
                </DialogHeader>
                {selectedVideo.descricao && <p className="text-sm text-muted-foreground mt-2">{selectedVideo.descricao}</p>}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </Layout>
  );
}
