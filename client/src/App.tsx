import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Obras from "./pages/Obras";
import Servicos from "./pages/Servicos";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import Equipamentos from "./pages/Equipamentos";
import VinculoEquipamentos from "./pages/VinculoEquipamentos";
import Relatorios from "./pages/Relatorios";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/clientes"} component={Clientes} />
        <Route path={"/obras"} component={Obras} />
        <Route path={"/servicos"} component={Servicos} />
        <Route path={"/despesas"} component={Despesas} />
        <Route path={"/receitas"} component={Receitas} />
        <Route path={"/equipamentos"} component={Equipamentos} />
        <Route path={"/vinculo-equipamentos"} component={VinculoEquipamentos} />
        <Route path={"/relatorios"} component={Relatorios} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
