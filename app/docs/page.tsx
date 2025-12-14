import { getAvailableYears } from '@/lib/source';
import { redirect } from 'next/navigation';

export default function Page() {
  const years = getAvailableYears();

  if (years.length > 0) {
    redirect(`/docs/${years[0]}`);
  }
  redirect('/');
}
