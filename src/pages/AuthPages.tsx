import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui";

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: any;
}) {
  return (
    <div className="grid min-h-[calc(100vh-7rem)] place-items-center py-6">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <img
            src="/storyhub-logo.png"
            className="mx-auto h-20 w-20 rounded-2xl"
          />
          <h1 className="mt-5 text-2xl font-black">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
}
export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  return (
    <AuthLayout
      title="Login to Your Account"
      subtitle="Masuk dan lanjutkan cerita favoritmu."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          setLoading(true);
          try {
            await login(email, password);
            nav("/");
          } catch (e: any) {
            setErr(e.message);
          } finally {
            setLoading(false);
          }
        }}
        className="mt-7 space-y-4"
      >
        <label className="block text-sm font-semibold">
          Email
          <div className="relative mt-2">
            <Mail
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              type="email"
              placeholder="...@gmail.com"
              required
            />
          </div>
        </label>
        <label className="block text-sm font-semibold">
          Password
          <div className="relative mt-2">
            <LockKeyhole
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-11"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {err && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
            {err}
          </div>
        )}
        <Button disabled={loading} className="w-full">
          {loading ? "Masuk…" : "Login"}
        </Button>
        <div className="text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-primary">
            Register Here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: any) =>
    setForm((v) => ({ ...v, [k]: e.target.value }));
  return (
    <AuthLayout
      title="Register to StoryHub"
      subtitle="Buat akun dan mulai menerbitkan cerita."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          setLoading(true);
          try {
            await register(form);
            nav("/login");
          } catch (e: any) {
            setErr(e.message);
          } finally {
            setLoading(false);
          }
        }}
        className="mt-7 space-y-4"
      >
        <Field icon={<UserRound size={17} />} label="Full Name">
          <Input
            value={form.name}
            onChange={set("name")}
            placeholder="Nama lengkap"
            required
          />
        </Field>
        <Field icon={<UserRound size={17} />} label="Username">
          <Input
            value={form.username}
            onChange={set("username")}
            placeholder="username"
            required
          />
        </Field>
        <Field icon={<Mail size={17} />} label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="...@gmail.com"
            required
          />
        </Field>
        <Field icon={<LockKeyhole size={17} />} label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            required
          />
        </Field>
        {err && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
            {err}
          </div>
        )}
        <Button disabled={loading} className="w-full">
          {loading ? "Mendaftar…" : "Register"}
        </Button>
        <div className="text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-primary">
            Login Here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
function Field({
  icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: any;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="relative mt-2">{children}</div>
    </label>
  );
}
