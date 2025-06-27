import { SizeRepository } from "../domain/sizeRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { Size } from "../domain/size.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";

export class PostgreSqlSizeRepository implements SizeRepository {
  async create(params: { size: Size }): Promise<void> {
    const { sizeId, sizeValue } = params.size.toPrimitives();

    await prismaConnection.size.create({
      data: {
        sizeId,
        sizeValue,
      },
    });
  }

  async find(params: { sizeId: UUID }): Promise<Size | null>;
  async find(params: { sizeValue: PositiveInteger }): Promise<Size | null>;
  async find(
    params: { sizeId: UUID } | { sizeValue: PositiveInteger }
  ): Promise<Size | null> {
    const isSizeId = "sizeId" in params;
    if (isSizeId) {
      const sizeId = params.sizeId.getValue();
      const size = await prismaConnection.size.findUnique({
        where: { sizeId },
      });

      if (!size) return null;

      return new Size({
        sizeId: new UUID(size.sizeId),
        sizeValue: new PositiveInteger(size.sizeValue),
      });
    }

    const sizeValue = params.sizeValue.getValue();
    const size = await prismaConnection.size.findUnique({
      where: { sizeValue },
    });

    if (!size) return null;

    return new Size({
      sizeId: new UUID(size.sizeId),
      sizeValue: new PositiveInteger(size.sizeValue),
    });
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Size[]> {
    const { limit, offset } = params;

    const sizes = await prismaConnection.size.findMany({
      take: limit.getValue(),
      skip: offset.getValue(),
    });

    return sizes.map((size) => {
      return new Size({
        sizeId: new UUID(size.sizeId),
        sizeValue: new PositiveInteger(size.sizeValue),
      });
    });
  }

  async delete(params: { sizeId: UUID }): Promise<void>;
  async delete(params: { sizeValue: PositiveInteger }): Promise<void>;
  async delete(
    params: { sizeId: UUID } | { sizeValue: PositiveInteger }
  ): Promise<void> {
    const isSizeId = "sizeId" in params;
    if (isSizeId) {
      const sizeId = params.sizeId.getValue();
      await prismaConnection.size.delete({ where: { sizeId } });
      return;
    }

    const sizeValue = params.sizeValue.getValue();
    await prismaConnection.size.delete({ where: { sizeValue } });
  }

  async countSizes(): Promise<NonNegativeInteger> {
    const count = await prismaConnection.size.count();
    return new NonNegativeInteger(count);
  }

  async retrieveSizesByValue(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<Size[]> {
    const sizeValues = Array.isArray(sizeValue)
      ? sizeValue.map((value) => value.getValue())
      : [sizeValue.getValue()];

    const sizes = await prismaConnection.size.findMany({
      where: {
        sizeValue: {
          in: sizeValues,
        },
      },
    });

    return sizes.map(
      (size) =>
        new Size({
          sizeId: new UUID(size.sizeId),
          sizeValue: new PositiveInteger(size.sizeValue),
        })
    );
  }
}
