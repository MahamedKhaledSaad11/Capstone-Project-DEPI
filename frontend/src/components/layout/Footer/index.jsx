import { Link } from "react-router-dom";
import { Zap, Code, Briefcase, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xl font-bold text-white">
                EV<span className="text-accent">Guard</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md">
              AI-powered predictive maintenance for electric vehicles.
              Leveraging LightGBM machine learning to predict failures
              before they happen, keeping EVs safe and efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {["Home", "About", "Problem", "Pipeline", "Predict", "Dashboard"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                      className="text-sm text-slate-400 hover:text-accent transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* ML Pipeline */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              ML Pipeline
            </h3>
            <ul className="space-y-2">
              {[
                "Data Collection",
                "EDA",
                "Preprocessing",
                "Feature Engineering",
                "Model Training",
                "Evaluation",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/pipeline/${item.toLowerCase().replace(/\s+/g, "-").replace("feature-engineering", "features").replace("model-training", "models").replace("data-collection", "data")}`}
                    className="text-sm text-slate-400 hover:text-accent transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} EVGuard. DEPI Graduation Project.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-accent transition-colors"
            >
              <Code className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-accent transition-colors"
            >
              <Briefcase className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@evguard.dev"
              className="text-slate-500 hover:text-accent transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
