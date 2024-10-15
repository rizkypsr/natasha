import { Prisma } from '@prisma/client';
import { prisma } from './prisma.server';

export const getProducts = async () => {
  return prisma.product.findMany();
};

export const createProduct = async ({
  name,
  price,
}: {
  name: string;
  price: number;
}) => {
  const newProduct = await prisma.product.create({
    data: {
      name,
      price,
    },
  });

  return newProduct;
};

export const getFilteredProducts = async (
  whereFilter: Prisma.ProductWhereInput
) => {
  return prisma.product.findMany({
    where: whereFilter,
  });
};

export const getAllCart = async () => {
  return prisma.cart.findFirst({
    include: {
        items: {
            include: {
                product: true
            }
        },
    }
  });
};

export const addToCart = async ({ productId }: { productId: string }) => {
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      productId: productId,
    },
  });

  if (existingCartItem) {
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: existingCartItem.quantity + 1,
      },
    });

    return updatedCartItem;
  }

  const cartItem = await prisma.cartItem.create({
    data: {
      quantity: 1,
      product: {
        connect: {
          id: productId,
        },
      },
      cart: {
        connect: {
            id: '670e145d594465014ba9061a',
        }
      },
    },
  });

  return cartItem;
};

export const resetCart = async () => {
    return prisma.cartItem.deleteMany();
}
