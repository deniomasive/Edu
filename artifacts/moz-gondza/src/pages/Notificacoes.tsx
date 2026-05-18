import { useState } from "react";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCheck } from "lucide-react";

const TIPO_BADGE: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  sucesso: "bg-green-100 text-green-800",
  aviso: "bg-yellow-100 text-yellow-800",
  erro: "bg-red-100 text-red-800",
};

export default function Notificacoes() {
  const qc = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const [markingAll, setMarkingAll] = useState(false);

  const unread = notifications?.filter(n => !n.lida).length ?? 0;

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("moz-gondza-token");
      await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            <p className="text-sm text-muted-foreground">{unread} não lida(s)</p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
              <CheckCheck className="h-4 w-4 mr-2" /> Marcar todas como lidas
            </Button>
          )}
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <Card>
            <CardContent className="p-0">
              {!notifications || notifications.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <BellOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhuma notificação</p>
                  <p className="text-sm">Quando tiver notificações, aparecerão aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-4 p-5 transition-colors ${!n.lida ? "bg-primary/5" : "hover:bg-muted/20"}`}>
                      <div className={`p-2 rounded-full flex-shrink-0 ${!n.lida ? "bg-primary/10" : "bg-muted"}`}>
                        <Bell className={`h-4 w-4 ${!n.lida ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium ${!n.lida ? "text-foreground" : "text-muted-foreground"}`}>{n.titulo}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TIPO_BADGE[n.tipo] ?? "bg-gray-100 text-gray-800"}`}>{n.tipo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.mensagem}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(n.createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          {!n.lida && (
                            <button onClick={() => handleMarkRead(n.id)} className="text-xs text-primary hover:underline">
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                      {!n.lida && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
