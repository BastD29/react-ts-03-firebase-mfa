import { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/auth-context";

import Home from "./routes/Home";
import Profile from "./routes/Profile";
import RequireAuth from "./components/require-auth";
import Register from "./routes/Register";
import ConfirmEmail from "./routes/ConfirmEmail";
import AuthAction from "./components/auth-actions";
import AuthUserActions from "./routes/AuthUserActions";
import ForgotPassword from "./routes/ForgotPassword";
import PasswordReset from "./routes/PasswordReset";
import ConfirmMfaEnroll from "./routes/ConfirmMfaEnroll";
import SignInMfa from "./routes/SignInMfa";

function App() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // NOTE: console log for testing purposes
  console.log("User:", !!currentUser);

  // Check if the current user exists on the initial render.
  useEffect(() => {
    if (currentUser) {
      navigate("/profile");
    }
  }, [currentUser]);

  return (
    <Routes>
      <Route index element={<Home />} />
      {/* <Route path="profile" element={currentUser ? <Profile /> : <Home />} /> */}
      <Route
        path="profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="register" element={<Register />} />
      <Route path="confirm-email" element={<ConfirmEmail />} />
      <Route
        path="auth/action"
        element={
          <AuthAction>
            <AuthUserActions />
          </AuthAction>
        }
      />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="emulator/action" element={<PasswordReset />} />
      <Route
        path="confirm-mfa-enroll"
        element={
          <RequireAuth>
            <ConfirmMfaEnroll />
          </RequireAuth>
        }
      />
      <Route path="signin-with-mfa" element={<SignInMfa />} />
    </Routes>
  );
}

export default App;
