import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { Detail } from "../domain/detail.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

export class PostgreSqlDetailRepository implements DetailRepository {
  async create(params: { detail: Detail }): Promise<void> {
    const { detail } = params;
    const { detailId, detailTitle } = detail.toPrimitives();

    await prismaConnection.variantDetail.create({
      data: {
        variantDetailId: detailId,
        title: detailTitle,
      },
    });
  }

  async find(params: { detailId: UUID }): Promise<Detail | null>;
  async find(params: { detailTitle: DetailTitle }): Promise<Detail | null>;
  async find(
    params: { detailId: UUID } | { detailTitle: DetailTitle }
  ): Promise<Detail | null> {
    const isDetailIdPresent = "detailId" in params;

    if (isDetailIdPresent) {
      const detailId = params.detailId.getValue();
      const detail = await prismaConnection.variantDetail.findUnique({
        where: {
          variantDetailId: detailId,
        },
      });

      if (!detail) return null;

      return new Detail({
        detailId: new UUID(detail.variantDetailId),
        detailTitle: new DetailTitle(detail.title),
      });
    }

    const detailTitle = params.detailTitle.getValue();
    const detail = await prismaConnection.variantDetail.findUnique({
      where: {
        title: detailTitle,
      },
    });

    if (!detail) return null;
    return new Detail({
      detailId: new UUID(detail.variantDetailId),
      detailTitle: new DetailTitle(detail.title),
    });
  }

  async countDetails(): Promise<NonNegativeInteger> {
    const count = await prismaConnection.variantDetail.count();
    return new NonNegativeInteger(count);
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Detail[]> {
    const { limit, offset } = params;
    const details = await prismaConnection.variantDetail.findMany({
      take: limit.getValue(),
      skip: offset.getValue(),
    });

    return details.map(
      (detail) =>
        new Detail({
          detailId: new UUID(detail.variantDetailId),
          detailTitle: new DetailTitle(detail.title),
        })
    );
  }

  async delete(params: { detailId: UUID }): Promise<void>;
  async delete(params: { detailTitle: DetailTitle }): Promise<void>;
  async delete(
    params: { detailId: UUID } | { detailTitle: DetailTitle }
  ): Promise<void> {
    if ("detailId" in params) {
      const detailId = params.detailId.getValue();
      await prismaConnection.variantDetail.delete({
        where: {
          variantDetailId: detailId,
        },
      });
      return;
    }

    const title = params.detailTitle.getValue();
    await prismaConnection.variantDetail.delete({
      where: {
        title,
      },
    });
  }

  async retrieveDetailsByTitle(
    detailTitle: DetailTitle | DetailTitle[]
  ): Promise<Detail[]> {
    const titles = Array.isArray(detailTitle)
      ? detailTitle.map((title) => title.getValue())
      : [detailTitle.getValue()];

    const details = await prismaConnection.variantDetail.findMany({
      where: {
        title: {
          in: titles,
        },
      },
    });

    return details.map(
      (detail) =>
        new Detail({
          detailId: new UUID(detail.variantDetailId),
          detailTitle: new DetailTitle(detail.title),
        })
    );
  }

  async update(params: { detail: Detail }): Promise<void> {
    const { detail } = params;
    const { detailId, detailTitle } = detail.toPrimitives();

    await prismaConnection.variantDetail.update({
      where: {
        variantDetailId: detailId,
      },
      data: {
        title: detailTitle,
      },
    });
  }
}
