/**
 * EVGuard — Decision Support Panel
 * ====================================
 * Renders the human-centered Decision Support Dashboard beneath the
 * existing prediction results on the Predict page.
 *
 * Receives the `decision_support` object from the backend response
 * and presents it as a professional maintenance report using the
 * existing design system (Card, Badge, Framer Motion).
 *
 * This component is purely presentational — all business logic lives
 * in the backend decision_support.py engine.
 */

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Wrench,
  TrendingUp,
  DollarSign,
  Timer,
  CheckCircle2,
  XCircle,
  ListChecks,
  AlertTriangle,
  Building2,
  Sparkles,
  Info,
  Zap,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// ── Animation helpers ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// ── Color / style mappings ────────────────────────────────────────────────────

/** Maps safe_to_drive_state → visual config */
const DRIVE_STATE_CONFIG = {
  green: {
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    icon: ShieldCheck,
    badgeColor: "success",
  },
  yellow: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    icon: ShieldAlert,
    badgeColor: "warning",
  },
  red: {
    bg: "bg-danger/10",
    border: "border-danger/30",
    text: "text-danger",
    icon: ShieldX,
    badgeColor: "danger",
  },
};

/** Maps urgency → badge color */
const URGENCY_BADGE_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Critical: "danger",
};

/** Maps maintenance_priority_level → color accent class */
const PRIORITY_COLOR = {
  routine: "text-success",
  soon: "text-warning",
  high: "text-danger",
  immediate: "text-critical",
};

/** Maps operational_impact → color accent */
const IMPACT_COLOR = {
  None: "text-success",
  Minor: "text-accent-light",
  Moderate: "text-warning",
  High: "text-danger",
  Critical: "text-critical",
};

/** Maps cost impact → badge color */
const COST_BADGE_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  "Very High": "danger",
};

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * Safe-to-Drive large status card.
 * Color coded green/yellow/red with a large icon and plain-language note.
 */
function SafeToDriveCard({ safeToD, state, note }) {
  const config = DRIVE_STATE_CONFIG[state] || DRIVE_STATE_CONFIG.yellow;
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants}>
      <div
        className={`rounded-2xl p-6 border-2 ${config.bg} ${config.border} flex flex-col items-center text-center gap-3`}
      >
        <Icon className={`w-14 h-14 ${config.text}`} strokeWidth={1.5} />
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">
            Safe to Drive
          </p>
          <p className={`text-xl font-bold ${config.text}`}>{safeToD}</p>
        </div>
        <p className="text-sm text-slate-300 max-w-xs">{note}</p>
      </div>
    </motion.div>
  );
}

/**
 * Compact metric card used for Priority, Timeline, Cost, Downtime.
 */
