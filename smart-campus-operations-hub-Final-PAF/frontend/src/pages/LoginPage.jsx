import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginApi, loginWithGoogle, fetchMe } from "../api/authApi";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const oauthError = location.state?.error;
  const passwordResetSuccess = location.state?.passwordReset;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle cases where the backend redirects back to the login page
  // with OAuth token and role in the query string (e.g. /login?token=...).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role") || "USER";
    const fullName = params.get("fullName") || "OAuth User";
    const email = params.get("email") || "";

    if (!token) return;

    const tempUser = {
      role,
      username: email || fullName,
      fullName,
      email,
    };

    // Store a temporary user so the token is available immediately
    login(tempUser, token);

    // Try to hydrate with the real profile (fullName, avatar, etc.)
    fetchMe()
      .then((res) => {
        if (res.success && res.data) {
          // Use the latest user data from backend
          login(res.data, token);
        }
      })
      .catch(() => {
        // If this fails, we still keep the session with the temp user
      });

    const target =
      role === "ADMIN"
        ? "/dashboard"
        : role === "TECHNICIAN"
        ? "/technician/dashboard"
        : "/welcome";

    navigate(target, { replace: true });
  }, [location.search, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(credentials);
      if (res.success && res.data) {
        const { token, id, username, email, role } = res.data;

        if (!token) {
          setError("Login failed: No authentication token received");
          setLoading(false);
          return;
        }

        const userData = { id, username, email, role, fullName: username };
        login(userData, token);

        if (role === "ADMIN") navigate("/dashboard");
        else if (role === "TECHNICIAN") navigate("/technician/dashboard");
        else navigate("/welcome");
      } else {
        setError(res.error?.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || oauthError) && (
          <div className="p-3 bg-error/5 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error || oauthError}
          </div>
        )}

        {passwordResetSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-sm font-medium">
            <span>✅</span>
            Password reset successfully! Please log in with your new password.
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Username or Email"
            name="usernameOrEmail"
            type="text"
            placeholder="admin / admin@smartcampus.com"
            value={credentials.usernameOrEmail}
            onChange={handleChange}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={handleChange}
            icon={Lock}
            required
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--color-border)] text-primary focus:ring-primary/20"
            />
            <span className="text-[var(--color-text-secondary)] font-medium">Remember me</span>
          </label>
          <Link to="/forgot-password" disabled className="text-primary font-bold hover:underline opacity-80">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          leftIcon={<LogIn className="w-4 h-4" />}
          className="w-full py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-premium h-11 bg-gradient-to-r from-primary to-indigo-500 hover:shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Sign In
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-divider)] opacity-50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
            <span className="bg-[var(--color-surface)] px-4 text-[var(--color-muted)] opacity-60">
              Nexus Connect
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={loginWithGoogle}
          variant="secondary"
          leftIcon={<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="h-5 w-5" alt="Google" />}
          className="w-full text-sm font-black shadow-soft h-11 border-[var(--color-border)] bg-[var(--color-surface-soft)]/50 rounded-xl uppercase tracking-wider"
        >
          Continue with Google
        </Button>

        <p className="text-center text-[var(--color-text-secondary)] text-[11px] font-black uppercase tracking-wider opacity-60">
          Need access?{" "}
          <Link
            to="/register"
            className="text-primary font-black hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
