import { Metadata } from 'next';
import ItemDetailPage from './ItemDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Item ${id} - Second Brain`,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ItemDetailPage id={id} />;
}
