import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useGetQuiz, useSubmitQuiz } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Clock, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface Pergunta {
  id: number;
  texto: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
}

interface QuizResult {
  pontuacao: number;
  acertos: number;
  total: number;
  respostas: number[];
}

const DIFF_COLOR: Record<string, string> = { Fácil: "bg-green-100 text-green-800", Médio: "bg-yellow-100 text-yellow-800", Difícil: "bg-red-100 text-red-800" };

export default function QuizDetalhe({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<Set<number>>(new Set());

  const { data: quiz, isLoading } = useGetQuiz(parseInt(params.id), { query: { queryKey: ["quiz", params.id] } });
  const submitMutation = useSubmitQuiz();

  const perguntas = (quiz?.perguntas as Pergunta[]) ?? [];

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    const respostas = perguntas.map(p => answers[p.id] ?? -1);
    const acertos = respostas.filter((r, i) => r === perguntas[i].respostaCorreta).length;
    const pontuacao = Math.round((acertos / perguntas.length) * 100);
    setResult({ pontuacao, acertos, total: perguntas.length, respostas });
    if (isAuthenticated) {
      try {
        await submitMutation.mutateAsync({ id: parseInt(params.id), data: { respostas, tempoGasto: quiz?.tempLimite ? quiz.tempLimite - (timeLeft ?? 0) : 0 } });
      } catch { /* ignore */ }
    }
  }, [submitted, perguntas, answers, isAuthenticated, params.id, quiz, timeLeft, submitMutation]);

  useEffect(() => {
    if (started && quiz?.tempLimite) {
      setTimeLeft(quiz.tempLimite);
    }
  }, [started, quiz?.tempLimite]);

  useEffect(() => {
    if (!started || timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(t => (t ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, submitted, handleSubmit]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (isLoading) return <Layout><LoadingSpinner size="lg" /></Layout>;
  if (!quiz) return <Layout><div className="p-8 text-center">Quiz não encontrado.</div></Layout>;

  const currentPergunta = perguntas[currentQ];
  const answered = Object.keys(answers).length;
  const progress = perguntas.length > 0 ? (answered / perguntas.length) * 100 : 0;

  // Start screen
  if (!started) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/quizzes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Link>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{quiz.disciplina}</Badge>
                {quiz.dificuldade && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLOR[quiz.dificuldade]}`}>{quiz.dificuldade}</span>
                )}
              </div>
              <CardTitle className="text-2xl">{quiz.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.descricao && <p className="text-muted-foreground">{quiz.descricao}</p>}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{perguntas.length}</p>
                  <p className="text-sm text-muted-foreground">Perguntas</p>
                </div>
                {quiz.tempLimite && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(quiz.tempLimite / 60)} min</p>
                    <p className="text-sm text-muted-foreground">Tempo Limite</p>
                  </div>
                )}
              </div>
              {!isAuthenticated && (
                <Alert>
                  <AlertDescription>
                    <Link href="/login" className="text-primary font-medium hover:underline">Inicie sessão</Link> para guardar os seus resultados e ganhar pontos.
                  </AlertDescription>
                </Alert>
              )}
              <Button onClick={() => setStarted(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                Iniciar Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Results screen
  if (submitted && result) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Trophy className={`h-16 w-16 mx-auto mb-4 ${result.pontuacao >= 70 ? "text-yellow-500" : "text-muted-foreground"}`} />
              <h2 className="text-3xl font-bold text-foreground mb-2">{result.pontuacao}%</h2>
              <p className="text-muted-foreground mb-1">{result.acertos} de {result.total} respostas correctas</p>
              <Badge className={`text-sm ${result.pontuacao >= 70 ? "bg-green-500" : result.pontuacao >= 50 ? "bg-yellow-500" : "bg-red-500"} text-white`}>
                {result.pontuacao >= 70 ? "Excelente!" : result.pontuacao >= 50 ? "Bom trabalho!" : "Continue a praticar!"}
              </Badge>
            </CardContent>
          </Card>

          <div className="space-y-4 mb-6">
            {perguntas.map((p, i) => {
              const userAnswer = result.respostas[i];
              const correct = p.respostaCorreta;
              const isCorrect = userAnswer === correct;
              return (
                <Card key={p.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-3">
                      {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                      <p className="font-medium text-foreground">{p.texto}</p>
                    </div>
                    <div className="space-y-1 ml-7">
                      {p.opcoes.map((opt, idx) => (
                        <div key={idx} className={`text-sm px-3 py-1.5 rounded ${idx === correct ? "bg-green-100 text-green-800 font-medium" : idx === userAnswer && !isCorrect ? "bg-red-100 text-red-800" : "text-muted-foreground"}`}>
                          {String.fromCharCode(65 + idx)}. {opt}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowExplanation(prev => { const s = new Set(prev); s.has(p.id) ? s.delete(p.id) : s.add(p.id); return s; })} className="ml-7 mt-2 text-xs text-primary hover:underline">
                      {showExplanation.has(p.id) ? "Ocultar explicação" : "Ver explicação"}
                    </button>
                    {showExplanation.has(p.id) && <p className="ml-7 mt-2 text-sm text-muted-foreground bg-muted/40 p-3 rounded">{p.explicacao}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => { setStarted(false); setSubmitted(false); setAnswers({}); setCurrentQ(0); setResult(null); setTimeLeft(null); }} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" /> Tentar Novamente
            </Button>
            <Link href="/quizzes" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">Ver Outros Quizzes</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz screen
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground font-medium">Pergunta {currentQ + 1} de {perguntas.length}</span>
          {timeLeft !== null && (
            <span className={`flex items-center gap-1 text-sm font-mono font-semibold ${timeLeft < 60 ? "text-red-500" : "text-foreground"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
        <Progress value={(currentQ / perguntas.length) * 100} className="h-1.5 mb-6" />

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">{currentPergunta.texto}</h2>
            <div className="space-y-3">
              {currentPergunta.opcoes.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentPergunta.id]: idx }))}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium ${
                    answers[currentPergunta.id] === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(q => q - 1)}>Anterior</Button>
              {currentQ < perguntas.length - 1 ? (
                <Button onClick={() => setCurrentQ(q => q + 1)} className="bg-primary hover:bg-primary/90">
                  Próxima
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Submeter Quiz ({answered}/{perguntas.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question navigation */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {perguntas.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentQ(idx)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                idx === currentQ ? "ring-2 ring-primary ring-offset-2" : ""
              } ${answers[p.id] !== undefined ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