function MetricCard({ icon: Icon, label, value, valueClass = "text-white", sub }) {
  return (
    <motion.div variants={itemVariants}>
      <Card hover={false} padding="p-5" className="h-full">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/5 shrink-0">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className={`text-base font-bold leading-tight ${valueClass}`}>{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1 leading-snug">{sub}</p>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Checklist card — benefits (green check) or consequences (red X).
 */
function ChecklistCard({ title, icon: TitleIcon, items, iconColor, checkIcon: CheckIcon }) {
  return (
    <motion.div variants={itemVariants}>
      <Card hover={false} padding="p-6" className="h-full">
        <div className="flex items-center gap-2 mb-4">
          <TitleIcon className={`w-5 h-5 ${iconColor}`} />
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckIcon
                className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`}
              />
              <span className="text-sm text-slate-300 leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

/**
 * Action Plan numbered checklist.
 */
function ActionPlanCard({ steps }) {
  return (
    <motion.div variants={itemVariants}>
      <Card hover={false} padding="p-6">
        <div className="flex items-center gap-2 mb-5">
          <ListChecks className="w-5 h-5 text-accent-light" />
          <h4 className="font-semibold text-white">Action Plan</h4>
        </div>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              {/* Numbered circle */}
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent-light">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300 leading-snug pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </motion.div>
  );
}

/**
 * Feature observations card — only rendered when there are observations.
 */
function ObservationsCard({ observations }) {
  if (!observations || observations.length === 0) return null;

  return (
    <motion.div variants={itemVariants}>
      <Card hover={false} padding="p-5" className="border-warning/20 bg-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-warning" />
          <h4 className="text-sm font-semibold text-warning">Sensor Observations</h4>
        </div>
        <ul className="space-y-2">
          {observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning/70" />
              <span className="text-xs text-slate-300 leading-snug">{obs}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * DecisionSupportPanel
 *
 * @param {{ decisionSupport: import('./types').DecisionSupport }} props
 */
export default function DecisionSupportPanel({ decisionSupport }) {
  if (!decisionSupport) return null;

  const {
    title,
    summary,
    confidence_note,
    urgency,
    safe_to_drive,
    safe_to_drive_state,
    safe_to_drive_note,
    maintenance_priority,
    maintenance_priority_level,
    recommended_timeline,
    business_impact,
    operational_impact,
    operational_impact_note,
    estimated_cost_impact,
    estimated_downtime,
    feature_observations,
    benefits_of_action,
    consequences_of_ignoring,
    action_plan,
  } = decisionSupport;

  const urgencyBadgeColor = URGENCY_BADGE_COLOR[urgency] || "warning";
  const priorityTextClass = PRIORITY_COLOR[maintenance_priority_level] || "text-white";
  const impactTextClass = IMPACT_COLOR[operational_impact] || "text-white";
  const costBadgeColor = COST_BADGE_COLOR[estimated_cost_impact] || "warning";

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-10"
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
          <Sparkles className="w-5 h-5 text-accent-light" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Decision Support Dashboard</h2>
          <p className="text-sm text-slate-400">
            Plain-language guidance based on your vehicle&rsquo;s current data
          </p>
        </div>
      </div>

      {/* ── Animated content grid ──────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* 1 — Title + urgency */}
        <motion.div variants={itemVariants}>
          <Card hover={false} padding="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400">{confidence_note}</p>
              </div>
              <Badge color={urgencyBadgeColor} size="lg">
                {urgency} Urgency
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* 2 — Summary */}
        <motion.div variants={itemVariants}>
          <Card hover={false} padding="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-accent-light" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  What&rsquo;s Happening
                </h4>
                <p className="text-base text-white leading-relaxed">{summary}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 3 — Safe to drive + metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SafeToDriveCard
            safeToD={safe_to_drive}
            state={safe_to_drive_state}
            note={safe_to_drive_note}
          />

          <div className="flex flex-col gap-4">
            <MetricCard
              icon={Wrench}
              label="Maintenance Priority"
              value={maintenance_priority}
              valueClass={priorityTextClass}
            />
            <MetricCard
              icon={Clock}
              label="Recommended Timeline"
              value={recommended_timeline}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetricCard
              icon={TrendingUp}
              label="Operational Impact"
              value={operational_impact}
              valueClass={impactTextClass}
              sub={operational_impact_note}
            />
            <MetricCard
              icon={Timer}
              label="Estimated Downtime"
              value={estimated_downtime}
            />
          </div>
        </div>

        {/* 4 — Sensor observations (conditional) */}
        <ObservationsCard observations={feature_observations} />

        {/* 5 — Business impact + cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div variants={itemVariants}>
            <Card hover={false} padding="p-5" className="h-full">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 shrink-0">
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 font-medium">
                    Business Impact
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">{business_impact}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hover={false} padding="p-5" className="h-full">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 shrink-0">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-medium">
                    Estimated Cost Impact
                  </p>
                  <Badge color={costBadgeColor} size="md" className="mb-2">
                    {estimated_cost_impact}
                  </Badge>
                  <p className="text-xs text-slate-400 leading-snug mt-1">
                    Addressing this issue early may help reduce future repair costs.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 6 — Benefits + Consequences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistCard
            title="Benefits of Acting Now"
            icon={CheckCircle2}
            iconColor="text-success"
            items={benefits_of_action}
            checkIcon={CheckCircle2}
          />
          <ChecklistCard
            title="Consequences of Ignoring"
            icon={AlertTriangle}
            iconColor="text-danger"
            items={consequences_of_ignoring}
            checkIcon={XCircle}
          />
        </div>

        {/* 7 — Action Plan */}
        <ActionPlanCard steps={action_plan} />
      </motion.div>
    </motion.section>
  );
}
