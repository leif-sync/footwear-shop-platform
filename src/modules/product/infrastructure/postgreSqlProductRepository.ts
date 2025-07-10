import {
  PaginatedProductsFilterCriteria,
  ProductRepository,
  ProductSearchOptions,
  ProductsFilterCriteria,
} from "../domain/productRepository.js";
import {
  prismaConnection,
  PrismaTransaction,
} from "../../shared/infrastructure/prismaClient.js";
import { ProductFull } from "../domain/productFull.js";
import { UUID } from "../../shared/domain/UUID.js";
import { PrimitiveVariantFull, VariantFull } from "../domain/variantFull.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";
import { ProductPrice } from "../domain/productPrice.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { DiscountType } from "../domain/discountType.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { VariantSize } from "../domain/variantSize.js";
import { VariantTag } from "../domain/variantTag.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { ProductPreview } from "../domain/productPreview.js";
import { VariantPreview } from "../domain/variantPreview.js";
import { Integer } from "../../shared/domain/integer.js";
import { Prisma } from "../../../../generated/prisma/index.js";
import { partialProductDetailsDto } from "../domain/dto/partialProductDetails.js";

export type storedVariantImage = {
  imageUrl: string;
  imageAlt: string;
};

export class PostgreSqlProductRepository implements ProductRepository {
  private readonly transactionContext?: PrismaTransaction;
  private readonly isWithTransactionContext: boolean;

  constructor(params: { transactionContext?: PrismaTransaction } = {}) {
    this.transactionContext = params.transactionContext;
    this.isWithTransactionContext = Boolean(this.transactionContext);
  }

  async create(params: { product: ProductFull }): Promise<void> {
    const {
      categories,
      description,
      name,
      price,
      productId,
      visibility,
      variants,
    } = params.product.toPrimitives();

    const connection = this.transactionContext ?? prismaConnection;

    const mapCategoryNameToId = new Map<string, string>();
    const existingCategories = await connection.category.findMany({
      where: {
        name: {
          in: categories,
        },
      },
    });

    existingCategories.forEach((category) => {
      mapCategoryNameToId.set(category.name, category.categoryId);
    });

    const productCategoryTable = categories.map((categoryName) => {
      const categoryId = mapCategoryNameToId.get(categoryName);
      if (!categoryId) {
        throw new Error(
          `Category with name ${categoryName} not found, this should never happen check the data consistency`
        );
      }
      return {
        productId,
        categoryId,
      };
    });

    const runInTransaction = async (transaction: PrismaTransaction) => {
      const connection = transaction;

      await connection.product.create({
        data: {
          productId,
          description,
          name,
          priceBaseValue: price.baseValue,
          priceDiscountType: price.discountType,
          priceDiscountValue: price.discountValue,
          visibility,
          priceDiscountEndAt: price.discountEndAt,
          priceDiscountStartAt: price.discountStartAt,
        },
      });

      await connection.productCategory.createMany({
        data: productCategoryTable,
      });

      await this.createBatchVariants({
        productId: new UUID(productId),
        transaction,
        variants,
      });
    };

    if (this.isWithTransactionContext && this.transactionContext) {
      await runInTransaction(this.transactionContext);
      return;
    }

    await prismaConnection.$transaction(runInTransaction);
  }

