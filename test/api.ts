import request from "supertest";
import { app } from "../src/app.js";

export const api = request(app);
export const basePath = "/api/v1";