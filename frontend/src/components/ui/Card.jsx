import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
  hover = true,
  glow = false,
  padding = "p-6",
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={`
        rounded-2xl bg-bg-secondary border border-white/5
        ${hover ? "hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300" : ""}
        ${glow ? "shadow-lg shadow-accent/5" : ""}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
