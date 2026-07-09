export default function Badge({
  children,
  color = "accent",
  size = "md",
  className = "",
}) {
  const colors = {
    accent: "bg-accent/15 text-accent-light border-accent/20",
    success: "bg-success/15 text-success border-success/20",
    warning: "bg-warning/15 text-warning border-warning/20",
    danger: "bg-danger/15 text-danger border-danger/20",
    critical: "bg-critical/15 text-critical border-critical/20",
    neutral: "bg-white/10 text-slate-300 border-white/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${colors[color]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
}
