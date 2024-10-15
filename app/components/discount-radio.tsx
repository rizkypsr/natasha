import { useState } from 'react';
import { Button } from './ui/button';

type DiscountRadioProps = {
  onDiscountChange: (discount: number) => void;
};

const discounts = [0, 10, 15];

export default function DiscountRadio({
  onDiscountChange,
}: DiscountRadioProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);

  const handleChange = (discount: number) => {
    setSelectedDiscount(discount);
    onDiscountChange(discount);
  };

  return (
    <div className="flex space-x-3">
      {discounts.map((discount) => (
        <Button
          variant={selectedDiscount === discount ? 'default' : 'outline'}
          key={discount}
          className="grow"
          onClick={() => handleChange(discount)}
        >
          {discount}
        </Button>
      ))}
    </div>
  );
}
