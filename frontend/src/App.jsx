import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Problem from "./pages/Problem";
import Pipeline from "./pages/Pipeline";
import Data from "./pages/Pipeline/Data";
import EDA from "./pages/Pipeline/EDA";
import Preprocessing from "./pages/Pipeline/Preprocessing";
import Features from "./pages/Pipeline/Features";
import Models from "./pages/Pipeline/Models";
import Evaluation from "./pages/Pipeline/Evaluation";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import Architecture from "./pages/Architecture";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/problem" element={<PageWrapper><Problem /></PageWrapper>} />
        <Route path="/pipeline" element={<PageWrapper><Pipeline /></PageWrapper>}>
          <Route path="data" element={<Data />} />
          <Route path="eda" element={<EDA />} />
          <Route path="preprocessing" element={<Preprocessing />} />
          <Route path="features" element={<Features />} />
          <Route path="models" element={<Models />} />
          <Route path="evaluation" element={<Evaluation />} />
        </Route>
        <Route path="/predict" element={<PageWrapper><Predict /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/architecture" element={<PageWrapper><Architecture /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-bg-primary text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
