import { Router } from "express";
import userRouter from "./user.router";
import eventRouter from "./event.router";
import organiserRouter from "./organiser.router";
import areaRouter from "./areas.router";
import schoolRouter from "./schools.router";
import localityRouter from "./locality.router";
import leadershipRoleRouter from "./leadership_role.router";
import committeeRouter from "./committe.router";
import registrationRouter from "./registration.router";
import eventLeaderRouter from "./event_leaders.router";
import eventCommitteeRouter from "./event_committe.router";
import eventCommitteeAgendaRouter from "./event_committe_agenda.router";
import generalDocumentRouter from "./general_document.router";
import countryRouter from "./countries.router";
import testRouter from "./test.router";

const router = Router();

// Route handlers
router.use("/users", userRouter);
router.use("/events", eventRouter);
router.use("/organisers", organiserRouter);
router.use("/areas", areaRouter);
router.use("/schools", schoolRouter);
router.use("/localities", localityRouter);
router.use("/leadership-roles", leadershipRoleRouter);
router.use("/committees", committeeRouter);
router.use("/registerations", registrationRouter);
router.use("/event-leaders", eventLeaderRouter);
router.use("/event-committees", eventCommitteeRouter);
router.use("/event-committees-agendas", eventCommitteeAgendaRouter);
router.use("/general-documents", generalDocumentRouter);
router.use("/countries", countryRouter);
router.use("/test", testRouter);

export default router;
