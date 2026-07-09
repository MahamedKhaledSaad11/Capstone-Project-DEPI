import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Brain, Zap, BarChart3, Cpu } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import CarScene from "../../components/three/CarScene";
import useCountUp from "../../hooks/useCountUp";

const stats = [
  { label: "Accuracy", value: 99.43, suffix: "%", decimals: 2 },
  { label: "Features", value: 25, suffix: "", decimals: 0 },
  { label: "Models Compared", value: 6, suffix: "", decimals: 0 },
  { label: "Macro AUC", value: 0.999, suffix: "", decimals: 3 },
];

const features = [
  { icon: Shield, title: "Failure Prediction", description: "Predict 5 types of EV failures before they occur using real-time sensor data." },
  { icon: Brain, title: "LightGBM Powered", description: "Champion model selected from 6 candidates with 99.43% accuracy on test data." },
  { icon: Activity, title: "Real-Time Analysis", description: "Instant predictions with risk assessment, feature analysis, and maintenance recommendations." },
  { icon: BarChart3, title: "Rich Visualizations", description: "Interactive dashboards with confusion matrices, ROC curves, and feature importance charts." },
  { icon: Cpu, title: "25 Smart Features", description: "10 raw sensors + 5 engineered + 8 rolling window + 2 temporal features." },
  { icon: Zap, title: "Production Ready", description: "FastAPI backend with Docker containerization and cloud deployment on Render & Netlify." },
];

function StatCard({ label, value, suffix, decimals }) {
  const { value: animatedValue, ref } = useCountUp(value, 2000, decimals);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold gradient-text">
        {animatedValue}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-bg-primary to-purple-900/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-sm font-medium">AI-Powered Predictive Maintenance</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Predict EV Failures
              <br />
              <span className="gradient-text">Before They Happen</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-xl">
              EVGuard uses LightGBM machine learning to analyze real-time sensor data
              and predict 5 types of electric vehicle failures with 99.43% accuracy.
              Keep your fleet safe, efficient, and on the road.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/predict">
                <Button size="lg">
                  Try Live Prediction
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: 3D Car */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-[400px] lg:h-[500px]"
          >
            <CarScene />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="max-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="gradient-text">EVGuard</span>?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A comprehensive ML-powered system for proactive EV maintenance,
              built with production-grade engineering.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title}>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
            <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-sm" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Explore?
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Dive into the ML pipeline, explore the data, and see live predictions in action.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/pipeline/data">
                  <Button size="lg">Explore Pipeline</Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">Learn More</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
