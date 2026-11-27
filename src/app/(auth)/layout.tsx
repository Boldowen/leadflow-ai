import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute top-1/4 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-[rgba(79,70,229,.22)] blur-[120px]" />
      <div className="relative mb-8">
        <Logo />
      </div>
      <div className="glass relative w-full max-w-sm p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)] sm:p-8">{children}</div>
    </main>
  );
}
