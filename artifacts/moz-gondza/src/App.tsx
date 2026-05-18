import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import Dashboard from "@/pages/Dashboard";
import Exames from "@/pages/Exames";
import ExameDetalhe from "@/pages/ExameDetalhe";
import Quizzes from "@/pages/Quizzes";
import QuizDetalhe from "@/pages/QuizDetalhe";
import Videos from "@/pages/Videos";
import Publicacoes from "@/pages/Publicacoes";
import PublicacaoDetalhe from "@/pages/PublicacaoDetalhe";
import Classificacao from "@/pages/Classificacao";
import FAQ from "@/pages/FAQ";
import Contacto from "@/pages/Contacto";
import Termos from "@/pages/Termos";
import Notificacoes from "@/pages/Notificacoes";
import Perfil from "@/pages/Perfil";
import Configuracoes from "@/pages/Configuracoes";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Registro} />

      {/* Public content pages */}
      <Route path="/exames" component={Exames} />
      <Route path="/exames/:id">
        {(params) => <ExameDetalhe params={params} />}
      </Route>
      <Route path="/quizzes" component={Quizzes} />
      <Route path="/quizzes/:id">
        {(params) => <QuizDetalhe params={params} />}
      </Route>
      <Route path="/videos" component={Videos} />
      <Route path="/publicacoes" component={Publicacoes} />
      <Route path="/publicacoes/:id">
        {(params) => <PublicacaoDetalhe params={params} />}
      </Route>
      <Route path="/classificacao" component={Classificacao} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contacto" component={Contacto} />
      <Route path="/termos" component={Termos} />

      {/* Protected pages */}
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/notificacoes">
        <ProtectedRoute><Notificacoes /></ProtectedRoute>
      </Route>
      <Route path="/perfil">
        <ProtectedRoute><Perfil /></ProtectedRoute>
      </Route>
      <Route path="/configuracoes">
        <ProtectedRoute><Configuracoes /></ProtectedRoute>
      </Route>

      {/* Admin only */}
      <Route path="/admin">
        <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
