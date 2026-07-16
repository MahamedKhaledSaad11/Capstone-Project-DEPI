import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, AlertTriangle, CheckCircle, AlertCircle, XCircle, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ProbabilityChart from "../../components/charts/ProbabilityChart";
import usePrediction from "../../hooks/usePrediction";
import { SAMPLE_INPUTS } from "../../data/sampleInputs";
import FEATURE_METADATA from "../../data/featureMetadata";
import { FAILURE_COLORS, RISK_COLORS, RISK_BG_COLORS } from "../../constants/colors";
import { formatClassName, getRiskDescription } from "../../utils/formatters";
import DecisionSupportPanel from "./DecisionSupportPanel";

const inputFields = FEATURE_METADATA.filter(f => f.category === "sensor" || f.category === "temporal");

const riskIcons = {
  LOW: CheckCircle,
  MEDIUM: AlertTriangle,
  HIGH: AlertCircle,
  CRITICAL: XCircle,
};

export default function Predict() {
  const { 
    inputs, sequence, result, isLoading, error, 
    setInput, setInputs, resetInputs, predict,
    addToSequence, removeFromSequence, clearSequence 
  } = usePrediction();
  const [activeTab, setActiveTab] = useState("input");
  const [validationErrors, setValidationErrors] = useState({});

  const validateInputs = () => {
    const errors = {};
    let isValid = true;
    inputFields.forEach((field) => {
      const val = inputs[field.name];
      // Handle cases where val might be undefined
      if (val === undefined || val === null || isNaN(val)) {
        errors[field.name] = "Value is required";
        isValid = false;
      } else if (val < field.min || val > field.max) {
        errors[field.name] = `Must be between ${field.min} and ${field.max}`;
        isValid = false;
      }
    });
    setValidationErrors(errors);
    return isValid;
  };

  const handleInputChange = (name, value) => {
    setInput(name, value);
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    resetInputs();
    setValidationErrors({});
  };

  const handlePredict = async () => {
    if (!validateInputs()) return;
    try {
      await predict();
      setActiveTab("result");
    } catch (e) {
      // error is already in store
    }
  };

  const loadSample = (key) => {
    setInputs(SAMPLE_INPUTS[key].data);
    setValidationErrors({});
  };

  const RiskIcon = result ? riskIcons[result.risk_level] || AlertTriangle : null;

  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Live <span className="gradient-text">Prediction</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Enter EV sensor readings to get real-time failure predictions,
              risk assessment, and maintenance recommendations.
            </p>
          </motion.div>

          {/* Sample Input Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="text-sm text-slate-400 self-center">Quick fill:</span>
            {Object.entries(SAMPLE_INPUTS).map(([key, sample]) => (
              <button
                key={key}
                onClick={() => loadSample(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  key === "healthy"
                    ? "border-success/30 text-success hover:bg-success/10"
                    : key === "warning"
                    ? "border-warning/30 text-warning hover:bg-warning/10"
                    : "border-danger/30 text-danger hover:bg-danger/10"
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Sequence History (Time-Series) */}
          <div className="mb-6 space-y-3">
            {sequence.length > 0 && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">
                  Time-Series Sequence (T-{sequence.length} to T0)
                </h3>
                <button onClick={clearSequence} className="text-xs text-danger hover:underline">Clear Sequence</button>
              </div>
            )}
            <div className="flex gap-3">
              <AnimatePresence>
                {sequence.map((seq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 bg-bg-tertiary border border-white/10 rounded-lg p-3 relative max-w-[200px]"
                  >
                    <button
                      onClick={() => removeFromSequence(i)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-danger"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-semibold text-accent mb-1">
                      T-{sequence.length - i} (History)
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                      <span>Spd: {seq.speed_kmh}</span>
                      <span>Volt: {seq.battery_voltage_v}</span>
                      <span>SoC: {seq.soc_pct}</span>
                      <span>Tmp: {seq.battery_temp_c}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {sequence.length > 0 && (
              <p className="text-xs text-slate-500">
                The model will calculate rolling features across this sequence to accurately detect sudden anomalies.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card hover={false} padding="p-0">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold">Sensor Inputs</h2>
                <p className="text-sm text-slate-400">Enter 12 sensor values</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {inputFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {field.icon} {field.displayName}
                      {field.unit && <span className="text-slate-500 ml-1">({field.unit})</span>}
                    </label>
                    <input
                      type="number"
                      value={inputs[field.name] ?? ""}
                      onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                      min={field.min}
                      max={field.max}
                      step={field.category === "temporal" ? 1 : 0.1}
                      className={`w-full px-3 py-2 rounded-lg bg-bg-tertiary border ${
                        validationErrors[field.name] ? "border-danger/50 focus:border-danger" : "border-white/10 focus:border-accent"
                      } text-white text-sm focus:ring-1 ${
                        validationErrors[field.name] ? "focus:ring-danger/30" : "focus:ring-accent/30"
                      } outline-none transition-colors`}
                    />
                    <div className="mt-1 flex justify-between items-center">
                      {validationErrors[field.name] ? (
                        <span className="text-danger text-[10px] font-medium">{validationErrors[field.name]}</span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Range: {field.min} to {field.max}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <Button onClick={handlePredict} disabled={isLoading} className="flex-1">
                  {isLoading ? <LoadingSpinner size="sm" text="" /> : <><Play className="w-4 h-4" /> {sequence.length > 0 ? "Predict Sequence" : "Predict"}</>}
                </Button>
                {sequence.length < 2 && (
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      if (validateInputs()) addToSequence();
                    }} 
                    className="flex-1 border-accent/30 text-accent hover:bg-accent/10"
                  >
                    <Plus className="w-4 h-4" /> Add to Sequence
                  </Button>
                )}
                <Button variant="secondary" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-danger/10 border border-danger/20"
                  >
                    <p className="text-danger text-sm">{error}</p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Risk Level Banner */}
                    <Card
                      hover={false}
                      className="border-2"
                      style={{
                        borderColor: RISK_COLORS[result.risk_level],
                        backgroundColor: RISK_BG_COLORS[result.risk_level],
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {RiskIcon && (
                            <RiskIcon
                              className="w-8 h-8"
                              style={{ color: RISK_COLORS[result.risk_level] }}
                            />
                          )}
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: FAILURE_COLORS[result.predicted_class] }}>
                              {formatClassName(result.predicted_class)}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {getRiskDescription(result.risk_level)}
                            </p>
                          </div>
                        </div>
                        <Badge color={result.risk_level === "LOW" ? "success" : result.risk_level === "MEDIUM" ? "warning" : "danger"} size="lg">
                          {result.risk_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Confidence: <strong className="text-white">{(result.confidence * 100).toFixed(1)}%</strong></span>
                        <span>Model: <strong className="text-white">v{result.model_version}</strong></span>
                      </div>
                    </Card>

                    {/* Probabilities */}
                    <Card hover={false}>
                      <h3 className="text-lg font-semibold mb-4">Class Probabilities</h3>
                      <ProbabilityChart probabilities={result.probabilities} />
                    </Card>

                    {/* Recommendations */}
                    <Card hover={false}>
                      <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {result.recommendations?.slice(0, 5).map((rec, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              rec.severity === "CRITICAL"
                                ? "bg-danger/5 border-danger/20"
                                : rec.severity === "WARNING"
                                ? "bg-warning/5 border-warning/20"
                                : "bg-accent/5 border-accent/20"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                color={rec.severity === "CRITICAL" ? "danger" : rec.severity === "WARNING" ? "warning" : "accent"}
                                size="sm"
                              >
                                {rec.severity}
                              </Badge>
                              <span className="text-sm font-medium text-white">{rec.component}</span>
                            </div>
                            <p className="text-sm text-slate-400">{rec.message}</p>
                            <p className="text-xs text-slate-500 mt-1">Action: {rec.action}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {!result && !error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                      <Play className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Predict</h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                      Fill in the sensor values on the left or use a quick-fill preset,
                      then click Predict to get results.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Decision Support Dashboard — full-width below the two-column grid */}
          <AnimatePresence>
            {result?.decision_support && (
              <DecisionSupportPanel decisionSupport={result.decision_support} />
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
