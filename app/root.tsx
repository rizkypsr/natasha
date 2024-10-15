import {
  Form,
  json,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/node';
import { Button } from './components/ui/button';
import { Home, Minus, Plus, ShoppingBasket, Trash } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';

import styles from './tailwind.css?url';
import { Separator } from './components/ui/separator';
import { getAllCart, resetCart } from './lib/product.server';
import { Cart, CartItem } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import DiscountRadio from './components/discount-radio';
import { ScrollArea } from './components/ui/scroll-area';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  { rel: 'stylesheet', href: styles },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-neutral-50 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

export const loader: LoaderFunction = async ({ request }) => {
  const cart = await getAllCart();

  return json({ cart });
};

export const action: ActionFunction = async ({ request }) => {
  await resetCart();

  return json({ status: 'success' });
};

export default function App() {
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState<number>(0);

  const { cart } = useLoaderData<{ cart: Cart }>();

  useEffect(() => {
    const calculatedSubTotal = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );
    setSubTotal(calculatedSubTotal);
  }, [cart.items]);

  // Apply discount first
  const discountPrice = discount > 0 ? (discount / 100) * subTotal : 0;
  const discountedSubTotal = subTotal - discountPrice;

  // Then calculate tax on the discounted price
  const tax = discountedSubTotal * 0.11;

  // Calculate total price by adding tax
  const totalPrice = discountedSubTotal + tax;
  const roundedTotalPrice = Math.round(totalPrice / 100) * 100;

  const handleDiscountChange = (selectedDiscount: number) => {
    setDiscount(selectedDiscount);
  };

  const updateCartItem = (id: string, newQuantity: number) => {};
  const removeCartItem = (id: string) => {};

  return (
    <div className="no-scrollbar mx-auto h-screen max-w-lg overflow-y-auto bg-white px-8 py-12 text-gray-900">
      <div className="text-center">
        <div className="mb-8 flex justify-center space-x-3">
          <Link to="/">
            <Button variant="outline" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/products">
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <ShoppingBasket className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-[420px] flex-col text-gray-900 sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Cart</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>

              <div className="no-scrollbar space-y-4 overflow-y-auto pb-12">
                {cart.items.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    {/* Product Details */}
                    <div>
                      <h1 className="font-semibold">{item.product.name}</h1>
                      <h2>
                        {rupiah.format(item.product.price)} x {item.quantity}
                      </h2>
                    </div>

                    {/* Quantity Changer */}
                    <QuantityChanger
                      itemId={item.cartId}
                      quantity={item.quantity}
                      onUpdateQuantity={updateCartItem}
                    />
                  </div>
                ))}
              </div>

              <section className="mt-auto">
                <DiscountRadio onDiscountChange={handleDiscountChange} />

                <Separator className="my-3" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h1>Sub Total</h1>
                    <h2>{rupiah.format(subTotal)}</h2>
                  </div>

                  <div className="flex items-center justify-between">
                    <h1>Pajak 11%</h1>
                    <h2>{rupiah.format(tax)}</h2>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <h1>Diskon {discount}%</h1>
                      <h2 className="text-red-500">
                        {' '}
                        - {rupiah.format(discountPrice)}
                      </h2>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h1>Total</h1>
                    <h2>{rupiah.format(roundedTotalPrice)}</h2>
                  </div>
                </div>

                <Form method="post">
                  <Button type="submit" className="mt-6 w-full">
                    Reset
                  </Button>
                </Form>
              </section>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

type QuantityChangerProps = {
  itemId: string;
  quantity: number;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
};

const QuantityChanger: React.FC<QuantityChangerProps> = ({
  itemId,
  quantity,
  onUpdateQuantity,
}) => {
  const handleIncrease = () => {
    onUpdateQuantity(itemId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(itemId, quantity - 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handleDecrease}>
        <Minus className="h-4 w-4" />
      </Button>
      <div>{quantity}</div>
      <Button variant="outline" size="icon" onClick={handleIncrease}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
