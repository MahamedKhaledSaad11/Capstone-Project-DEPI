import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, BarChart2, Settings, Layers, Cpu, Award, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";

const pipelineSteps = [
  { name: "Data Collection", path: "/pipeline/data", icon: Database, description: "IoT sensor data from 20 EVs over 30 days", color: "#6366F1" },
  { name: "EDA", path: "/pipeline/eda", icon: BarChart2, description: "Statistical analysis and distribution exploration", color: "#22C55E" },
  { name: "Preprocessing", path: "/pipeline/preprocessing", icon: Settings, description: "Cleaning, clamping, imputation, and validation", color: "#F59E0B" },
  { name: "Feature Engineering", path: "/pipeline/features", icon: Layers, description: "Interaction, rolling window, and temporal features", color: "#A855F7" },
  { name: "Model Training", path: "/pipeline/models", icon: Cpu, description: "6 models trained with ADASYN oversampling", color: "#EF4444" },
  { name: "Evaluation", path: "/pipeline/evaluation", icon: Award, description: "Cross-validation, ROC AUC, confusion matrices", color: "#06B6D4" },
];

export default function Pipeline() {
  const location = useLocation();
  const isIndex = location.pathname === "/pipeline";

  if (!isIndex) return <Outlet />;

  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ML <span className="gradient-text">Pipeline</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Explore each phase of our CRISP-DM machine learning pipeline,
              from raw data collection to production deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineSteps.map((step, i) => (
              <Link key={step.path} to={step.path}>
                <Card className="h-full group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                    <span className="text-sm font-mono text-slate-500">
                      Phase {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                    {step.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">{step.description}</p>
                  <div className="flex items-center gap-1 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
