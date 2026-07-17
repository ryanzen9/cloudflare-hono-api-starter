import { Navigate, Route, Routes } from "react-router";
import "./App.css";
import { AuthLayout } from "./components/AuthLayout";
import { LoginFailurePage } from "./pages/LoginFailurePage";
import { LoginPage } from "./pages/LoginPage";
import { LoginSuccessPage } from "./pages/LoginSuccessPage";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="login/success" element={<LoginSuccessPage />} />
        <Route path="login/failure" element={<LoginFailurePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
