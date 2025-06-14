import { z } from "zod";
import { Email } from "../../../shared/domain/email.js";
import { NonNegativeInteger } from "../../../shared/domain/nonNegativeInteger.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import {
  loginCodeRepository,
  emailSender,
  ServiceContainer,
} from "../../../shared/infrastructure/serviceContainer.js";
import { LoginCode } from "../../domain/loginCode.js";
import { Request, Response } from "express";
import { AdminNotFoundError } from "../../../admin/domain/errors/adminNotFoundError.js";
import { isProduction } from "../../../../environmentVariables.js";

const loginCodeExpiresInSeconds = 60 * 5;

const sendLoginCodeSchema = z.object({
  email: z.string().email(),
});

export async function sendLoginCode(req: Request, res: Response) {
  const parsedBody = sendLoginCodeSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid request body",
      errors: parsedBody.error.issues,
    });
    return;
  }

  const email = new Email(parsedBody.data.email);

  try {
    await ServiceContainer.admin.getAdmin.run({
      adminEmail: email.getValue(),
    });
  } catch (error) {
    if (error instanceof AdminNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Admin not found",
      });
      return;
    }

    throw error;
  }

  const existingLoginCode = await loginCodeRepository.find({
    notificationEmail: email,
  });

  if (existingLoginCode) {
    await loginCodeRepository.delete({
      code: existingLoginCode.getCode(),
      notificationEmail: email,
    });
  }

  const loginCode = LoginCode.create({
    expiresInSeconds: new NonNegativeInteger(loginCodeExpiresInSeconds),
    notificationEmail: email,
  });

  await loginCodeRepository.create({ loginCode });

  await emailSender.sendTransactionalEmail({
    to: email,
    subject: "Login Code",
    content: `Your login code is: ${loginCode.getCode()}`,
  });

  if (!isProduction) {
    res.status(HTTP_STATUS.OK).json({
      message: "Login code sent successfully",
      loginCode: loginCode.getCode(),
    });
    return;
  }

  res.status(HTTP_STATUS.NO_CONTENT).end();
}
