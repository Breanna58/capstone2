import { Route, Routes, useSearchParams } from "react-router-dom";
import AuthForm from "../features/auth/AuthForm";
import { useMeQuery } from "../features/auth/authSlice";
import Dashboard from "../features/dashboard/Dashboard";



function App() {
  const [query] = useSearchParams();
  const token = query.get("token");

  const guestRouter = (
    <Routes>
      <Route path="/*" element={<AuthForm />} />
    </Routes>
  );
  const userRouter = (
    <Routes>
      <Route path="/*" element={<Dashboard token={token} />} />
    </Routes>
  );

  const { data: me } = useMeQuery(token);
  const loggedIn = !!me?.id;
  return loggedIn ? userRouter : guestRouter;
}

export default App;