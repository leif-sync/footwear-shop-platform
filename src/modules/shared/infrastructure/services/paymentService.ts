import { EmailSender } from "../../../notification/domain/emailSender.js";
import { OrderRepository } from "../../../order/domain/orderRepository.js";
import { CountTransactions } from "../../../payment/application/countTransactions.js";
import { CreatePaymentTransaction } from "../../../payment/application/createPaymentTransaction.js";
import { GetPaymentTransaction } from "../../../payment/application/getPaymentTransaction.js";
import { ListPayments } from "../../../payment/application/listPayments.js";
import { PaymentGatewaySuccessHandler } from "../../../payment/application/paymentGatewaySuccessHandler.js";
import { PrepareOrderForPayment } from "../../../payment/application/prepareOrderForPayment.js";
import { PaymentTransactionRepository } from "../../../payment/domain/paymentTransactionRepository.js";
import { PaymentAssociatedDataProvider } from "../../../payment/infrastructure/paymentAssociatedDataProvider.js";
import { PaymentOrderNotifier } from "../../../payment/infrastructure/paymentOrderNotifier.js";

export interface PaymentService {
  paymentGatewaySuccessHandler: PaymentGatewaySuccessHandler;
  listPaymentTransactions: ListPayments;
  getPaymentTransaction: GetPaymentTransaction;
  countPaymentTransactions: CountTransactions;
  createPaymentTransaction: CreatePaymentTransaction;
  prepareOrderForPayment: PrepareOrderForPayment;
}
export function setupPaymentService({
  paymentTransactionRepository,
  orderRepository,
  emailSender,
}: {
  paymentTransactionRepository: PaymentTransactionRepository;
  orderRepository: OrderRepository;
  emailSender: EmailSender;
}) {
  const paymentOrderNotifier = new PaymentOrderNotifier({
    emailSender,
    orderRepository,
  });

  const paymentAssociatedDataProvider = new PaymentAssociatedDataProvider({
    orderRepository,
  });

  return {
    paymentGatewaySuccessHandler: new PaymentGatewaySuccessHandler({
      paymentAssociatedDataProvider,
      paymentOrderNotifier,
      paymentTransactionRepository,
    }),
    listPaymentTransactions: new ListPayments({
      paymentTransactionRepository,
    }),
    getPaymentTransaction: new GetPaymentTransaction({
      paymentTransactionRepository,
    }),
    countPaymentTransactions: new CountTransactions({
      paymentTransactionRepository,
    }),
    createPaymentTransaction: new CreatePaymentTransaction({
      paymentTransactionRepository,
      paymentAssociatedDataProvider,
    }),
    prepareOrderForPayment: new PrepareOrderForPayment({
      paymentAssociatedDataProvider,
    }),
  };
}
