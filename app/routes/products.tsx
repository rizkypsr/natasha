import { ReloadIcon } from '@radix-ui/react-icons';
import { ActionFunction } from '@remix-run/node';
import {
  Form,
  useActionData,
  json,
  redirect,
  useNavigation,
} from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { createProduct } from '~/lib/product.server';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = String(formData.get('name'));
  const price = Number(formData.get('price'));

  const errors = {};

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  const result = await createProduct({ name, price });

  return redirect('/products');
};

export default function Products() {
  let { state } = useNavigation();
  const actionData = useActionData<typeof action>();
  let formRef = useRef<HTMLFormElement>(null);

  useEffect(
    function resetFormOnSuccess() {
      console.log(actionData);

      if (state === 'idle') {
        console.log('reset form');

        formRef.current?.reset();
      }
    },
    [state]
  );

  return (
    <>
      <Form replace method="post" className="space-y-3" ref={formRef}>
        <Input name="name" type="text" placeholder="Nama Produk" required />
        <Input name="price" type="number" placeholder="Harga" required />

        <Button type="submit">
          {state === 'submitting' ? (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Submit'
          )}
        </Button>
      </Form>
    </>
  );
}