  private async createBatchVariants(params: {
    transaction?: PrismaTransaction;
    productId: UUID;
    variants: PrimitiveVariantFull[];
  }) {
    const { transaction, productId, variants } = params;
    const connection =
      transaction ?? this.transactionContext ?? prismaConnection;

    const variantsTable: {
      variantId: string;
      hexColor: string;
      images: storedVariantImage[];
      createdAt: Date;
      updatedAt: Date;
      visibility: visibilityOptions;
      productId: string;
    }[] = [];

    const variantDetailsTable: {
      content: string;
      detailId: string;
      variantId: string;
    }[] = [];

    const variantSizesTable: {
      variantSizeId: string;
      stock: number;
      sizeId: string;
      variantId: string;
    }[] = [];

    const variantTagTable: {
      tagId: string;
      variantId: string;
    }[] = [];

    const detailTitleToSearch: string[] = [];
    const sizeValueToSearch: number[] = [];
    const tagNamesToSearch: string[] = [];

    variants.forEach((variant) => {
      variant.details.forEach((detail) => {
        detailTitleToSearch.push(detail.title);
      });
      variant.sizes.forEach((size) => {
        sizeValueToSearch.push(size.sizeValue);
      });
      variant.tags.forEach((tag) => {
        tagNamesToSearch.push(tag);
      });
    });

    const mapDetailTitleToId = new Map<string, string>();

    const existingDetails = await connection.variantDetail.findMany({
      where: {
        title: {
          in: detailTitleToSearch,
        },
      },
    });

    existingDetails.forEach((detail) => {
      mapDetailTitleToId.set(detail.title, detail.variantDetailId);
    });

    const mapSizeValueToId = new Map<number, string>();

    const existingSizes = await connection.size.findMany({
      where: {
        sizeValue: {
          in: sizeValueToSearch,
        },
      },
    });

    existingSizes.forEach((size) => {
      mapSizeValueToId.set(size.sizeValue, size.sizeId);
    });

    const mapTagNameToId = new Map<string, string>();

    const existingTags = await connection.tag.findMany({
      where: {
        name: {
          in: tagNamesToSearch,
        },
      },
    });

    existingTags.forEach((tag) => {
      mapTagNameToId.set(tag.name, tag.tagId);
    });

    variants.forEach((variant) => {
      const {
        variantId,
        hexColor,
        images,
        createdAt,
        updatedAt,
        visibility,
        details,
        sizes,
        tags,
      } = variant;

      variantsTable.push({
        variantId,
        hexColor,
        images,
        createdAt,
        updatedAt,
        visibility,
        productId: productId.getValue(),
      });

      tags.forEach((tag) => {
        const tagId = mapTagNameToId.get(tag);

        if (!tagId) {
          throw new Error(
            `Tag with name ${tag} not found, this should never happen check the data consistency`
          );
        }

        variantTagTable.push({
          tagId,
          variantId,
        });
      });

      details.forEach((detail) => {
        const { content, title } = detail;
        const detailId = mapDetailTitleToId.get(title);

        if (!detailId) {
          throw new Error(
            `Detail with title ${title} not found, this should never happen check the data consistency`
          );
        }

        variantDetailsTable.push({
          variantId,
          content,
          detailId,
        });
      });

      sizes.forEach((size) => {
        const { sizeValue, stock } = size;
        const sizeId = mapSizeValueToId.get(sizeValue);

        if (!sizeId) {
          throw new Error(
            `Size with value ${sizeValue} not found, this should never happen check the data consistency`
          );
        }

        variantSizesTable.push({
          variantSizeId: UUID.generateRandomUUID().getValue(),
          sizeId,
          stock,
          variantId,
        });
      });
    });

    await connection.variant.createMany({
      data: variantsTable,
    });

    await connection.variantDetailContent.createMany({
      data: variantDetailsTable,
    });

    await connection.variantSize.createMany({
      data: variantSizesTable,
    });

    await connection.variantTag.createMany({
      data: variantTagTable,
    });
  }

