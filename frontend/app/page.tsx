import { redirect } from 'next/navigation';

export default function Home() {
  // Apenas alguien entre a la raíz, lo mandamos al login
  redirect('/login');
}