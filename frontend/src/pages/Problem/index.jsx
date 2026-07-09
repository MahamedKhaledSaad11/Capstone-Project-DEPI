import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, DollarSign, Clock, Wrench, ShieldAlert } from "lucide-react";
import Card from "../../components/ui/Card";
import { FAILURE_COLORS } from "../../constants/colors";

const problems = [
  { icon: AlertTriangle, title: "Unexpected Breakdowns", description: "EVs suffer from sudden component failures — battery overheating, motor stress, voltage sags — that strand drivers and damage vehicles.", color: "#EF4444" },
  { icon: DollarSign, title: "Costly Repairs", description: "Reactive maintenance costs 3-10x more than preventive maintenance. Unplanned downtime leads to lost revenue for fleet operators.", color: "#F59E0B" },
  { icon: Clock, title: "No Early Warning", description: "Traditional maintenance relies on fixed schedules or manual inspections, missing early signs of degradation in sensor data.", color: "#A855F7" },
];

const failureTypes = [
  { name: "Normal", description: "All systems operating within expected parameters.", percentage: "96.33%", color: FAILURE_COLORS.Normal },
  { name: "Critical Overheating", description: "Dangerous temperature levels in battery or motor requiring immediate intervention.", percentage: "1.69%", color: FAILURE_COLORS.Critical_Overheating },
  { name: "Thermal Overload", description: "Sustained high temperatures causing accelerated component wear.", percentage: "1.52%", color: FAILURE_COLORS.Thermal_Overload },
  { name: "Mechanical Stress", description: "Excessive physical stress on drivetrain and motor components.", percentage: "0.25%", color: FAILURE_COLORS.Mechanical_Stress },
  { name: "Voltage Sag", description: "Battery voltage dropping below safe operational thresholds.", percentage: "0.22%", color: FAILURE_COLORS.Voltage_Sag },
];

export default function Problem() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-danger/10 border border-danger/20 mb-6">
              <ShieldAlert className="w-4 h-4 text-danger" />
              <span className="text-danger text-sm font-medium">The Challenge</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The Problem We <span className="text-danger">Solve</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Electric vehicles generate thousands of sensor readings per trip.
              Without ML-powered analysis, critical failure patterns go undetected
              until it's too late.
            </p>
          </motion.div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {problems.map((problem, i) => (
              <Card key={problem.title} glow>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${problem.color}15` }}
                >
                  <problem.icon className="w-6 h-6" style={{ color: problem.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-slate-400 text-sm">{problem.description}</p>
              </Card>
            ))}
          </div>

          {/* Failure Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-2 text-center">
              5 Failure Types We Predict
            </h2>
            <p className="text-slate-400 text-center mb-10">
              Our model classifies each sensor reading into one of 5 operational states
            </p>

            <div className="space-y-4">
              {failureTypes.map((type) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: type.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white">{type.name}</h3>
                      <span className="text-sm font-mono" style={{ color: type.color }}>
                        {type.percentage}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{type.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Card className="max-w-3xl mx-auto" glow>
              <Wrench className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Our Solution</h3>
              <p className="text-slate-400 max-w-xl mx-auto">
                EVGuard transforms raw sensor data into actionable maintenance predictions
                using a LightGBM classifier trained on 20,300 telemetry readings from 20 vehicles
                over 30 days — achieving 99.43% accuracy with a macro F1 of 0.891.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
