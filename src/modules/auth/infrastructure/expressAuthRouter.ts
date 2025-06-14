import { Router } from "express";
import { logInAdmin } from "./controllers/loginAdmin.js";
import { sendLoginCode } from "./controllers/sendLoginCode.js";
import { refreshAccessToken } from "./controllers/refreshAccessToken.js";

export const authRouter = Router();
// para enviar el código de verificación al administrador
authRouter.post("/admin/verification-code", sendLoginCode);
// para iniciar sesión con el código de verificación
authRouter.post("/admin/login", logInAdmin);
// para refrescar el token de acceso del administrador
authRouter.get("/admin/refresh-token", refreshAccessToken);
