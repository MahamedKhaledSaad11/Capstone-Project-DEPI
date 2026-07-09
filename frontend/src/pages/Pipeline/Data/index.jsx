import { motion } from "framer-motion";
import { Database, Clock, Car, Gauge } from "lucide-react";
import Card from "../../../components/ui/Card";
import { DATASET_STATS } from "../../../data/edaData";

export default function Data() {
  const stats = [
    { icon: Database, label: "Total Samples", value: DATASET_STATS.total_rows.toLocaleString() },
    { icon: Car, label: "Vehicles Tracked", value: DATASET_STATS.vehicles },
    { icon: Clock, label: "Time Range", value: DATASET_STATS.time_range },
    { icon: Gauge, label: "Sampling Rate", value: DATASET_STATS.sampling_interval },
  ];

  const columns = [
    { name: "timestamp", type: "datetime", description: "Measurement timestamp per 10-min interval" },
    { name: "car_id", type: "categorical", description: "Unique vehicle identifier (500 EVs)" },
    { name: "speed_kmh", type: "float", description: "Current travel speed in km/h" },
    { name: "distance_m", type: "float", description: "Accumulated distance in meters" },
    { name: "soc_pct", type: "float", description: "Battery state of charge (0-100%)" },
    { name: "battery_voltage_v", type: "float", description: "Battery pack voltage (V)" },
    { name: "battery_temp_c", type: "float", description: "Battery temperature (°C)" },
    { name: "motor_rpm", type: "float", description: "Motor rotational speed (RPM)" },
    { name: "motor_temp_c", type: "float", description: "Motor core temperature (°C)" },
    { name: "power_kw", type: "float", description: "Real-time power draw (kW)" },
    { name: "ambient_temp_c", type: "float", description: "External temperature (°C)" },
    { name: "load_kg", type: "float", description: "Vehicle payload mass (kg)" },
    { name: "failure_type", type: "categorical", description: "Target: 5-class failure classification" },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 1: <span className="gradient-text">Data Collection</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Fleet telemetry data collected from 500 electric vehicles over 90 days,
              sampled at 10-minute intervals via IoT sensors.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} hover={false}>
                <stat.icon className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Schema Table */}
          <Card hover={false}>
            <h2 className="text-xl font-semibold mb-4">Dataset Schema</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Column</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col) => (
                    <tr key={col.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-accent">{col.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-300">
                          {col.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
