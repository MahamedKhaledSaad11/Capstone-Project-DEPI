import { motion } from "framer-motion";
import { Users, Target, GraduationCap, Calendar, BookOpen, Award } from "lucide-react";
import Card from "../../components/ui/Card";

const team = [
  { name: "Mahmoud Sherif ", role: "Ai Engineer" },
  { name: "Mohamed Khaled ", role: "Machine Learning Engineer" },
  { name: "Mariam Amro ", role: "Machine Learning Engineer" },
  { name: "David Ayad", role: "Data Scientist" },
  { name: "Roaa Mamdoh", role: "Data Scientist" },
  { name: "Malak Mohamed", role: "Data Scientist" },
];

const techStack = [
  { category: "Machine Learning", items: ["LightGBM", "Scikit-learn", "ADASYN", "XGBoost"] },
  { category: "Backend", items: ["FastAPI", "Pydantic v2", "Uvicorn", "Python 3.11"] },
  { category: "Frontend", items: ["React 18", "Vite", "Tailwind CSS", "Recharts", "Three.js"] },
  { category: "DevOps", items: ["Docker", "Render", "Netlify", "GitHub Actions"] },
];

export default function About() {
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <GraduationCap className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">DEPI Graduation Project</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="gradient-text">EVGuard</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              An AI-powered Electric Vehicle Predictive Maintenance system,
              developed as a graduation capstone project for the Digital Egypt Pioneers Initiative.
            </p>
          </motion.div>

          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card glow>
              <Target className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mission</h3>
              <p className="text-slate-400 text-sm">
                Reduce EV downtime and prevent catastrophic failures through
                proactive, data-driven maintenance scheduling.
              </p>
            </Card>
            <Card glow>
              <BookOpen className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Methodology</h3>
              <p className="text-slate-400 text-sm">
                Following the CRISP-DM framework across 6 phases: Business Understanding,
                Data Understanding, Data Preparation, Modeling, Evaluation, and Deployment.
              </p>
            </Card>
            <Card glow>
              <Award className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Achievement</h3>
              <p className="text-slate-400 text-sm">
                99.43% accuracy with LightGBM, selected from 6 competing models
                including XGBoost, Random Forest, SVM, k-NN, and Logistic Regression.
              </p>
            </Card>
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Technology Stack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((stack) => (
                <Card key={stack.category}>
                  <h3 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">
                    {stack.category}
                  </h3>
                  <ul className="space-y-2">
                    {stack.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-slate-400">{member.role}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Academic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="text-center max-w-2xl mx-auto" glow>
              <Calendar className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Academic Information</h3>
              <div className="space-y-1 text-sm text-slate-400">
                <p>Digital Egypt Pioneers Initiative (DEPI)</p>
                <p>Data Science</p>
                <p>Graduation Year: 2026</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
