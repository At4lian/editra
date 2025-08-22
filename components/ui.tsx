import React from "react";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const Container = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-6 lg:px-8 ${className}`}>{children}</div>
);

export type SectionTitleProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  level?: HeadingLevel;
};

export const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
  level = "h2",
}: SectionTitleProps) => {
  const Heading = level as keyof JSX.IntrinsicElements;
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-400">
          {eyebrow}
        </p>
      )}
      <Heading className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-3 text-base text-slate-300">{subtitle}</p>}
    </div>
  );
};

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur transition hover:shadow-sky-500/10 ${className}`}>
    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
    {children}
  </div>
);

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
    {children}
  </span>
);

export type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const Button = ({
  children,
  href = "#",
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400/60";
  const styles = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-400 active:bg-sky-600 shadow-lg shadow-sky-500/20",
    ghost:
      "border border-white/15 bg-white/5 text-white hover:border-white/25",
  } as const;
  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`} onClick={onClick}>
      {children}
    </a>
  );
};
