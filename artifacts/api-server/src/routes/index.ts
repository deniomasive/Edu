import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import examesRouter from "./exames";
import quizzesRouter from "./quizzes";
import videosRouter from "./videos";
import publicacoesRouter from "./publicacoes";
import progressRouter from "./progress";
import leaderboardRouter from "./leaderboard";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(examesRouter);
router.use(quizzesRouter);
router.use(videosRouter);
router.use(publicacoesRouter);
router.use(progressRouter);
router.use(leaderboardRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;
