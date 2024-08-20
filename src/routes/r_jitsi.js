import { Router } from "express";
import { generateToken, sendInviteLink } from "../controllers/c_jitsi.js";

const rJitsi = Router();

// [POST]
rJitsi.post("/token", generateToken);
rJitsi.post("/invite", sendInviteLink);

export default rJitsi; 