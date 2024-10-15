import { Prisma, Product } from '@prisma/client';
import { ReloadIcon } from '@radix-ui/react-icons';
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { ShoppingBasket } from 'lucide-react';
import SearchBar from '~/components/search-bar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { addToCart, getFilteredProducts } from '~/lib/product.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter');

  let textFilter: Prisma.ProductWhereInput = {};
  if (filter) {
    textFilter = {
      name: { mode: 'insensitive', contains: filter },
    };
  }

  const products: Product[] = await getFilteredProducts(textFilter);

  return json({ products });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const productId = formData.get('productId') as string;

  const cartItem = await addToCart({
    productId,
  });

  return json({ cartItem });
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const actionData = useActionData();

  return (
    <>
      <SearchBar />

      <section className="space-y-3">
        {products.map((product: Product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center justify-between pt-6 text-left">
              <div>
                <h1 className="font-semibold">{product.name}</h1>
                <h2>{rupiah.format(product.price)}</h2>
              </div>

              <Form method="post">
                <input type="hidden" name="productId" value={product.id} />
                <Button
                  variant="outline"
                  size="icon"
                  type="submit"
                  disabled={state === 'submitting'}
                >
                  {state === 'submitting' ? (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBasket className="h-4 w-4" />
                  )}
                </Button>
              </Form>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
