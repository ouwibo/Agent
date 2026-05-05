import { Switch, Route, Router as WouterRouter } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import AgentPage from "@/pages/agent";
import NotFound from "@/pages/not-found";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%", height: "100%" }}
    >
      <Component />
    </motion.div>
  );
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={() => <AnimatedRoute component={Home} />} />
        <Route path="/dashboard" component={() => <AnimatedRoute component={Dashboard} />} />
        <Route path="/agent" component={() => <AnimatedRoute component={AgentPage} />} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}