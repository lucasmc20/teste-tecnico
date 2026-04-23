import { AuthGuard } from '@/components/auth/auth-guard';
import { ItemsPanel } from '@/components/items/items-panel';

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-10">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-100 blur-2xl" />
          <div className="absolute -bottom-16 left-20 h-40 w-40 rounded-full bg-emerald-100 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Painel operacional
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Gestão Profissional de Itens
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Cadastre, atualize e acompanhe seu inventário com uma experiência moderna,
              organizada e preparada para operação diária.
            </p>
          </div>
        </header>

        <ItemsPanel initialItems={[]} />
      </main>
    </AuthGuard>
  );
}
