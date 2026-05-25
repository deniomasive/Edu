/**
 * Moz-Gondza Production Seed Script
 *
 * Idempotent — safe to run multiple times.
 * Only inserts records that do not already exist (checked by unique title/email).
 * Never wipes existing data.
 *
 * Run: pnpm --filter @workspace/scripts run seed
 * Env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  quizzesTable,
  examesTable,
  videosTable,
  publicacoesTable,
} from "@workspace/db";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

function q(
  id: number,
  texto: string,
  opcoes: [string, string, string, string],
  respostaCorreta: number,
  explicacao: string,
) {
  return { id, texto, opcoes, respostaCorreta, explicacao };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin user
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@moz-gondza.mz";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const nome = process.env.ADMIN_NAME ?? "Administrador";

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    log(`Admin already exists (${email}) — skipping`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(usersTable).values({
    nome,
    email,
    passwordHash,
    role: "admin",
    pontos: 500,
  });
  log(`Created admin: ${email}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo users
// ─────────────────────────────────────────────────────────────────────────────

async function seedDemoUsers() {
  const demos = [
    { nome: "Ana Silva", email: "ana@exemplo.mz", pontos: 320 },
    { nome: "Carlos Machava", email: "carlos@exemplo.mz", pontos: 210 },
    { nome: "Fátima Nhantumbo", email: "fatima@exemplo.mz", pontos: 180 },
    { nome: "João Tembe", email: "joao@exemplo.mz", pontos: 95 },
  ];

  for (const u of demos) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, u.email));
    if (existing) continue;
    const passwordHash = await bcrypt.hash("demo1234", 10);
    await db.insert(usersTable).values({ ...u, passwordHash, role: "user" });
    log(`Created demo user: ${u.email}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quizzes
// ─────────────────────────────────────────────────────────────────────────────

type Pergunta = {
  id: number;
  texto: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
};

type QuizSeed = {
  titulo: string;
  disciplina: string;
  dificuldade: string;
  descricao: string;
  tempLimite: number;
  perguntas: Pergunta[];
};

const QUIZZES: QuizSeed[] = [
  // ── MATEMÁTICA ─────────────────────────────────────────────────────────────
  {
    titulo: "Álgebra: Equações do 1º Grau",
    disciplina: "Matemática",
    dificuldade: "Fácil",
    descricao: "Resolução de equações lineares e sistemas simples.",
    tempLimite: 600,
    perguntas: [
      q(1, "Resolva $3x - 6 = 0$. O valor de $x$ é:", ["$x = 2$", "$x = 3$", "$x = -2$", "$x = 6$"], 0, "$3x = 6 \\Rightarrow x = 2$"),
      q(2, "Qual é a solução de $\\dfrac{x}{4} = 3$?", ["$x = 12$", "$x = 7$", "$x = 4/3$", "$x = 3/4$"], 0, "$x = 4 \\times 3 = 12$"),
      q(3, "Se $2x + 5 = 15$, então $x = $", ["$5$", "$10$", "$4$", "$7$"], 0, "$2x = 10 \\Rightarrow x = 5$"),
      q(4, "Resolva o sistema: $x + y = 5$ e $x - y = 1$.", ["$x=3,\\ y=2$", "$x=2,\\ y=3$", "$x=4,\\ y=1$", "$x=1,\\ y=4$"], 0, "Somando as equações: $2x = 6 \\Rightarrow x = 3$; então $y = 2$."),
      q(5, "O dobro de um número menos 4 é igual a 10. Qual é o número?", ["$7$", "$6$", "$8$", "$5$"], 0, "$2n - 4 = 10 \\Rightarrow n = 7$"),
    ],
  },
  {
    titulo: "Polinómios e Factorização",
    disciplina: "Matemática",
    dificuldade: "Médio",
    descricao: "Operações com polinómios, divisão e factorização.",
    tempLimite: 720,
    perguntas: [
      q(1, "O grau do polinómio $p(x) = 4x^3 - 2x + 7$ é:", ["$3$", "$4$", "$2$", "$1$"], 0, "O maior expoente é $3$, portanto grau $3$."),
      q(2, "Factorize $x^2 - 9$:", ["$(x-3)(x+3)$", "$(x-9)(x+1)$", "$(x-3)^2$", "$(x+3)^2$"], 0, "$x^2 - 9 = x^2 - 3^2 = (x-3)(x+3)$ — diferença de quadrados."),
      q(3, "Qual é o resultado de $(x+2)^2$?", ["$x^2 + 4x + 4$", "$x^2 + 4$", "$x^2 + 2x + 4$", "$x^2 - 4x + 4$"], 0, "$(a+b)^2 = a^2 + 2ab + b^2$, logo $(x+2)^2 = x^2 + 4x + 4$."),
      q(4, "Determine o quociente de $x^2 + 5x + 6$ dividido por $(x+2)$:", ["$x + 3$", "$x + 2$", "$x - 3$", "$x - 2$"], 0, "$x^2+5x+6 = (x+2)(x+3)$, logo o quociente é $x+3$."),
      q(5, "O valor de $p(2)$ para $p(x) = x^3 - 3x + 1$ é:", ["$3$", "$7$", "$1$", "$-1$"], 0, "$p(2) = 8 - 6 + 1 = 3$."),
    ],
  },
  {
    titulo: "Geometria: Áreas e Volumes",
    disciplina: "Matemática",
    dificuldade: "Fácil",
    descricao: "Cálculo de áreas de figuras planas e volumes de sólidos.",
    tempLimite: 600,
    perguntas: [
      q(1, "A área de um rectângulo de base $8$ cm e altura $5$ cm é:", ["$40\\ \\text{cm}^2$", "$26\\ \\text{cm}^2$", "$13\\ \\text{cm}^2$", "$20\\ \\text{cm}^2$"], 0, "$A = b \\times h = 8 \\times 5 = 40\\ \\text{cm}^2$"),
      q(2, "O volume de um cubo de aresta $3$ cm é:", ["$27\\ \\text{cm}^3$", "$9\\ \\text{cm}^3$", "$18\\ \\text{cm}^3$", "$54\\ \\text{cm}^3$"], 0, "$V = a^3 = 3^3 = 27\\ \\text{cm}^3$"),
      q(3, "A área de um círculo de raio $r$ é:", ["$\\pi r^2$", "$2\\pi r$", "$\\pi r$", "$2\\pi r^2$"], 0, "$A = \\pi r^2$ é a fórmula da área do círculo."),
      q(4, "O perímetro de um quadrado de lado $6$ cm é:", ["$24$ cm", "$36$ cm", "$12$ cm", "$6$ cm"], 0, "$P = 4l = 4 \\times 6 = 24$ cm"),
      q(5, "A área de um triângulo de base $10$ cm e altura $4$ cm é:", ["$20\\ \\text{cm}^2$", "$40\\ \\text{cm}^2$", "$14\\ \\text{cm}^2$", "$10\\ \\text{cm}^2$"], 0, "$A = \\dfrac{b \\times h}{2} = \\dfrac{10 \\times 4}{2} = 20\\ \\text{cm}^2$"),
    ],
  },
  {
    titulo: "Logaritmos e Exponenciais",
    disciplina: "Matemática",
    dificuldade: "Médio",
    descricao: "Propriedades dos logaritmos e funções exponenciais.",
    tempLimite: 720,
    perguntas: [
      q(1, "$\\log_2 8 = $", ["$3$", "$4$", "$2$", "$8$"], 0, "$2^3 = 8$, logo $\\log_2 8 = 3$."),
      q(2, "Propriedade: $\\log(a \\cdot b) = $", ["$\\log a + \\log b$", "$\\log a - \\log b$", "$\\log a \\cdot \\log b$", "$\\log(a+b)$"], 0, "Propriedade do produto: $\\log(ab) = \\log a + \\log b$."),
      q(3, "Se $e^x = 1$, então $x = $", ["$0$", "$1$", "$e$", "$-1$"], 0, "$e^0 = 1$, logo $x = 0$."),
      q(4, "$\\log_{10} 10^5 = $", ["$5$", "$10$", "$50$", "$1$"], 0, "$\\log_{10} 10^5 = 5 \\cdot \\log_{10} 10 = 5$."),
      q(5, "A função $f(x) = a^x$ com $a > 1$ é:", ["Crescente", "Decrescente", "Constante", "Nula"], 0, "Para $a > 1$, a exponencial $a^x$ é estritamente crescente."),
    ],
  },
  {
    titulo: "Números Complexos",
    disciplina: "Matemática",
    dificuldade: "Difícil",
    descricao: "Forma algébrica, módulo e operações com números complexos.",
    tempLimite: 900,
    perguntas: [
      q(1, "A unidade imaginária satisfaz: $i^2 = $", ["$-1$", "$1$", "$i$", "$0$"], 0, "Por definição, $i = \\sqrt{-1}$, portanto $i^2 = -1$."),
      q(2, "O módulo de $z = 3 + 4i$ é:", ["$5$", "$7$", "$1$", "$12$"], 0, "$|z| = \\sqrt{3^2 + 4^2} = \\sqrt{9+16} = \\sqrt{25} = 5$"),
      q(3, "O conjugado de $z = 2 - 3i$ é:", ["$2 + 3i$", "$-2 + 3i$", "$-2 - 3i$", "$3 - 2i$"], 0, "O conjugado inverte o sinal da parte imaginária: $\\bar{z} = 2 + 3i$."),
      q(4, "$(1+i)^2 = $", ["$2i$", "$2$", "$1+2i$", "$-2$"], 0, "$(1+i)^2 = 1 + 2i + i^2 = 1 + 2i - 1 = 2i$"),
      q(5, "A forma trigonométrica de $z = r(\\cos\\theta + i\\sin\\theta)$ tem argumento $\\theta$ para $z = i$:", ["$90°$", "$0°$", "$45°$", "$180°$"], 0, "$z = i$ tem $r=1$ e está no eixo imaginário positivo: $\\theta = 90°$."),
    ],
  },
  {
    titulo: "Geometria Analítica e Vectores",
    disciplina: "Matemática",
    dificuldade: "Médio",
    descricao: "Rectas, circunferências e operações vectoriais no plano.",
    tempLimite: 780,
    perguntas: [
      q(1, "A distância entre os pontos $A(1,2)$ e $B(4,6)$ é:", ["$5$", "$7$", "$3$", "$\\sqrt{7}$"], 0, "$d = \\sqrt{(4-1)^2 + (6-2)^2} = \\sqrt{9+16} = 5$"),
      q(2, "O declive de uma recta que passa por $(0,0)$ e $(3,6)$ é:", ["$2$", "$3$", "$1/2$", "$6$"], 0, "$m = \\dfrac{6-0}{3-0} = 2$"),
      q(3, "A equação da circunferência centrada na origem com raio $r$ é:", ["$x^2 + y^2 = r^2$", "$x^2 - y^2 = r^2$", "$y = x + r$", "$x^2 + y = r$"], 0, "Circunferência: $x^2 + y^2 = r^2$."),
      q(4, "O produto escalar de $\\vec{u} = (2,3)$ e $\\vec{v} = (1,-1)$ é:", ["$-1$", "$5$", "$1$", "$-5$"], 0, "$\\vec{u}\\cdot\\vec{v} = 2\\times1 + 3\\times(-1) = 2 - 3 = -1$"),
      q(5, "O ponto médio entre $A(2,4)$ e $B(6,8)$ é:", ["$(4,6)$", "$(3,5)$", "$(8,12)$", "$(2,4)$"], 0, "$M = \\left(\\dfrac{2+6}{2}, \\dfrac{4+8}{2}\\right) = (4,6)$"),
    ],
  },

  // ── FÍSICA ─────────────────────────────────────────────────────────────────
  {
    titulo: "Termodinâmica",
    disciplina: "Física",
    dificuldade: "Médio",
    descricao: "Leis da termodinâmica, calor, trabalho e entropia.",
    tempLimite: 720,
    perguntas: [
      q(1, "A 1ª Lei da Termodinâmica expressa:", ["Conservação de energia: $\\Delta U = Q - W$", "Entropia cresce", "Temperatura é absoluta", "Calor flui do frio para o quente"], 0, "$\\Delta U = Q - W$: variação de energia interna = calor absorvido − trabalho realizado."),
      q(2, "A escala Kelvin e Celsius relacionam-se por:", ["$T_K = T_C + 273$", "$T_K = T_C - 273$", "$T_K = T_C \\times 273$", "$T_K = T_C / 273$"], 0, "$0°C = 273 K$, logo $T_K = T_C + 273$."),
      q(3, "Um gás ideal a temperatura constante segue a lei de Boyle:", ["$P_1 V_1 = P_2 V_2$", "$P/T = \\text{const}$", "$V/T = \\text{const}$", "$PV/T = \\text{const}$"], 0, "Processo isotérmico (Boyle): $PV = \\text{const}$, logo $P_1V_1 = P_2V_2$."),
      q(4, "Eficiência de uma máquina de Carnot entre $T_Q = 500K$ e $T_F = 300K$:", ["$40\\%$", "$60\\%$", "$20\\%$", "$80\\%$"], 0, "$\\eta = 1 - \\dfrac{T_F}{T_Q} = 1 - \\dfrac{300}{500} = 0{,}4 = 40\\%$"),
      q(5, "A 2ª Lei da Termodinâmica afirma que a entropia de um sistema isolado:", ["Nunca diminui", "É sempre zero", "Diminui com o tempo", "É constante"], 0, "A entropia de sistemas isolados tende a aumentar (ou permanecer igual) — 2ª Lei."),
    ],
  },
  {
    titulo: "Electromagnetismo",
    disciplina: "Física",
    dificuldade: "Difícil",
    descricao: "Campos eléctrico e magnético, força de Lorentz e indução.",
    tempLimite: 900,
    perguntas: [
      q(1, "A Lei de Coulomb para a força entre duas cargas $q_1$ e $q_2$ separadas por $r$ é:", ["$F = k\\dfrac{q_1 q_2}{r^2}$", "$F = k\\dfrac{q_1 q_2}{r}$", "$F = k(q_1+q_2)r^2$", "$F = kq_1q_2r$"], 0, "$F = k\\dfrac{q_1 q_2}{r^2}$ com $k \\approx 9\\times10^9\\ \\text{N·m}^2\\text{/C}^2$."),
      q(2, "O campo eléctrico criado por uma carga puntual $q$ a distância $r$ é:", ["$E = k\\dfrac{q}{r^2}$", "$E = k\\dfrac{q}{r}$", "$E = kqr^2$", "$E = \\dfrac{r^2}{kq}$"], 0, "$E = k\\dfrac{q}{r^2}$ — campo é força por unidade de carga de teste."),
      q(3, "A Lei de Faraday relaciona f.e.m. induzida com:", ["Variação do fluxo magnético: $\\varepsilon = -\\dfrac{d\\Phi}{dt}$", "Corrente e resistência", "Força e velocidade", "Temperatura e resistência"], 0, "Indução electromagnética: $\\varepsilon = -\\dfrac{d\\Phi_B}{dt}$ (Lei de Faraday)."),
      q(4, "A força de Lorentz sobre uma carga $q$ com velocidade $v$ em campo $B$ é:", ["$F = qvB\\sin\\theta$", "$F = qvB\\cos\\theta$", "$F = q/vB$", "$F = vB/q$"], 0, "$F = qvB\\sin\\theta$, onde $\\theta$ é o ângulo entre $\\vec{v}$ e $\\vec{B}$."),
      q(5, "A unidade SI do campo magnético é:", ["Tesla (T)", "Weber (Wb)", "Henry (H)", "Farad (F)"], 0, "Campo magnético $B$ é medido em Tesla: $1\\ T = 1\\ \\text{kg/(A·s}^2)$."),
    ],
  },
  {
    titulo: "Óptica Geométrica",
    disciplina: "Física",
    dificuldade: "Fácil",
    descricao: "Reflexão, refracção, espelhos e lentes.",
    tempLimite: 600,
    perguntas: [
      q(1, "A Lei da Reflexão afirma que o ângulo de incidência é:", ["Igual ao ângulo de reflexão", "Maior que o ângulo de reflexão", "Menor que o ângulo de reflexão", "Independente do ângulo de reflexão"], 0, "Reflexão: $\\theta_i = \\theta_r$ (medidos em relação à normal)."),
      q(2, "A Lei de Snell relaciona índices e ângulos por:", ["$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$", "$n_1 \\cos\\theta_1 = n_2 \\cos\\theta_2$", "$n_1 \\theta_1 = n_2 \\theta_2$", "$n_1/n_2 = \\theta_2/\\theta_1$"], 0, "Lei de Snell: $n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$."),
      q(3, "Uma lente convergente (convexa) tem distância focal:", ["Positiva", "Negativa", "Zero", "Infinita"], 0, "Lentes convergentes têm $f > 0$; lentes divergentes têm $f < 0$."),
      q(4, "A equação de Gauss para espelhos e lentes é:", ["$\\dfrac{1}{f} = \\dfrac{1}{d_o} + \\dfrac{1}{d_i}$", "$f = d_o + d_i$", "$\\dfrac{1}{f} = d_o \\cdot d_i$", "$f = \\dfrac{d_o}{d_i}$"], 0, "Equação de Gauss: $\\dfrac{1}{f} = \\dfrac{1}{d_o} + \\dfrac{1}{d_i}$."),
      q(5, "O índice de refracção do vidro é aproximadamente:", ["$1{,}5$", "$1{,}0$", "$2{,}0$", "$3{,}0$"], 0, "Vidro comum tem $n \\approx 1{,}5$; ar tem $n \\approx 1{,}0$."),
    ],
  },

  // ── QUÍMICA ────────────────────────────────────────────────────────────────
  {
    titulo: "Estequiometria",
    disciplina: "Química",
    dificuldade: "Médio",
    descricao: "Cálculos estequiométricos, mole e balanceamento de equações.",
    tempLimite: 720,
    perguntas: [
      q(1, "O número de Avogadro é aproximadamente:", ["$6{,}022 \\times 10^{23}$", "$6{,}022 \\times 10^{22}$", "$3{,}14 \\times 10^{23}$", "$1{,}6 \\times 10^{-19}$"], 0, "$N_A \\approx 6{,}022 \\times 10^{23}$ entidades por mole."),
      q(2, "A equação $\\text{H}_2 + \\text{Cl}_2 \\to 2\\text{HCl}$ é:", ["Balanceada", "Não balanceada — falta Cl", "Não balanceada — excesso de H", "Impossível"], 0, "Contagem: 2H e 2Cl em cada lado — equação balanceada."),
      q(3, "Quantas moles há em $22{,}4$ L de gás ideal em CNPT?", ["$1$ mol", "$2$ mol", "$0{,}5$ mol", "$22{,}4$ mol"], 0, "Em CNPT (0°C, 1 atm), $1$ mol de gás ideal ocupa $22{,}4$ L."),
      q(4, "A massa molar da água $\\text{H}_2\\text{O}$ é:", ["$18\\ \\text{g/mol}$", "$16\\ \\text{g/mol}$", "$20\\ \\text{g/mol}$", "$2\\ \\text{g/mol}$"], 0, "$M(\\text{H}_2\\text{O}) = 2\\times1 + 16 = 18\\ \\text{g/mol}$"),
      q(5, "Quantas gramas há em $2$ mol de $\\text{CO}_2$ ($M = 44\\ \\text{g/mol}$)?", ["$88$ g", "$44$ g", "$22$ g", "$22{,}4$ g"], 0, "$m = n \\times M = 2 \\times 44 = 88$ g"),
    ],
  },
  {
    titulo: "Tabela Periódica e Propriedades",
    disciplina: "Química",
    dificuldade: "Fácil",
    descricao: "Organização da tabela periódica e tendências periódicas.",
    tempLimite: 540,
    perguntas: [
      q(1, "Os elementos do Grupo 1 (metais alcalinos) têm:", ["1 electrão de valência", "2 electrões de valência", "7 electrões de valência", "Valência zero"], 0, "Grupo 1 (Li, Na, K...): 1 electrão na última camada."),
      q(2, "O elemento com número atómico $Z = 6$ é:", ["Carbono (C)", "Oxigénio (O)", "Nitrogénio (N)", "Boro (B)"], 0, "Z=6: Carbono, no 2º período, grupo 14."),
      q(3, "Os gases nobres (Grupo 18) têm camada de valência:", ["Completa (8 electrões)", "Com 1 electrão", "Com 7 electrões", "Vazia"], 0, "Gases nobres: octeto completo (He tem 2), muito estáveis."),
      q(4, "A electronegatividade aumenta ao longo do período (linha) na tabela periódica:", ["Da esquerda para a direita", "Da direita para a esquerda", "De cima para baixo", "Não varia"], 0, "Electronegatividade aumenta da esquerda para a direita num período."),
      q(5, "O elemento mais electronegativo da tabela periódica é:", ["Flúor (F)", "Oxigénio (O)", "Cloro (Cl)", "Nitrogénio (N)"], 0, "O Flúor (F) é o elemento mais electronegativo (EN = 4,0 na escala de Pauling)."),
    ],
  },
  {
    titulo: "Cinética Química e Equilíbrio",
    disciplina: "Química",
    dificuldade: "Difícil",
    descricao: "Velocidade de reacção, factores e equilíbrio químico (Kc, Kp).",
    tempLimite: 900,
    perguntas: [
      q(1, "A velocidade de reacção é definida como:", ["Variação de concentração por unidade de tempo", "Quantidade de reactivos", "Temperatura da reacção", "Entalpia de reacção"], 0, "$v = \\dfrac{\\Delta[\\text{produto}]}{\\Delta t}$ ou $v = -\\dfrac{\\Delta[\\text{reactivo}]}{\\Delta t}$"),
      q(2, "Segundo o Princípio de Le Chatelier, aumentar a pressão num sistema gasoso desloca o equilíbrio para:", ["O lado com menos moles de gás", "O lado com mais moles de gás", "Nenhum lado", "O lado dos reactivos"], 0, "Aumento de pressão favorece o lado com menor número de moles gasosas."),
      q(3, "A constante de equilíbrio $K_c$ para $\\text{aA} + \\text{bB} \\rightleftharpoons \\text{cC} + \\text{dD}$ é:", ["$K_c = \\dfrac{[C]^c[D]^d}{[A]^a[B]^b}$", "$K_c = \\dfrac{[A]^a[B]^b}{[C]^c[D]^d}$", "$K_c = [C]+[D]-[A]-[B]$", "$K_c = [C]^c+[D]^d$"], 0, "$K_c$ é quociente: concentrações dos produtos sobre reactivos, com expoentes estequiométricos."),
      q(4, "A equação de Arrhenius relaciona constante de velocidade com temperatura:", ["$k = A\\,e^{-E_a/RT}$", "$k = E_a/RT$", "$k = A + E_aT$", "$k = A/RT$"], 0, "$k = A\\,e^{-E_a/RT}$ onde $E_a$ é energia de activação e $R$ é constante dos gases."),
      q(5, "Um catalisador:", ["Diminui a energia de activação sem ser consumido", "Aumenta a energia de activação", "Desloca o equilíbrio para os produtos", "É consumido na reacção"], 0, "Catalisador oferece caminho alternativo com menor $E_a$; não altera $\\Delta H$ nem $K$, e não é consumido."),
    ],
  },

  // ── BIOLOGIA ───────────────────────────────────────────────────────────────
  {
    titulo: "Fotossíntese e Respiração Celular",
    disciplina: "Biologia",
    dificuldade: "Médio",
    descricao: "Transformações energéticas nas plantas e células.",
    tempLimite: 660,
    perguntas: [
      q(1, "A equação geral da fotossíntese é:", ["$6CO_2 + 6H_2O \\xrightarrow{\\text{luz}} C_6H_{12}O_6 + 6O_2$", "$C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O$", "$H_2O \\to H_2 + O_2$", "$CO_2 + H_2 \\to CH_4$"], 0, "Fotossíntese: $6CO_2 + 6H_2O + \\text{energia luminosa} \\to C_6H_{12}O_6 + 6O_2$."),
      q(2, "A fotossíntese ocorre em qual organelo?", ["Cloroplasto", "Mitocôndria", "Núcleo", "Ribossoma"], 0, "Os cloroplastos contêm clorofila, o pigmento que capta luz solar."),
      q(3, "A respiração celular aeróbia produz:", ["ATP, CO₂ e H₂O", "ATP e O₂", "Glicose e O₂", "CO₂ apenas"], 0, "Glicose + O₂ → ATP (energia) + CO₂ + H₂O em três fases: glicólise, ciclo de Krebs e cadeia respiratória."),
      q(4, "O NADH e FADH₂ participam de qual fase da respiração celular?", ["Cadeia de transporte de electrões", "Glicólise", "Ciclo de Krebs apenas", "Fermentação"], 0, "NADH e FADH₂ doam electrões à cadeia transportadora nas cristas mitocondriais."),
      q(5, "A fermentação láctica ocorre quando:", ["Há escassez de oxigénio", "Há excesso de oxigénio", "A luz solar é intensa", "As mitocôndrias estão activas"], 0, "Fermentação: via anaeróbia para regenerar NAD⁺ em condições hipóxicas (ex: músculo em exercício intenso)."),
    ],
  },
  {
    titulo: "Evolução e Sistemática",
    disciplina: "Biologia",
    dificuldade: "Médio",
    descricao: "Teoria evolutiva de Darwin, selecção natural e classificação.",
    tempLimite: 660,
    perguntas: [
      q(1, "A selecção natural actua sobre:", ["Variações hereditárias que afectam a sobrevivência e reprodução", "Mutações não hereditárias", "O ambiente apenas", "A vontade do organismo"], 0, "Darwin: variações vantajosas hereditárias são seleccionadas — os mais aptos reproduzem mais."),
      q(2, "Espécies que partilham um ancestral comum recente são chamadas:", ["Grupos monofiléticos (clados)", "Espécies análogas", "Grupos parafiléticos", "Espécies convergentes"], 0, "Monofilético (clado): inclui o ancestral e todos os seus descendentes."),
      q(3, "A taxonomia de Lineu classifica os seres vivos em ordem decrescente:", ["Reino, Filo, Classe, Ordem, Família, Género, Espécie", "Espécie, Género, Família, Ordem, Classe, Filo, Reino", "Domínio, Espécie, Família", "Filo, Classe, Espécie"], 0, "Mnemónica: 'R F C O F G E' — Reino ao nível mais alto, espécie no mais baixo."),
      q(4, "A especiação alopátrica ocorre quando:", ["Populações são separadas geograficamente", "Populações coexistem no mesmo habitat", "Há hibridização", "O ambiente não muda"], 0, "Alopátrica: barreira geográfica impede fluxo génico → divergência gradual."),
      q(5, "A deriva génica tem maior efeito em populações:", ["Pequenas", "Grandes", "Com alta selecção", "Com alta migração"], 0, "Deriva génica (variações aleatórias de frequências alélicas) é mais pronunciada em populações pequenas."),
    ],
  },

  // ── PORTUGUÊS ──────────────────────────────────────────────────────────────
  {
    titulo: "Figuras de Estilo",
    disciplina: "Português",
    dificuldade: "Médio",
    descricao: "Identificação e uso das principais figuras de linguagem.",
    tempLimite: 600,
    perguntas: [
      q(1, "'O sol é um enorme laranjão' é um exemplo de:", ["Metáfora", "Comparação (símile)", "Personificação", "Hipérbole"], 0, "Metáfora: identifica o sol com laranjão sem usar 'como' ou 'tal como'."),
      q(2, "'Corriam mais rápido que o vento' é:", ["Comparação (símile)", "Metáfora", "Metonímia", "Ironia"], 0, "Símile/comparação: usa 'que' para aproximar dois elementos."),
      q(3, "'As pedras choravam de dor' é um caso de:", ["Personificação (prosopopeia)", "Metáfora", "Hipérbole", "Eufemismo"], 0, "Personificação: atribui características humanas (chorar) a seres inanimados (pedras)."),
      q(4, "'Não sou fraco — sou o homem mais forte do mundo!' é:", ["Ironia", "Hipérbole", "Antítese", "Eufemismo"], 0, "Ironia: afirmação contrária ao que se quer dizer, com tom sarcástico."),
      q(5, "A antítese consiste em:", ["Opor ideias ou palavras contrastantes", "Repetição de sons iniciais", "Omissão de palavras subentendidas", "Intensificação exagerada"], 0, "Antítese: aproximação de ideias opostas (ex: 'amor e ódio', 'vida e morte')."),
    ],
  },
  {
    titulo: "Conjugação Verbal e Modos",
    disciplina: "Português",
    dificuldade: "Fácil",
    descricao: "Tempos verbais, modos e conjugações regulares e irregulares.",
    tempLimite: 540,
    perguntas: [
      q(1, "O verbo 'correu' está em que tempo e modo?", ["Pretérito perfeito do indicativo", "Pretérito imperfeito", "Futuro do indicativo", "Conjuntivo"], 0, "Pretérito perfeito do indicativo: acção passada e concluída."),
      q(2, "'Se eu soubesse, diria a verdade' — o verbo sublinhado está no:", ["Pretérito imperfeito do conjuntivo", "Condicional (futuro do pretérito)", "Infinitivo", "Gerúndio"], 0, "Oração condicional hipotética usa pretérito imperfeito do conjuntivo: 'soubesse'."),
      q(3, "O imperativo de 'falar' na 2ª pessoa do singular (tu) é:", ["Fala!", "Fale!", "Falar!", "Falarás!"], 0, "Imperativo afirmativo de 'tu': perde o 's' final da 2ª pessoa — 'fala!'."),
      q(4, "O particípio passado de 'escrever' é:", ["Escrito", "Escrevido", "Escrevendo", "Escrever"], 0, "'Escrever' tem particípio irregular: 'escrito'."),
      q(5, "'Estou cantando' é um exemplo de:", ["Gerúndio (aspecto contínuo)", "Infinitivo", "Particípio", "Pretérito"], 0, "Gerúndio indica acção em curso: 'cantando' = aspecto progressivo."),
    ],
  },

  // ── HISTÓRIA ───────────────────────────────────────────────────────────────
  {
    titulo: "Primeira Guerra Mundial",
    disciplina: "História",
    dificuldade: "Médio",
    descricao: "Causas, desenvolvimento e consequências da 1ª Guerra Mundial (1914-1918).",
    tempLimite: 660,
    perguntas: [
      q(1, "O assassinato que desencadeou a 1ª GM ocorreu em:", ["Sarajevo, Junho de 1914", "Berlim, Agosto de 1914", "Paris, Julho de 1914", "Viena, 1913"], 0, "O arquiduque Francisco Fernando foi assassinado em Sarajevo a 28 de Junho de 1914."),
      q(2, "Os países da Tríplice Entente eram:", ["França, Reino Unido e Rússia", "Alemanha, Áustria-Hungria e Itália", "EUA, França e Alemanha", "Rússia, Turquia e Bulgária"], 0, "Entente: França, Reino Unido, Rússia (e mais tarde EUA e Itália)."),
      q(3, "O tratado que encerrou oficialmente a 1ª GM foi:", ["Tratado de Versalhes (1919)", "Tratado de Westfália", "Conferência de Berlim", "Paz de Viena"], 0, "Tratado de Versalhes, assinado em Junho de 1919, impôs pesadas condições à Alemanha."),
      q(4, "A guerra de trincheiras foi característica do frente:", ["Ocidental (França/Bélgica)", "Oriental (Rússia)", "Mediterrâneo", "Colonial"], 0, "No frente Ocidental, as linhas de trincheiras estenderam-se por centenas de km em impasse."),
      q(5, "A entrada dos EUA na guerra em 1917 deveu-se principalmente:", ["À guerra submarina alemã irrestrita", "A ataques em solo americano", "À Revolução Russa", "A alianças com França"], 0, "A guerra submarina alemã que afundava navios americanos levou o Congresso dos EUA a declarar guerra."),
    ],
  },
  {
    titulo: "Colonização e Descolonização de África",
    disciplina: "História",
    dificuldade: "Médio",
    descricao: "Partilha de África, movimentos de libertação e independências.",
    tempLimite: 660,
    perguntas: [
      q(1, "A Conferência de Berlim (1884-85) definiu:", ["A partilha colonial de África entre potências europeias", "A independência dos países africanos", "As fronteiras da 1ª GM", "O comércio de marfim"], 0, "Berlim: 14 nações europeias dividiram África sem consultar populações locais."),
      q(2, "O 'Scramble for Africa' (corrida a África) ocorreu principalmente em que século?", ["Século XIX", "Século XVIII", "Século XX", "Século XVI"], 0, "A corrida colonial intensificou-se na segunda metade do séc. XIX (1880-1914)."),
      q(3, "Moçambique obteve a independência de:", ["Portugal", "Reino Unido", "França", "Alemanha"], 0, "Moçambique foi colónia portuguesa e proclamou independência a 25 de Junho de 1975."),
      q(4, "A OUA (Organização da Unidade Africana) foi fundada em:", ["1963 em Adis Abeba", "1975 em Maputo", "1957 em Acra", "1945 em São Francisco"], 0, "OUA fundada em 1963 em Adis Abeba para promover solidariedade africana e descolonização."),
      q(5, "O principal líder da luta anti-apartheid na África do Sul foi:", ["Nelson Mandela", "Kwame Nkrumah", "Samora Machel", "Thomas Sankara"], 0, "Nelson Mandela liderou o ANC, esteve preso 27 anos e tornou-se Presidente em 1994."),
    ],
  },

  // ── GEOGRAFIA ──────────────────────────────────────────────────────────────
  {
    titulo: "Climatologia e Biomas",
    disciplina: "Geografia",
    dificuldade: "Fácil",
    descricao: "Tipos de clima, factores climáticos e biomas mundiais.",
    tempLimite: 600,
    perguntas: [
      q(1, "O clima equatorial caracteriza-se por:", ["Temperaturas elevadas e chuvas abundantes o ano todo", "Verões secos e invernos húmidos", "Frios intensos e pouca precipitação", "Quatro estações definidas"], 0, "Clima equatorial: junto ao Equador, muito húmido, sem estação seca, vegetação de floresta tropical."),
      q(2, "O bioma com maior diversidade de espécies é:", ["Floresta tropical", "Deserto", "Tundra", "Taiga"], 0, "Florestas tropicais (Amazónia, Congo, Bornéu): maior biodiversidade terrestre."),
      q(3, "Moçambique tem clima predominantemente:", ["Tropical húmido e subequatorial", "Mediterrâneo", "Árido", "Polar"], 0, "Grande parte de Moçambique tem clima tropical com estações chuvosa e seca."),
      q(4, "O factor que mais influencia o clima de uma região é:", ["Latitude", "Longitude", "Cor do solo", "Tipo de rocha"], 0, "Latitude determina a quantidade de energia solar recebida — o factor climático mais importante."),
      q(5, "A savana africana tem como característica:", ["Estação seca prolongada e vegetação de gramíneas e arbustos", "Chuvas constantes todo o ano", "Neve frequente", "Sem vegetação"], 0, "Savana: clima tropical com estação seca marcada, gramíneas altas e árvores esparsas (acácias, baobás)."),
    ],
  },
  {
    titulo: "Geomorfologia e Relevo",
    disciplina: "Geografia",
    dificuldade: "Médio",
    descricao: "Formação do relevo, tipos de rochas e processos geomorfológicos.",
    tempLimite: 660,
    perguntas: [
      q(1, "As placas tectónicas movem-se devido a:", ["Correntes de convecção no manto", "Rotação da Lua", "Vento solar", "Marés oceânicas"], 0, "O calor interno da Terra gera correntes de convecção no manto, movendo as placas litosféricas."),
      q(2, "Uma montanha formada por vulcanismo é chamada de:", ["Vulcão", "Horst", "Graben", "Planalto"], 0, "Vulcões: montanhas formadas por acumulação de material magmático extrudido."),
      q(3, "O relevo de Moçambique é dominado por:", ["Planícies costeiras e planaltos no interior", "Grandes cadeias montanhosas", "Desertos extensos", "Glaciares"], 0, "Moçambique tem planícies costeiras baixas (norte estreitas, centro/sul mais largas) e planaltos a oeste."),
      q(4, "Rochas formadas pela solidificação do magma são:", ["Ígneas (magmáticas)", "Sedimentares", "Metamórficas", "Orgânicas"], 0, "Ígneas: resultam do arrefecimento do magma (granito = intrusiva; basalto = extrusiva)."),
      q(5, "A erosão fluvial é causada principalmente por:", ["A acção das águas correntes dos rios", "O vento", "O gelo", "As ondas do mar"], 0, "Erosão fluvial: desgaste mecânico e químico causado pelo fluxo de água nos rios."),
    ],
  },

  // ── FILOSOFIA ──────────────────────────────────────────────────────────────
  {
    titulo: "Lógica: Proposições e Conectivos",
    disciplina: "Filosofia",
    dificuldade: "Médio",
    descricao: "Lógica proposicional: valores de verdade, conectivos e tabelas de verdade.",
    tempLimite: 660,
    perguntas: [
      q(1, "Uma proposição é uma frase que pode ser:", ["Verdadeira ou falsa", "Interrogativa apenas", "Exclamativa", "Imperativa"], 0, "Em lógica, proposição é enunciado declarativo com valor de verdade (V ou F)."),
      q(2, "A negação de 'P é verdadeiro' é:", ["'P é falso' (¬P = V quando P = F)", "'P e Q'", "'P ou Q'", "'Se P então Q'"], 0, "Negação: $\\neg P$ inverte o valor de verdade de $P$."),
      q(3, "A conjunção 'P ∧ Q' é verdadeira quando:", ["Ambas P e Q são verdadeiras", "Pelo menos uma é verdadeira", "P é verdadeira e Q é falsa", "Ambas são falsas"], 0, "$P \\land Q = V$ se e somente se $P = V$ e $Q = V$."),
      q(4, "A disjunção 'P ∨ Q' é falsa quando:", ["Ambas P e Q são falsas", "P é verdadeira", "Q é verdadeira", "Ambas são verdadeiras"], 0, "$P \\lor Q = F$ apenas quando $P = F$ e $Q = F$ (disjunção inclusiva)."),
      q(5, "A implicação 'P → Q' é falsa apenas quando:", ["P é verdadeira e Q é falsa", "Ambas são falsas", "Ambas são verdadeiras", "P é falsa e Q é verdadeira"], 0, "Implicação: $P \\to Q$ é falsa somente no caso $P = V$ e $Q = F$."),
    ],
  },
  {
    titulo: "Filosofia Grega e Grandes Correntes",
    disciplina: "Filosofia",
    dificuldade: "Fácil",
    descricao: "Sócrates, Platão, Aristóteles e as principais escolas filosóficas.",
    tempLimite: 600,
    perguntas: [
      q(1, "A maiêutica socrática consiste em:", ["Levar o interlocutor a descobrir a verdade por perguntas", "Escrever tratados filosóficos", "Observar a natureza", "Meditar em silêncio"], 0, "Sócrates usava o diálogo e perguntas progressivas para ajudar os outros a 'parir' o conhecimento."),
      q(2, "Platão argumentou que a realidade verdadeira existe no:", ["Mundo das Ideias (Formas)", "Mundo sensível (material)", "Mundo divino apenas", "Estado perfeito"], 0, "Platão: o mundo material é mera sombra; as Formas/Ideias são eternas e imutáveis."),
      q(3, "Aristóteles é conhecido por criar:", ["A lógica formal e a sistematização das ciências", "A teoria das Formas", "O método socrático", "O hedonismo"], 0, "Aristóteles: silogismo, categorias, ética das virtudes, física e biologia — enciclopedista."),
      q(4, "O estoicismo defende que a felicidade vem de:", ["Virtude e controlo das emoções (razão)", "Prazer sensorial máximo", "Riqueza e fama", "Conhecimento místico"], 0, "Estóicos: felicidade = virtude (areté) e equanimidade; aceitar o que não podemos controlar."),
      q(5, "O problema mente-corpo consiste em questionar:", ["Como a mente e o corpo se relacionam", "A existência de Deus", "A origem do universo", "A natureza da matemática"], 0, "Descartes: mente (res cogitans) e corpo (res extensa) — como interagem? Problema central da filosofia da mente."),
    ],
  },

  // ── INGLÊS ─────────────────────────────────────────────────────────────────
  {
    titulo: "English Grammar: Tenses",
    disciplina: "Inglês",
    dificuldade: "Médio",
    descricao: "Present Perfect, Simple Past, Future and conditional forms.",
    tempLimite: 600,
    perguntas: [
      q(1, "Choose the correct sentence using Present Perfect:", ["I have lived here for five years.", "I lived here for five years.", "I am living here since five years.", "I live here since five years."], 0, "Present Perfect with 'for' duration: 'have/has + past participle'. Action still ongoing."),
      q(2, "'If I were rich, I _____ travel the world.' Complete:", ["would", "will", "am", "have"], 0, "Second conditional (unreal present): 'If + past simple, ... would + infinitive'."),
      q(3, "The passive voice of 'The teacher explains the lesson' is:", ["The lesson is explained by the teacher.", "The lesson explains the teacher.", "The teacher is explained the lesson.", "The lesson was explaining."], 0, "Passive: 'Subject + to be + past participle + by + agent'."),
      q(4, "Which is the correct question form of 'She goes to school.'?", ["Does she go to school?", "Is she go to school?", "Does she goes to school?", "Do she go to school?"], 0, "Simple Present question: 'Does + subject + base verb?' (3rd person singular uses 'does')."),
      q(5, "'Despite the rain, they _____ the match.' Complete with the best option:", ["continued", "have continued", "are continuing", "were continuing to"], 0, "'Despite' + noun/gerund introduces contrast; Simple Past fits a completed narrative action."),
    ],
  },
  {
    titulo: "English Vocabulary and Reading",
    disciplina: "Inglês",
    dificuldade: "Fácil",
    descricao: "Common vocabulary, word formation and reading comprehension.",
    tempLimite: 540,
    perguntas: [
      q(1, "The antonym of 'expand' is:", ["Contract", "Extend", "Enlarge", "Grow"], 0, "'Expand' means to grow larger; 'contract' means to become smaller."),
      q(2, "The prefix 'un-' in 'unhappy' means:", ["Not", "Again", "Before", "After"], 0, "'Un-' is a negative prefix: unhappy = not happy."),
      q(3, "Choose the correct spelling:", ["Necessary", "Neccesary", "Necesary", "Neccessary"], 0, "'Necessary': one 'c' and two 's' — a common spelling mistake."),
      q(4, "'She works at a hospital.' The underlined word 'hospital' is a:", ["Noun", "Verb", "Adjective", "Adverb"], 0, "'Hospital' is a common noun — a place. Nouns name people, places, things or ideas."),
      q(5, "The synonym of 'happy' is:", ["Joyful", "Sad", "Angry", "Tired"], 0, "Synonyms have similar meanings: joyful ≈ happy ≈ cheerful ≈ content."),
    ],
  },

  // ── INFORMÁTICA ────────────────────────────────────────────────────────────
  {
    titulo: "Redes de Computadores e Internet",
    disciplina: "Informática",
    dificuldade: "Médio",
    descricao: "Protocolos, topologias e segurança em redes.",
    tempLimite: 660,
    perguntas: [
      q(1, "O protocolo HTTP opera na camada:", ["Aplicação (camada 7 do modelo OSI)", "Transporte", "Rede", "Ligação de dados"], 0, "HTTP/HTTPS: protocolo da camada de aplicação para transferência de hipertexto."),
      q(2, "O endereço IP identifica:", ["Um dispositivo na rede de forma única", "Uma página web", "Um protocolo", "Um sistema operativo"], 0, "IP (Internet Protocol): endereço numérico que identifica cada dispositivo numa rede (ex: 192.168.1.1)."),
      q(3, "A topologia em anel (ring) caracteriza-se por:", ["Cada nó conectado ao seguinte formando um círculo", "Um nó central ligado a todos", "Todos ligados a todos", "Ligação linear sem retorno"], 0, "Topologia em anel: dados circulam numa direcção; uma falha pode interromper toda a rede."),
      q(4, "SSL/TLS serve para:", ["Encriptação e segurança nas comunicações web", "Traduzir endereços IP em nomes", "Atribuir endereços IP automaticamente", "Rotear pacotes na internet"], 0, "SSL/TLS: protocolo criptográfico que garante confidencialidade e integridade (HTTPS usa TLS)."),
      q(5, "DNS significa:", ["Domain Name System", "Dynamic Network Service", "Data Naming Server", "Digital Network Standard"], 0, "DNS: traduz nomes de domínio (ex: moz-gondza.mz) em endereços IP."),
    ],
  },

  // ── ECONOMIA ───────────────────────────────────────────────────────────────
  {
    titulo: "Microeconomia: Oferta e Procura",
    disciplina: "Economia",
    dificuldade: "Médio",
    descricao: "Curvas de oferta e procura, elasticidade e equilíbrio de mercado.",
    tempLimite: 660,
    perguntas: [
      q(1, "A lei da procura afirma que, mantendo tudo o resto constante:", ["Quando o preço sobe, a quantidade procurada diminui", "Quando o preço sobe, a quantidade procurada aumenta", "O preço não afecta a procura", "A procura é sempre constante"], 0, "Lei da procura: relação inversa entre preço e quantidade procurada (curva descende)."),
      q(2, "O ponto de equilíbrio de mercado é onde:", ["A quantidade oferecida iguala a quantidade procurada", "O preço é máximo", "A oferta é zero", "Há escassez"], 0, "Equilíbrio: $Q_d = Q_o$ — mercado 'limpa', sem excesso nem escassez."),
      q(3, "A elasticidade-preço da procura mede:", ["Sensibilidade da quantidade procurada a variações de preço", "Variação da oferta com o preço", "Rendimento dos produtores", "Custo marginal"], 0, "$E_d = \\dfrac{\\%\\Delta Q_d}{\\%\\Delta P}$ — se $|E_d| > 1$: elástica; $|E_d| < 1$: inelástica."),
      q(4, "Um bem inferior é aquele cuja procura:", ["Diminui quando o rendimento aumenta", "Aumenta quando o rendimento aumenta", "Não se altera com o rendimento", "Só existe em monopólios"], 0, "Bem inferior: procura inversamente relacionada com o rendimento (ex: produtos de baixo custo)."),
      q(5, "O custo de oportunidade é:", ["O valor da melhor alternativa sacrificada", "O preço de mercado do bem", "O custo de produção", "O imposto sobre o bem"], 0, "Custo de oportunidade: valor do que se abdica ao fazer uma escolha — conceito central da economia."),
    ],
  },

  // ── ESTATÍSTICA ────────────────────────────────────────────────────────────
  {
    titulo: "Estatística Inferencial",
    disciplina: "Estatística",
    dificuldade: "Médio",
    descricao: "Inferência estatística, intervalos de confiança e testes de hipóteses.",
    tempLimite: 720,
    perguntas: [
      q(1, "Um intervalo de confiança de 95% significa:", ["Em 95% das amostras, o intervalo contém o parâmetro real", "Há 95% de probabilidade de o parâmetro ser o estimado", "A amostra é 95% representativa", "5% dos dados são excluídos"], 0, "Interpretação correcta: procedimento que, em 95% das repetições, produz intervalos que contêm o parâmetro."),
      q(2, "Na distribuição normal padrão, $P(-1{,}96 \\leq Z \\leq 1{,}96) \\approx$", ["$95\\%$", "$68\\%$", "$99\\%$", "$50\\%$"], 0, "Para $Z \\sim N(0,1)$: $\\pm 1{,}96$ captura $95\\%$ da distribuição; $\\pm 1$ captura $\\approx 68\\%$."),
      q(3, "O p-valor num teste de hipóteses é:", ["Probabilidade de obter resultados tão extremos se $H_0$ for verdadeira", "Probabilidade de $H_0$ ser verdadeira", "O nível de significância", "O tamanho da amostra"], 0, "p-valor: área na cauda da distribuição de referência assumindo $H_0$ verdadeira; p < α → rejeita $H_0$."),
      q(4, "O erro do Tipo I consiste em:", ["Rejeitar $H_0$ quando ela é verdadeira", "Não rejeitar $H_0$ quando ela é falsa", "Aceitar a hipótese alternativa", "Calcular mal a estatística"], 0, "Erro Tipo I (falso positivo): $P(\\text{Tipo I}) = \\alpha$ (nível de significância)."),
      q(5, "O teorema central do limite afirma que, para amostras grandes, a média amostral $\\bar{X}$ segue:", ["Distribuição normal, independentemente da distribuição da população", "Distribuição exponencial", "Distribuição da população original", "Distribuição qui-quadrado"], 0, "TLC: $\\bar{X} \\approx N\\!\\left(\\mu, \\dfrac{\\sigma^2}{n}\\right)$ para $n$ suficientemente grande."),
    ],
  },
  {
    titulo: "Distribuições de Probabilidade",
    disciplina: "Estatística",
    dificuldade: "Difícil",
    descricao: "Binomial, Poisson, normal e suas propriedades.",
    tempLimite: 900,
    perguntas: [
      q(1, "Uma variável binomial $X \\sim B(n,p)$ tem esperança:", ["$E[X] = np$", "$E[X] = n/p$", "$E[X] = p(1-p)$", "$E[X] = n+p$"], 0, "Binomial: $E[X] = np$ e $\\text{Var}(X) = np(1-p)$."),
      q(2, "A distribuição de Poisson é usada para modelar:", ["Número de eventos raros num intervalo fixo", "Distribuição de alturas humanas", "Resultados de um dado", "Distribuição contínua simétrica"], 0, "Poisson: eventos raros e independentes num intervalo (tempo, espaço). $P(X=k) = \\dfrac{\\lambda^k e^{-\\lambda}}{k!}$."),
      q(3, "Para $X \\sim N(\\mu, \\sigma^2)$, a padronização é:", ["$Z = \\dfrac{X - \\mu}{\\sigma}$", "$Z = \\dfrac{X + \\mu}{\\sigma}$", "$Z = \\dfrac{\\mu - X}{\\sigma^2}$", "$Z = X \\cdot \\sigma - \\mu$"], 0, "Padronização: $Z = (X-\\mu)/\\sigma$ transforma $X$ para $Z \\sim N(0,1)$."),
      q(4, "A distribuição qui-quadrado ($\\chi^2$) com $k$ graus de liberdade tem média:", ["$k$", "$k-1$", "$k/2$", "$\\sqrt{k}$"], 0, "$E[\\chi^2_k] = k$ e $\\text{Var}(\\chi^2_k) = 2k$."),
      q(5, "Se $X \\sim B(100, 0{,}02)$, pode aproximar-se por Poisson com $\\lambda = $", ["$2$", "$0{,}02$", "$100$", "$50$"], 0, "Poisson aproxima Binomial quando $n$ grande, $p$ pequeno: $\\lambda = np = 100 \\times 0{,}02 = 2$."),
    ],
  },

  // ── LÓGICA MATEMÁTICA ──────────────────────────────────────────────────────
  {
    titulo: "Lógica: Tabelas de Verdade e Tautologias",
    disciplina: "Lógica Matemática",
    dificuldade: "Médio",
    descricao: "Avaliação de proposições compostas, tautologias e contradições.",
    tempLimite: 720,
    perguntas: [
      q(1, "Uma tautologia é uma fórmula que é:", ["Sempre verdadeira", "Sempre falsa", "Verdadeira em metade dos casos", "Dependente do contexto"], 0, "Tautologia: verdadeira para todos os valores possíveis das variáveis (ex: $P \\lor \\neg P$)."),
      q(2, "A lei de De Morgan: $\\neg(P \\land Q) \\equiv $", ["$\\neg P \\lor \\neg Q$", "$\\neg P \\land \\neg Q$", "$P \\lor Q$", "$\\neg P \\to \\neg Q$"], 0, "De Morgan: $\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$ e $\\neg(P \\lor Q) \\equiv \\neg P \\land \\neg Q$."),
      q(3, "A contrapositiva de $P \\to Q$ é:", ["$\\neg Q \\to \\neg P$", "$Q \\to P$", "$\\neg P \\to \\neg Q$", "$\\neg P \\to Q$"], 0, "Contrapositiva é logicamente equivalente à original: $P \\to Q \\equiv \\neg Q \\to \\neg P$."),
      q(4, "$P \\leftrightarrow Q$ (bicondicional) é verdadeira quando:", ["P e Q têm o mesmo valor de verdade", "P é verdadeira e Q é falsa", "P é falsa e Q é verdadeira", "P ou Q são verdadeiras"], 0, "$P \\leftrightarrow Q = V$ quando ambas V ou ambas F."),
      q(5, "A negação de $\\forall x\\, P(x)$ é:", ["$\\exists x\\, \\neg P(x)$", "$\\forall x\\, \\neg P(x)$", "$\\neg \\forall x\\, P(x) = \\forall x\\, P(x)$", "$\\exists x\\, P(x)$"], 0, "Negação de universal: $\\neg(\\forall x\\, P(x)) \\equiv \\exists x\\, \\neg P(x)$."),
    ],
  },
  {
    titulo: "Conjuntos e Teoria dos Conjuntos",
    disciplina: "Lógica Matemática",
    dificuldade: "Fácil",
    descricao: "Operações com conjuntos: união, intersecção, complemento e diferença.",
    tempLimite: 600,
    perguntas: [
      q(1, "Se $A = \\{1,2,3\\}$ e $B = \\{2,3,4\\}$, então $A \\cap B = $", ["$\\{2,3\\}$", "$\\{1,2,3,4\\}$", "$\\{1,4\\}$", "$\\{\\}$"], 0, "Intersecção: elementos comuns a ambos os conjuntos."),
      q(2, "Se $A = \\{1,2,3\\}$ e $B = \\{2,3,4\\}$, então $A \\cup B = $", ["$\\{1,2,3,4\\}$", "$\\{2,3\\}$", "$\\{1,4\\}$", "$\\{1,2,3\\}$"], 0, "União: todos os elementos de $A$ e de $B$ (sem repetição)."),
      q(3, "O complemento de $A$ em relação ao universo $U$ é:", ["Todos os elementos de $U$ que não estão em $A$", "O próprio $A$", "Os elementos comuns a $A$ e $U$", "A união de $A$ com $U$"], 0, "$A^c = U \\setminus A = \\{x \\in U : x \\notin A\\}$."),
      q(4, "O número de subconjuntos de $A = \\{a,b,c\\}$ é:", ["$8$", "$6$", "$4$", "$3$"], 0, "Um conjunto com $n$ elementos tem $2^n$ subconjuntos. $2^3 = 8$."),
      q(5, "O conjunto vazio $\\emptyset$ é subconjunto de:", ["Todo e qualquer conjunto", "Apenas do conjunto universo", "Nenhum conjunto", "Apenas de si próprio"], 0, "$\\emptyset \\subseteq A$ para todo $A$ — o conjunto vazio é subconjunto de qualquer conjunto."),
    ],
  },
];

async function seedQuizzes() {
  let inserted = 0;
  for (const quiz of QUIZZES) {
    const [existing] = await db
      .select({ id: quizzesTable.id })
      .from(quizzesTable)
      .where(eq(quizzesTable.titulo, quiz.titulo));
    if (existing) continue;

    await db.insert(quizzesTable).values({
      titulo: quiz.titulo,
      disciplina: quiz.disciplina,
      dificuldade: quiz.dificuldade,
      descricao: quiz.descricao,
      tempLimite: quiz.tempLimite,
      perguntas: quiz.perguntas,
    });
    inserted++;
  }
  log(`Quizzes: inserted ${inserted} new, skipped ${QUIZZES.length - inserted} existing`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exames
// ─────────────────────────────────────────────────────────────────────────────

const EXAMES = [
  {
    titulo: "Exame Nacional de Matemática 2024",
    disciplina: "Matemática",
    ano: 2024,
    descricao: "Prova nacional de Matemática — 12ª classe 2024.",
    questoes: [
      { id: 1, texto: "Calcule as raízes de $x^2 - 4x + 3 = 0$.", resolucao: "Discriminante: $\\Delta = 16 - 12 = 4$. Raízes: $x = \\dfrac{4 \\pm 2}{2}$, logo $x_1 = 3$ e $x_2 = 1$.", resposta: "$x = 1$ ou $x = 3$" },
      { id: 2, texto: "Determine $\\lim_{x \\to 0} \\dfrac{\\sin x}{x}$.", resolucao: "Limite fundamental trigonométrico: $\\displaystyle\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$.", resposta: "$1$" },
      { id: 3, texto: "Calcule $\\int_0^2 (3x^2 + 2x)\\,dx$.", resolucao: "$\\left[x^3 + x^2\\right]_0^2 = (8+4) - 0 = 12$", resposta: "$12$" },
    ],
  },
  {
    titulo: "Exame Nacional de Física 2024",
    disciplina: "Física",
    ano: 2024,
    descricao: "Prova nacional de Física — 12ª classe 2024.",
    questoes: [
      { id: 1, texto: "Um corpo de massa $m = 5\\,\\text{kg}$ é acelerado por $F = 20\\,\\text{N}$. Calcule a aceleração.", resolucao: "Pela 2ª Lei de Newton: $a = F/m = 20/5 = 4\\,\\text{m/s}^2$", resposta: "$4\\,\\text{m/s}^2$" },
      { id: 2, texto: "Um gás ocupa $V_1 = 2\\,\\text{L}$ a $P_1 = 3\\,\\text{atm}$. Calcule $V_2$ se $P_2 = 6\\,\\text{atm}$ (temperatura constante).", resolucao: "Lei de Boyle: $P_1V_1 = P_2V_2 \\Rightarrow V_2 = \\dfrac{3 \\times 2}{6} = 1\\,\\text{L}$", resposta: "$1\\,\\text{L}$" },
    ],
  },
  {
    titulo: "Exame Nacional de Química 2024",
    disciplina: "Química",
    ano: 2024,
    descricao: "Prova nacional de Química — 12ª classe 2024.",
    questoes: [
      { id: 1, texto: "Quantas moles há em $36\\,\\text{g}$ de água ($M = 18\\,\\text{g/mol}$)?", resolucao: "$n = m/M = 36/18 = 2\\,\\text{mol}$", resposta: "$2\\,\\text{mol}$" },
      { id: 2, texto: "Balanceie: $\\text{H}_2 + \\text{O}_2 \\to \\text{H}_2\\text{O}$", resolucao: "Equação balanceada: $2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$", resposta: "$2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$" },
    ],
  },
];

async function seedExames() {
  let inserted = 0;
  for (const exame of EXAMES) {
    const [existing] = await db
      .select({ id: examesTable.id })
      .from(examesTable)
      .where(eq(examesTable.titulo, exame.titulo));
    if (existing) continue;
    await db.insert(examesTable).values(exame);
    inserted++;
  }
  log(`Exames: inserted ${inserted} new, skipped ${EXAMES.length - inserted} existing`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Videos
// ─────────────────────────────────────────────────────────────────────────────

const VIDEOS = [
  { titulo: "Equações do 2º Grau - Resolução Completa", disciplina: "Matemática", descricao: "Aprenda a resolver equações quadráticas com a fórmula de Bhaskara e discriminante.", youtubeId: "3MqYE2UuN24", duracao: "18:32" },
  { titulo: "Leis de Newton - Explicação Detalhada", disciplina: "Física", descricao: "As três leis de Newton com exemplos práticos e exercícios resolvidos.", youtubeId: "by5XMpNvLLg", duracao: "22:15" },
  { titulo: "Reacções Químicas e Balanceamento", disciplina: "Química", descricao: "Como balancear equações químicas passo a passo com exemplos variados.", youtubeId: "cCxNOm3QBRE", duracao: "15:48" },
  { titulo: "A Célula - Estrutura e Organelos", disciplina: "Biologia", descricao: "Estrutura celular eucariótica e procariótica, organelos e suas funções.", youtubeId: "8IlzKri08kU", duracao: "20:05" },
  { titulo: "Análise de Texto - Figuras de Estilo", disciplina: "Português", descricao: "Identificação e uso das principais figuras de linguagem com exemplos literários.", youtubeId: "QgSA3ANGVMU", duracao: "16:30" },
  { titulo: "Primeira Guerra Mundial - Causas e Consequências", disciplina: "História", descricao: "Causas, frentes de batalha, tratado de Versalhes e impacto na Europa.", youtubeId: "dHSQAEam2yc", duracao: "25:10" },
  { titulo: "Funções e Gráficos", disciplina: "Matemática", descricao: "Domínio, contradomínio, imagem e estudo gráfico de funções reais.", youtubeId: "kvGsIo1TmsM", duracao: "19:45" },
  { titulo: "Termodinâmica - Conceitos Fundamentais", disciplina: "Física", descricao: "1ª e 2ª Leis da Termodinâmica, ciclos e máquinas térmicas.", youtubeId: "9Jh9IYjTFWg", duracao: "21:30" },
  { titulo: "Tabela Periódica e Propriedades dos Elementos", disciplina: "Química", descricao: "Organização, tendências periódicas e propriedades dos grupos principais.", youtubeId: "0RRVV4Diomg", duracao: "17:20" },
  { titulo: "Genética Mendeliana", disciplina: "Biologia", descricao: "Leis de Mendel, cruzamentos, genótipos e fenótipos.", youtubeId: "MIFmhE8CbgQ", duracao: "23:45" },
  { titulo: "Climatologia e Biomas Africanos", disciplina: "Geografia", descricao: "Tipos de clima, factores climáticos e biomas característicos de Moçambique e África.", youtubeId: "3WT8KZCE8HM", duracao: "14:55" },
  { titulo: "Independência de Moçambique", disciplina: "História", descricao: "Luta de libertação, papel da FRELIMO e proclamação da independência em 1975.", youtubeId: "N5mVbdpGPOo", duracao: "20:00" },
];

async function seedVideos() {
  let inserted = 0;
  for (const video of VIDEOS) {
    const [existing] = await db
      .select({ id: videosTable.id })
      .from(videosTable)
      .where(eq(videosTable.titulo, video.titulo));
    if (existing) continue;
    await db.insert(videosTable).values(video);
    inserted++;
  }
  log(`Videos: inserted ${inserted} new, skipped ${VIDEOS.length - inserted} existing`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Publicações
// ─────────────────────────────────────────────────────────────────────────────

const PUBLICACOES = [
  {
    titulo: "O Impacto da Tecnologia na Educação Moçambicana",
    categoria: "Tecnologia",
    resumo: "Como as novas tecnologias estão a transformar o acesso à educação em Moçambique.",
    autor: "Equipa Moz-Gondza",
    imagem: null,
    conteudo: `A tecnologia tem o potencial de democratizar o acesso à educação em Moçambique. Com a penetração crescente do telemóvel e da internet, plataformas como o Moz-Gondza permitem que estudantes das províncias mais remotas acedam a conteúdos de qualidade.

O ensino adaptativo — que ajusta a dificuldade dos exercícios ao nível do aluno — é uma das inovações mais promissoras. Em combinação com videotecas e quizzes interactivos, esta abordagem pode transformar a preparação para os exames nacionais.

A aprendizagem por reforço positivo, com pontuações e classificações públicas, motiva os alunos a manterem consistência no estudo. Este relatório explora casos de sucesso e desafios na implementação de edTech em contexto africano.`,
  },
  {
    titulo: "Estratégias para o Sucesso no Exame Nacional",
    categoria: "Estudo",
    resumo: "Técnicas comprovadas de estudo e gestão do tempo para maximizar a pontuação nos exames.",
    autor: "Equipa Moz-Gondza",
    imagem: null,
    conteudo: `Preparar-se para o exame nacional requer mais do que memorizar conteúdos. As estratégias abaixo foram comprovadas por estudantes de alto desempenho:

**1. Estudo distribuído no tempo**
Evite maratonas de estudo. Sessões de 45 minutos com pausas de 10 minutos (técnica Pomodoro) são significativamente mais eficazes.

**2. Resolução de exames anteriores**
Praticar com exames de anos anteriores habitua-se ao formato das perguntas e identifica lacunas no conhecimento.

**3. Grupos de estudo**
Explicar conceitos a colegas consolida a compreensão e identifica gaps no raciocínio.

**4. Revisão activa**
Em vez de reler apontamentos, faça perguntas a si próprio — flashcards e quizzes são mais eficazes que a leitura passiva.

**5. Gestão do tempo no exame**
Leia todas as perguntas primeiro. Responda às mais fáceis e regresse às difíceis. Reserve 10 minutos para revisão.`,
  },
  {
    titulo: "História da Educação em Moçambique",
    categoria: "História",
    resumo: "Da era colonial até ao sistema educativo pós-independência e as reformas actuais.",
    autor: "Equipa Moz-Gondza",
    imagem: null,
    conteudo: `A educação em Moçambique passou por transformações radicais ao longo do século XX. Durante o período colonial português, o acesso à educação era extremamente restrito para a população africana — apenas uma elite seleccionada tinha acesso ao ensino secundário.

Após a independência em 1975, a FRELIMO implementou campanhas massivas de alfabetização, reduzindo drasticamente o analfabetismo. O Sistema Nacional de Educação (SNE) foi criado em 1983, introduzindo ensino público e gratuito.

As reformas dos anos 1990 e 2000 trouxeram descentralização e envolvimento do sector privado. Hoje, Moçambique enfrenta desafios na qualidade do ensino, especialmente nas áreas rurais, com iniciativas como o Moz-Gondza a contribuir para a democratização do acesso a recursos educativos de qualidade.`,
  },
  {
    titulo: "Matemática no Quotidiano Africano",
    categoria: "Matemática",
    resumo: "Como a matemática está presente na cultura, arquitectura e negócios tradicionais africanos.",
    autor: "Equipa Moz-Gondza",
    imagem: null,
    conteudo: `A matemática está profundamente enraizada nas culturas africanas, muito antes da chegada dos sistemas de ensino europeus. Os fractais nas aldeias africanas, os padrões geométricos dos tecidos capulanas e os sistemas de contagem tradicionais são exemplos disso.

O comércio nos mercados de Maputo, Beira e Nampula envolve cálculos de preços, margens, câmbio e dividendos — matemática financeira aplicada no dia-a-dia. A carpintaria tradicional usa proporcionalidade e geometria implícita.

Este artigo explora como conectar o currículo matemático à realidade moçambicana pode aumentar o envolvimento dos alunos e tornar o aprendizado mais significativo.`,
  },
  {
    titulo: "Guia de Estudo: Física para o Exame Nacional",
    categoria: "Estudo",
    resumo: "Resumo dos tópicos mais frequentes em Física e como abordá-los eficazmente.",
    autor: "Equipa Moz-Gondza",
    imagem: null,
    conteudo: `**Tópicos mais frequentes em Física (12ª classe)**

A análise de exames nacionais dos últimos 10 anos revela padrões claros:

**Mecânica (30% das perguntas)**
- Cinemática: MRU, MRUV, queda livre
- Dinâmica: Leis de Newton, atrito, trabalho e energia
- Fluidos: pressão, empuxo (Arquimedes)

**Termodinâmica (20%)**
- Leis dos gases ideais
- Calor e temperatura
- 1ª e 2ª Leis da Termodinâmica

**Electromagnetismo (25%)**
- Lei de Ohm, circuitos
- Campo eléctrico e magnético
- Indução electromagnética (Faraday)

**Óptica (15%)**
- Reflexão e refracção
- Espelhos e lentes (equação de Gauss)

**Ondas e Som (10%)**
- Propriedades das ondas
- Efeito Doppler

**Dica:** Domine as fórmulas fundamentais e pratique com dimensões (análise dimensional) para verificar as respostas.`,
  },
];

async function seedPublicacoes() {
  let inserted = 0;
  for (const pub of PUBLICACOES) {
    const [existing] = await db
      .select({ id: publicacoesTable.id })
      .from(publicacoesTable)
      .where(eq(publicacoesTable.titulo, pub.titulo));
    if (existing) continue;
    await db.insert(publicacoesTable).values(pub);
    inserted++;
  }
  log(`Publicações: inserted ${inserted} new, skipped ${PUBLICACOES.length - inserted} existing`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }

  log("Starting idempotent seed...");
  log(`Database: ${process.env.DATABASE_URL.replace(/:\/\/[^@]+@/, "://<credentials>@")}`);

  await seedAdmin();
  await seedDemoUsers();
  await seedQuizzes();
  await seedExames();
  await seedVideos();
  await seedPublicacoes();

  log("Seed complete! ✓");
}

main()
  .catch((err) => {
    console.error("[seed] ERROR:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
