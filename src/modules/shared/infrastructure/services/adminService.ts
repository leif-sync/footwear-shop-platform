import { CreateAdmin } from "../../../admin/application/createAdmin.js";
import { GetAdmin } from "../../../admin/application/getAdmin.js";
import { UpdatePartialAdmin } from "../../../admin/application/updatePartialAdmin.js";
import { AdminNotifier } from "../../../admin/domain/adminNotifier.js";
import { AdminRepository } from "../../../admin/domain/adminRepository.js";
import { EmailSender } from "../../../notification/domain/emailSender.js";

export interface AdminService {
  createAdmin: CreateAdmin;
  getAdmin: GetAdmin;
  updatePartialAdmin: UpdatePartialAdmin;
}
export function setupAdminService({
  adminRepository,
  emailSender,
}: {
  adminRepository: AdminRepository;
  emailSender: EmailSender;
}) {
  const adminNotifier = new AdminNotifier({ emailSender });

  return {
    createAdmin: new CreateAdmin({ adminRepository }),
    getAdmin: new GetAdmin({ adminRepository }),
    updatePartialAdmin: new UpdatePartialAdmin({
      adminRepository,
      adminNotifier,
    }),
  };
}
