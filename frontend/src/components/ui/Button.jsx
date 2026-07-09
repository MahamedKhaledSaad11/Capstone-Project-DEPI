import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/25 hover:shadow-accent/40",
    secondary:
      "bg-bg-tertiary hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20",
    danger:
      "bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/25",
    ghost:
      "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
    outline:
      "bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2.5",
    xl: "px-10 py-4 text-lg gap-3",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
