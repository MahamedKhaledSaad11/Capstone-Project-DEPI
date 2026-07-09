import { motion } from "framer-motion";
import { Server, Monitor, Database, Cloud, ArrowRight, Cpu, Globe } from "lucide-react";
import Card from "../../components/ui/Card";

const layers = [
  {
    title: "Frontend (React + Vite)",
    icon: Monitor,
    color: "#6366F1",
    items: [
      "React 18 with Vite build tool",
      "Tailwind CSS for styling",
      "Recharts for data visualization",
      "React Three Fiber for 3D rendering",
      "Zustand for state management",
      "Axios for API communication",
      "Framer Motion for animations",
    ],
    deploy: "Netlify",
  },
  {
    title: "Backend API (FastAPI)",
    icon: Server,
    color: "#22C55E",
    items: [
      "FastAPI with Pydantic v2 validation",
      "LightGBM model served via joblib",
      "StandardScaler preprocessing",
      "Feature engineering pipeline",
      "CORS middleware for cross-origin",
      "Request logging middleware",
      "Health check & model info endpoints",
    ],
    deploy: "Render",
  },
  {
    title: "ML Pipeline",
    icon: Cpu,
    color: "#F59E0B",
    items: [
      "LightGBM classifier (champion)",
      "ADASYN oversampling (training only)",
      "StandardScaler normalization",
      "25 features (10 raw + 15 engineered)",
      "Stratified 5-fold cross-validation",
      "CRISP-DM methodology",
      "99.43% test accuracy",
    ],
    deploy: "Offline Training",
  },
  {
    title: "Data Layer",
    icon: Database,
    color: "#A855F7",
    items: [
      "20,300 telemetry records",
      "20 vehicles over 30 days",
      "10-minute sampling intervals",
      "10 IoT sensor channels",
      "5-class failure classification",
      "Physical constraint clamping",
      "Per-vehicle imputation",
    ],
    deploy: "CSV / IoT Sensors",
  },
];

const deploymentFlow = [
  { step: 1, title: "Code Push", description: "Push to main branch on GitHub", icon: Globe },
  { step: 2, title: "CI/CD", description: "GitHub Actions runs tests", icon: Cpu },
  { step: 3, title: "Backend Deploy", description: "Render builds & deploys API", icon: Server },
  { step: 4, title: "Frontend Deploy", description: "Netlify builds & deploys UI", icon: Monitor },
];

export default function Architecture() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              System <span className="gradient-text">Architecture</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              End-to-end architecture from data collection to production deployment,
              showing how each layer connects.
            </p>
          </motion.div>

          {/* Architecture Layers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {layers.map((layer) => (
              <Card key={layer.title} glow>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${layer.color}15` }}
                  >
                    <layer.icon className="w-6 h-6" style={{ color: layer.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{layer.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {layer.deploy}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: layer.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Deployment Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Deployment Pipeline</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {deploymentFlow.map((step, i) => (
                <div key={step.step} className="flex items-center gap-4">
                  <Card hover={false} className="text-center min-w-[160px]">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-400">{step.description}</p>
                  </Card>
                  {i < deploymentFlow.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-accent hidden md:block flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* API Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">API Endpoints</h2>
            <Card hover={false}>
              <div className="space-y-3">
                {[
                  { method: "POST", path: "/api/v1/predict", description: "Run failure prediction on sensor data" },
                  { method: "GET", path: "/api/v1/health", description: "Service health check with model status" },
                  { method: "GET", path: "/api/v1/model-info", description: "Full model metadata & evaluation metrics" },
                  { method: "GET", path: "/api/v1/sample-inputs", description: "Preset sample inputs for testing" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      ep.method === "POST" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm text-white flex-1">{ep.path}</span>
                    <span className="text-sm text-slate-400 hidden sm:block">{ep.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
