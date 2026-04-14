import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md">
        <div className="border border-stone-200 bg-white p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Vastu Blueprint
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div data-testid="register-error" className="p-3 border border-red-300 bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}
            <div>
              <Label className="text-xs uppercase tracking-wider text-stone-600 font-mono">Full Name</Label>
              <Input
                data-testid="register-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none border-stone-300 mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-stone-600 font-mono">Email</Label>
              <Input
                data-testid="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-stone-300 mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-stone-600 font-mono">Password</Label>
              <Input
                data-testid="register-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-stone-300 mt-1"
                placeholder="Min 6 characters"
                required
              />
            </div>
            <Button
              data-testid="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none py-6"
            >
              {loading ? <span className="font-mono">Creating account...</span> : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-stone-600 mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" data-testid="go-to-login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
