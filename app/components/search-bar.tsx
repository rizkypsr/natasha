import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { Input } from '~/components/ui/input';
import { Button } from './ui/button';
import { Trash } from 'lucide-react';

export default function SearchBar() {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('filter') || ''
  );

  // Update the search query in the URL in real-time as the user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchParams.set('filter', searchQuery);
        navigate(`/?${searchParams.toString()}`, { replace: true });
      } else {
        searchParams.delete('filter');
        navigate('/');
      }
    }, 500); // Delay for debounce effect (to avoid too many requests)

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, navigate, searchParams]);

  // Function to handle clearing filters and resetting search
  const clearFilters = () => {
    searchParams.delete('filter');
    setSearchQuery('');
    navigate('/');
  };

  return (
    <>
      <form
        className="mb-10 flex items-center space-x-1"
        onSubmit={(e) => e.preventDefault()}
      >
        <Input
          type="text"
          name="filter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari produk"
        />
        {searchQuery && (
          <Button variant="link" onClick={clearFilters}>
            Hapus
          </Button>
        )}
      </form>
    </>
  );
}