  async find(params: ProductSearchOptions): Promise<ProductFull | null> {
    const { productId } = params;

    const connection = this.transactionContext ?? prismaConnection;

    const storedProduct = await connection.product.findUnique({
      where: {
        productId: productId.getValue(),
      },
      include: {
        productCategories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        variants: {
          include: {
            variantDetails: {
              select: {
                content: true,
                detail: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            variantSizes: {
              select: {
                size: {
                  select: {
                    sizeValue: true,
                  },
                },
                stock: true,
              },
            },
            variantTags: {
              select: {
                tag: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!storedProduct) return null;

    const price = new ProductPrice({
      baseValue: new PositiveInteger(storedProduct.priceBaseValue),
      discountType: DiscountType.from(storedProduct.priceDiscountType),
      discountValue: new NonNegativeInteger(storedProduct.priceDiscountValue),
      discountStartAt: storedProduct.priceDiscountStartAt,
      discountEndAt: storedProduct.priceDiscountEndAt,
    });

    const variants: VariantFull[] = storedProduct.variants.map((variant) => {
      const details = variant.variantDetails.map((detail) => {
        return new VariantDetail({
          content: detail.content,
          title: detail.detail.title,
        });
      });

      const sizes = variant.variantSizes.map((size) => {
        return new VariantSize({
          sizeValue: new PositiveInteger(size.size.sizeValue),
          stock: new NonNegativeInteger(size.stock),
        });
      });

      const tags = variant.variantTags.map(
        (storedTag) => new VariantTag(storedTag.tag.name)
      );

      const validImages: storedVariantImage[] =
        variant.images as storedVariantImage[];

      const images = validImages.map((image) => {
        return new AppImage({
          imageUrl: new AppUrl(image.imageUrl),
          imageAlt: image.imageAlt,
        });
      });

      return new VariantFull({
        variantId: new UUID(variant.variantId),
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        hexColor: new HexColor(variant.hexColor),
        visibility: Visibility.from(variant.visibility),
        details,
        sizes,
        tags,
        images,
      });
    });

    return new ProductFull({
      productId,
      name: storedProduct.name,
      description: storedProduct.description,
      visibility: Visibility.from(storedProduct.visibility),
      categories: storedProduct.productCategories.map(
        (productCategory) => productCategory.category.name
      ),
      price,
      variants,
    });
  }

  async list(
    params: PaginatedProductsFilterCriteria
  ): Promise<ProductPreview[]> {
    const { limit, offset, categories, productVisibility } = params;
    const take = limit.getValue();
    const skip = offset.getValue();
    const visibilities = productVisibility
      ? Array.isArray(productVisibility)
        ? productVisibility.map((v) => v.getValue())
        : [productVisibility.getValue()]
      : undefined;

    const connection = this.transactionContext ?? prismaConnection;

    const storedProducts = await connection.product.findMany({
      take,
      skip,
      where: {
        productCategories: {
          some: {
            category: {
              name: {
                in: categories,
              },
            },
          },
        },
        visibility: {
          in: visibilities,
        },
      },
      include: {
        variants: {
          select: {
            variantId: true,
            images: true,
            hexColor: true,
            visibility: true,
          },
        },
      },
    });

    return storedProducts.map((storedProduct) => {
      const variants: VariantPreview[] = storedProduct.variants.map(
        (variant) => {
          const validImages: storedVariantImage[] =
            variant.images as storedVariantImage[];

          const images = validImages.map((image) => {
            return new AppImage({
              imageUrl: new AppUrl(image.imageUrl),
              imageAlt: image.imageAlt,
            });
          });

          return new VariantPreview({
            variantId: new UUID(variant.variantId),
            hexColor: new HexColor(variant.hexColor),
            imagePreview: images[0],
            visibility: Visibility.from(variant.visibility),
          });
        }
      );

      const price = new ProductPrice({
        baseValue: new PositiveInteger(storedProduct.priceBaseValue),
        discountEndAt: storedProduct.priceDiscountEndAt,
        discountStartAt: storedProduct.priceDiscountStartAt,
        discountType: DiscountType.from(storedProduct.priceDiscountType),
        discountValue: new NonNegativeInteger(storedProduct.priceDiscountValue),
      });

      return new ProductPreview({
        productId: new UUID(storedProduct.productId),
        name: storedProduct.name,
        price,
        variants,
        visibility: Visibility.from(storedProduct.visibility),
      });
    });
  }

  async checkCategoryUsage(params: { categoryName: string }): Promise<boolean> {
    const { categoryName } = params;

    const connection = this.transactionContext ?? prismaConnection;

    const count = await connection.productCategory.count({
      where: {
        category: {
          name: categoryName,
        },
      },
    });

    return count > 0;
  }

  async checkDetailUsage(params: { detailTitle: string }): Promise<boolean> {
    const { detailTitle } = params;

    const connection = this.transactionContext ?? prismaConnection;
    const count = await connection.variantDetailContent.count({
      where: {
        detail: {
          title: detailTitle,
        },
      },
    });

    return count > 0;
  }

  async checkSizeUsage(params: {
    sizeValue: PositiveInteger;
  }): Promise<boolean> {
    const { sizeValue } = params;

    const connection = this.transactionContext ?? prismaConnection;

    const count = await connection.variantSize.count({
      where: {
        size: {
          sizeValue: sizeValue.getValue(),
        },
      },
    });

    return count > 0;
  }

  async checkTagUsage(params: { tagName: string }): Promise<boolean> {
    const { tagName } = params;

    const connection = this.transactionContext ?? prismaConnection;

    const count = await connection.variantTag.count({
      where: {
        tag: {
          name: tagName,
        },
      },
    });

    return count > 0;
  }

  async countProducts(
    params: ProductsFilterCriteria
  ): Promise<NonNegativeInteger> {
    const { categories, productVisibility } = params;
    const productVisibilityValues = productVisibility
      ? Array.isArray(productVisibility)
        ? productVisibility.map((v) => v.getValue())
        : [productVisibility.getValue()]
      : undefined;

    const connection = this.transactionContext ?? prismaConnection;

    const count = await connection.product.count({
      where: {
        productCategories: {
          some: {
            category: {
              name: {
                in: categories,
              },
            },
          },
        },
        visibility: {
          in: productVisibilityValues,
        },
      },
    });

    return new NonNegativeInteger(count);
  }

  async deleteProduct(params: { productId: UUID }): Promise<void> {
    const runInTransaction = async (
      transaction: PrismaTransaction
    ): Promise<void> => {
      await transaction.variantSize.deleteMany({
        where: {
          variant: {
            productId: params.productId.getValue(),
          },
        },
      });

      await transaction.variantDetailContent.deleteMany({
        where: {
          variant: {
            productId: params.productId.getValue(),
          },
        },
      });

      await transaction.variantTag.deleteMany({
        where: {
          variant: {
            productId: params.productId.getValue(),
          },
        },
      });

      await transaction.variant.deleteMany({
        where: {
          productId: params.productId.getValue(),
        },
      });

      await transaction.productCategory.deleteMany({
        where: {
          productId: params.productId.getValue(),
        },
      });

      await transaction.product.delete({
        where: {
          productId: params.productId.getValue(),
        },
      });
    };
    if (this.isWithTransactionContext && this.transactionContext) {
      await runInTransaction(this.transactionContext);
      return;
    }

    await prismaConnection.$transaction(runInTransaction);
  }

  async deleteVariant(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<void> {
    const { productId, variantId } = params;

    const runInTransaction = async (
      transaction: PrismaTransaction
    ): Promise<void> => {
      await transaction.variantSize.deleteMany({
        where: {
          variantId: variantId.getValue(),
          variant: {
            productId: productId.getValue(),
          },
        },
      });

      await transaction.variantDetailContent.deleteMany({
        where: {
          variantId: variantId.getValue(),
          variant: {
            productId: productId.getValue(),
          },
        },
      });

      await transaction.variantTag.deleteMany({
        where: {
          variantId: variantId.getValue(),
          variant: {
            productId: productId.getValue(),
          },
        },
      });

      await transaction.variant.delete({
        where: {
          variantId: variantId.getValue(),
          productId: productId.getValue(),
        },
      });
    };

    if (this.isWithTransactionContext && this.transactionContext) {
      await runInTransaction(this.transactionContext);
      return;
    }

    await prismaConnection.$transaction(runInTransaction);
  }

  async modifyStock(
    products: {
      productId: UUID;
      variantId: UUID;
      size: { sizeValue: PositiveInteger; stockAdjustment: Integer };
    }[]
  ): Promise<void> {
    if (products.length === 0) return;

    const values = Prisma.join(
      products.map(
        (p) =>
          Prisma.sql`(
            ${p.productId.getValue()}::uuid,
            ${p.variantId.getValue()}::uuid,
            ${p.size.sizeValue.getValue()},
            ${p.size.stockAdjustment.getValue()}
          )`
      )
    );

    const sizeValues = Prisma.join(
      products.map((p) => Prisma.sql`${p.size.sizeValue.getValue()}`)
    );

    const connection = this.transactionContext ?? prismaConnection;

    await connection.$executeRaw`
      WITH "sizeIds" AS (
        SELECT "sizeId", "sizeValue"
        FROM "Size"
        WHERE "sizeValue" = ANY (ARRAY[${sizeValues}])
      )
      UPDATE "VariantSize" as vs
      SET "stock" = vs."stock" + v."sizeAdjustment"
      FROM (
        VALUES ${values}
      ) as v("productId", "variantId", "sizeValue", "sizeAdjustment")
      WHERE
        vs."variantId" = v."variantId"
        AND
        vs."sizeId" = (
          SELECT "sizeId"
          FROM "sizeIds"
          WHERE "sizeValue" = v."sizeValue"
        );
    `;
  }

  async addVariantToProduct(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void> {
    const primitiveVariantFull = params.variant.toPrimitives();

    await this.createBatchVariants({
      productId: params.productId,
      variants: [primitiveVariantFull],
    });
  }

  async updateVariant(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void> {
    const { productId, variant } = params;
    const primitiveVariantFull = variant.toPrimitives();
    const {
      hexColor,
      images,
      sizes,
      details,
      tags,
      updatedAt,
      variantId,
      visibility,
      createdAt,
    } = primitiveVariantFull;

    const runInTransaction = async (transaction: PrismaTransaction) => {
      const validImages: storedVariantImage[] = images;

      await transaction.variant.update({
        where: {
          variantId,
          productId: productId.getValue(),
        },
        data: {
          hexColor,
          images: validImages,
          visibility,
          createdAt,
          updatedAt,
        },
      });

      await this.updateVariantSizes({
        transaction,
        variantId,
        sizes: sizes.map((size) => ({
          sizeValue: size.sizeValue,
          newStock: size.stock,
        })),
      });

      await this.updateVariantDetails({
        transaction,
        variantId,
        details: details.map((detail) => ({
          detailTitle: detail.title,
          newContent: detail.content,
        })),
      });

      await this.updateVariantTags({
        transaction,
        variantId,
        tags,
      });
    };

    if (this.isWithTransactionContext && this.transactionContext) {
      await runInTransaction(this.transactionContext);
      return;
    }

    await prismaConnection.$transaction(async (transaction) => {
      const validImages: storedVariantImage[] = images;

      await transaction.variant.update({
        where: {
          variantId,
          productId: productId.getValue(),
        },
        data: {
          hexColor,
          images: validImages,
          visibility,
          createdAt,
          updatedAt,
        },
      });

      await this.updateVariantSizes({
        transaction,
        variantId,
        sizes: sizes.map((size) => ({
          sizeValue: size.sizeValue,
          newStock: size.stock,
        })),
      });

      await this.updateVariantDetails({
        transaction,
        variantId,
        details: details.map((detail) => ({
          detailTitle: detail.title,
          newContent: detail.content,
        })),
      });

      await this.updateVariantTags({
        transaction,
        variantId,
        tags,
      });
    });
  }

  private async updateVariantTags(params: {
    transaction?: PrismaTransaction;
    variantId: string;
    tags: string[];
  }) {
    const { transaction, variantId, tags } = params;
    const connection =
      transaction ?? this.transactionContext ?? prismaConnection;

    const existingTags = await connection.tag.findMany({
      where: { name: { in: tags } },
    });

    const mapTagNameToId = new Map<string, string>();
    const mapTagIdToName = new Map<string, string>();
    existingTags.forEach((tag) => {
      mapTagNameToId.set(tag.name, tag.tagId);
      mapTagIdToName.set(tag.tagId, tag.name);
    });

    const variantTagsToDelete: string[] = []; // IDs of variantTags to delete
    const variantTagsToCreate: { tagId: string; variantId: string }[] = [];
    const variantTagsInDb = await connection.variantTag.findMany({
      where: {
        variantId,
      },
    });

    variantTagsInDb.forEach((dbVariantTag) => {
      const tagName = mapTagIdToName.get(dbVariantTag.tagId);

      if (!tagName) {
        variantTagsToDelete.push(dbVariantTag.tagId);
      }
    });

    tags.forEach((tag) => {
      const tagId = mapTagNameToId.get(tag);

      if (!tagId) {
        throw new Error(
          `Tag with name ${tag} not found, this should never happen check the data consistency`
        );
      }

      const tagExistsInDb = variantTagsInDb.some(
        (vTag) => vTag.tagId === tagId
      );

      if (tagExistsInDb) {
        // Already exists, do not create again
        return;
      }

      variantTagsToCreate.push({
        tagId,
        variantId,
      });
    });

    if (variantTagsToDelete.length > 0) {
      await connection.variantTag.deleteMany({
        where: { tagId: { in: variantTagsToDelete }, variantId },
      });
    }

    if (variantTagsToCreate.length > 0) {
      await connection.variantTag.createMany({
        data: variantTagsToCreate,
      });
    }
  }

  private async updateVariantDetails(params: {
    transaction?: PrismaTransaction;
    variantId: string;
    details: {
      detailTitle: string;
      newContent: string;
    }[];
  }) {
    const { transaction, variantId, details } = params;
    const connection =
      transaction ?? this.transactionContext ?? prismaConnection;

    const variantDetailsToDelete: string[] = []; // IDs of variantDetails to delete
    const variantDetailsContentToCreate: {
      detailId: string;
      content: string;
      variantId: string;
    }[] = [];
    const variantDetailsToUpdate: {
      detailId: string;
      variantId: string;
      newContent: string;
    }[] = [];

    const detailTitlesToSearch = details.map((detail) => detail.detailTitle);
    const dbDetails = await connection.variantDetail.findMany({
      where: {
        title: {
          in: detailTitlesToSearch,
        },
      },
    });
    const mapDetailTitleToId = new Map<string, string>();
    const mapDetailIdToTitle = new Map<string, string>();

    dbDetails.forEach((detail) => {
      mapDetailTitleToId.set(detail.title, detail.variantDetailId);
      mapDetailIdToTitle.set(detail.variantDetailId, detail.title);
    });

    const dbVariantDetailsContent =
      await connection.variantDetailContent.findMany({
        where: {
          variantId,
        },
      });

    dbVariantDetailsContent.forEach((dbDetailContent) => {
      const detailTitle = mapDetailIdToTitle.get(dbDetailContent.detailId);

      if (!detailTitle) {
        variantDetailsToDelete.push(dbDetailContent.detailId);
      }
    });

    details.forEach((detail) => {
      const detailId = mapDetailTitleToId.get(detail.detailTitle);

      if (!detailId) {
        throw new Error(
          `Detail with title ${detail.detailTitle} not found, this should never happen check the data consistency`
        );
      }

      const existingVariantDetailContent = dbVariantDetailsContent.find(
        (vDetail) => vDetail.detailId === detailId
      );

      const isTheSameContent =
        existingVariantDetailContent?.content === detail.newContent;

      if (existingVariantDetailContent && isTheSameContent) {
        // No need to update, already exists with the same content
        return;
      }

      if (existingVariantDetailContent && !isTheSameContent) {
        variantDetailsToUpdate.push({
          detailId,
          variantId,
          newContent: detail.newContent,
        });
        return;
      }

      variantDetailsContentToCreate.push({
        detailId,
        content: detail.newContent,
        variantId,
      });
    });

    if (variantDetailsToDelete.length > 0) {
      await connection.variantDetailContent.deleteMany({
        where: {
          detailId: {
            in: variantDetailsToDelete,
          },
          variantId,
        },
      });
    }

    if (variantDetailsContentToCreate.length > 0) {
      await connection.variantDetailContent.createMany({
        data: variantDetailsContentToCreate,
      });
    }

    if (variantDetailsToUpdate.length > 0) {
      await this.updateBatchVariantDetailsTable({
        transaction,
        data: variantDetailsToUpdate,
      });
    }
  }

  private async updateBatchVariantDetailsTable(params: {
    transaction?: PrismaTransaction;
    data: {
      detailId: string;
      variantId: string;
      newContent: string;
    }[];
  }) {
    const { transaction, data } = params;
    if (data.length === 0) return;
    const connection =
      transaction ?? this.transactionContext ?? prismaConnection;

    const values = Prisma.join(
      data.map(
        (item) =>
          Prisma.sql`(${item.detailId}, ${item.variantId}, ${item.newContent})`
      )
    );

    await connection.$executeRaw`
      UPDATE "VariantDetailContent"
      SET content = v.newContent
      FROM (
        VALUES ${values}
      ) as v(detailId, variantId, newContent)
      WHERE "VariantDetailContent"."detailId" = v.detailId::uuid
      AND "VariantDetailContent"."variantId" = v.variantId::uuid;
    `;
  }

  private async updateVariantSizes(params: {
    transaction?: PrismaTransaction;
    variantId: string;
    sizes: {
      sizeValue: number;
      newStock: number;
    }[];
  }) {
    const connection =
      params.transaction ?? this.transactionContext ?? prismaConnection;
    const sizesToSearch = params.sizes.map((size) => size.sizeValue);

    const mapSizeIdToSizeValue = new Map<string, number>();
    const mapSizeValueToId = new Map<number, string>();

    const sizesInDb = await connection.size.findMany({
      where: { sizeValue: { in: sizesToSearch } },
    });

    sizesInDb.forEach((size) => {
      mapSizeIdToSizeValue.set(size.sizeId, size.sizeValue);
      mapSizeValueToId.set(size.sizeValue, size.sizeId);
    });

    const variantSizesInDb = await connection.variantSize.findMany({
      where: { variantId: params.variantId },
    });

    const variantSizesToDelete: string[] = []; // IDs of variantSizes to delete
    const variantSizesToCreate: {
      variantSizeId: string;
      stock: number;
      sizeId: string;
      variantId: string;
    }[] = [];
    const variantSizesToUpdate: {
      variantSizeId: string;
      newStock: number;
    }[] = [];

    variantSizesInDb.forEach((storedSize) => {
      const sizeValue = mapSizeIdToSizeValue.get(storedSize.sizeId);

      if (!sizeValue) {
        variantSizesToDelete.push(storedSize.variantSizeId);
      }
    });

    params.sizes.forEach((newSize) => {
      const sizeId = mapSizeValueToId.get(newSize.sizeValue);

      if (!sizeId) {
        throw new Error(
          `Size with value ${newSize.sizeValue} not found, this should never happen check the data consistency`
        );
      }

      const existingVariantSize = variantSizesInDb.find(
        (vSize) => vSize.sizeId === sizeId
      );

      const isTheSameStock = existingVariantSize?.stock === newSize.newStock;

      if (existingVariantSize && isTheSameStock) {
        // No need to update, already exists with the same stock
        return;
      }

      if (existingVariantSize && !isTheSameStock) {
        variantSizesToUpdate.push({
          variantSizeId: existingVariantSize.variantSizeId,
          newStock: newSize.newStock,
        });
        return;
      }

      variantSizesToCreate.push({
        variantSizeId: UUID.generateRandomUUID().getValue(),
        stock: newSize.newStock,
        sizeId,
        variantId: params.variantId,
      });
    });

    if (variantSizesToDelete.length > 0) {
      await connection.variantSize.deleteMany({
        where: {
          variantSizeId: {
            in: variantSizesToDelete,
          },
        },
      });
    }

    if (variantSizesToUpdate.length > 0) {
      await this.updateBatchVariantSizesTable({
        transaction: params.transaction ?? prismaConnection,
        data: variantSizesToUpdate,
      });
    }

    if (variantSizesToCreate.length > 0) {
      await connection.variantSize.createMany({
        data: variantSizesToCreate,
      });
    }
  }

  private async updateBatchVariantSizesTable(params: {
    transaction?: PrismaTransaction;
    data: {
      variantSizeId: string;
      newStock: number;
    }[];
  }) {
    const { transaction, data } = params;
    if (data.length === 0) return;

    const connection =
      transaction ?? this.transactionContext ?? prismaConnection;

    const values = Prisma.join(
      data.map((item) => Prisma.sql`(${item.variantSizeId}, ${item.newStock})`)
    );

    await connection.$executeRaw`
      UPDATE "VariantSize"
      -- stock adjustment -> (v.newStock - stock)
      SET stock = stock + (v.newStock - stock)
      FROM (
        VALUES ${values}
      ) AS v(variantSizeId, newStock)
      WHERE "VariantSize"."variantSizeId" = v.variantSizeId::uuid;
    `;
  }

  async updatePartialProduct(params: {
    productId: UUID;
    productName: string;
    productDescription: string;
    productCategories: string[];
    productPrice: ProductPrice;
    productVisibility: Visibility;
  }): Promise<void> {
    const {
      productId,
      productName,
      productDescription,
      productCategories,
      productPrice,
      productVisibility,
    } = params;

    const pricePrimitives = productPrice.toPrimitives();

    const runInTransaction = async (
      transaction: PrismaTransaction
    ): Promise<void> => {
      const existingCategories = await transaction.category.findMany({
        where: { name: { in: productCategories } },
      });

      const mapCategoryNameToId = new Map<string, string>();
      const mapCategoryIdToName = new Map<string, string>();

      existingCategories.forEach((category) => {
        mapCategoryNameToId.set(category.name, category.categoryId);
        mapCategoryIdToName.set(category.categoryId, category.name);
      });

      const productCategoryToDelete: {
        categoryId: string;
        productId: string;
      }[] = [];
      const productCategoryToCreate: {
        categoryId: string;
        productId: string;
      }[] = [];

      const dbProductCategories = await transaction.productCategory.findMany({
        where: { productId: productId.getValue() },
      });

      dbProductCategories.forEach((dbProductCategory) => {
        const categoryName = mapCategoryIdToName.get(
          dbProductCategory.categoryId
        );

        if (!categoryName) {
          productCategoryToDelete.push({
            categoryId: dbProductCategory.categoryId,
            productId: productId.getValue(),
          });
        }
      });

      productCategories.forEach((categoryName) => {
        const categoryId = mapCategoryNameToId.get(categoryName);

        if (!categoryId) {
          throw new Error(
            `Category with name ${categoryName} not found, this should never happen check the data consistency`
          );
        }

        const categoryAlreadyExists = dbProductCategories.some(
          (pc) => pc.categoryId === categoryId
        );

        if (categoryAlreadyExists) {
          return;
        }

        productCategoryToCreate.push({
          categoryId,
          productId: productId.getValue(),
        });
      });

      if (productCategoryToDelete.length > 0) {
        await transaction.productCategory.deleteMany({
          where: {
            categoryId: {
              in: productCategoryToDelete.map((pc) => pc.categoryId),
            },
            productId: productId.getValue(),
          },
        });
      }

      if (productCategoryToCreate.length > 0) {
        await transaction.productCategory.createMany({
          data: productCategoryToCreate,
        });
      }

      await transaction.product.update({
        where: {
          productId: productId.getValue(),
        },
        data: {
          name: productName,
          description: productDescription,
          priceBaseValue: pricePrimitives.baseValue,
          priceDiscountType: pricePrimitives.discountType,
          priceDiscountValue: pricePrimitives.discountValue,
          priceDiscountStartAt: pricePrimitives.discountStartAt,
          priceDiscountEndAt: pricePrimitives.discountEndAt,
          visibility: productVisibility.getValue(),
          productCategories: {},
        },
      });
    };

    if (this.isWithTransactionContext && this.transactionContext) {
      await runInTransaction(this.transactionContext);
      return;
    }

    await prismaConnection.$transaction(runInTransaction);
  }

  async retrievePartialProductDetails(params: {
    productIds: UUID[];
  }): Promise<partialProductDetailsDto[]> {
    const { productIds } = params;

    const connection = this.transactionContext ?? prismaConnection;

    const dbProducts = await connection.product.findMany({
      where: {
        productId: {
          in: productIds.map((id) => id.getValue()),
        },
      },
      include: {
        variants: {
          select: {
            variantId: true,
            variantSizes: {
              select: {
                stock: true,
                size: { select: { sizeValue: true } },
              },
            },
          },
        },
      },
    });

    return dbProducts.map<partialProductDetailsDto>((dbProduct) => {
      type variantDto = partialProductDetailsDto["variants"][number];
      const variants = dbProduct.variants.map<variantDto>((dbVariant) => {
        type sizeDto = variantDto["sizes"][number];
        const sizes = dbVariant.variantSizes.map<sizeDto>((dbSize) => {
          return {
            sizeValue: dbSize.size.sizeValue,
            stock: dbSize.stock,
          };
        });

        return {
          sizes,
          variantId: dbVariant.variantId,
        } as variantDto;
      });

      const price = new ProductPrice({
        baseValue: new PositiveInteger(dbProduct.priceBaseValue),
        discountType: DiscountType.from(dbProduct.priceDiscountType),
        discountValue: new NonNegativeInteger(dbProduct.priceDiscountValue),
        discountStartAt: dbProduct.priceDiscountStartAt,
        discountEndAt: dbProduct.priceDiscountEndAt,
      });

      return {
        productId: dbProduct.productId,
        unitPrice: price.evaluateFinalCost(),
        variants,
      };
    });
  }
}
