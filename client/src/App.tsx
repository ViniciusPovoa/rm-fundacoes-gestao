import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAvancada from "./pages/DashboardAvancada";
import Clientes from "./pages/Clientes";
import Obras from "./pages/Obras";
import Servicos from "./pages/Servicos";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import Equipamentos from "./pages/Equipamentos";
import VinculoEquipamentos from "./pages/VinculoEquipamentos";
import Relatorios from "./pages/Relatorios";
import GeradorContratos from "./pages/GeradorContratos";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route>
        <PrivateRoute>
          <Layout>
            <Switch>
              <Route path="/" component={DashboardAvancada} />
              <Route path="/clientes" component={Clientes} />
              <Route path="/obras" component={Obras} />
              <Route path="/servicos" component={Servicos} />
              <Route path="/despesas" component={Despesas} />
              <Route path="/receitas" component={Receitas} />
              <Route path="/equipamentos" component={Equipamentos} />
              <Route path="/vinculo-equipamentos" component={VinculoEquipamentos} />
              <Route path="/relatorios" component={Relatorios} />
              <Route path="/contratos" component={GeradorContratos} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </PrivateRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
