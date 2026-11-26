import type { ReactNode } from "react";

/** Readable long-form layout for docs and policy pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 text-[15px] leading-7 text-slate-700 [&_a]:font-medium [&_a]:text-indigo-600 [&_a:hover]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_h2]:scroll-mt-6 [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-slate-200 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2">
      {children}
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="border-b border-slate-200 pb-8">
      <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance">{title}</h1>
      <div className="mt-4 text-lg text-slate-600">{children}</div>
    </header>
  );
}
