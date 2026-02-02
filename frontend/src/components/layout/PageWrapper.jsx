import { motion } from "framer-motion";
import { Leaf, LayoutDashboard, UploadCloud } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function PageWrapper({ children }) {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="relative px-5 py-2.5 group">
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-slate-900 rounded-full shadow-lg shadow-slate-900/20"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div
          className={`relative flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
            isActive
              ? "text-white"
              : "text-slate-500 group-hover:text-slate-900"
          }`}
        >
          <Icon size={18} />
          {label}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen mesh-bg selection:bg-emerald-200 selection:text-emerald-900">
      {/* Floating Navbar */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 no-print">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="glass-panel rounded-full p-1.5 flex items-center gap-1 pr-2"
        >
          <div className="pl-5 pr-6 flex items-center gap-3 border-r border-slate-200/60 mr-2 py-1">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/30">
              <Leaf size={18} fill="currentColor" />
            </div>
            <div>
              <span className="block font-bold text-slate-900 tracking-tight leading-none">
                PET Perplexity
              </span>
              <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
                Agglomeration 2.0
              </span>
            </div>
          </div>

          <NavItem to="/" icon={UploadCloud} label="Upload" />
          <NavItem to="/result" icon={LayoutDashboard} label="Analysis" />
        </motion.div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-25 pb-20 px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
