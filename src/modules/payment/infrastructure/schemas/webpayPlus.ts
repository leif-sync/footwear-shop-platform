import { z } from "zod";

export const createLinkPaymentGatewaySchema = z.object({
  orderId: z.string().uuid(),
});

export const processWebpayPlusPaymentGatewaySchema = z.object({
  token_ws: z.string().length(64).optional(),
  TBK_TOKEN: z.string().length(64).optional(),
  TBK_ID_SESION: z.string().uuid().optional(),
  TBK_ORDEN_COMPRA: z.string().optional(),
});
