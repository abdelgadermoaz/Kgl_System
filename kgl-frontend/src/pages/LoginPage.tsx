import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(`Welcome back, ${response.user.name}!`);

      // Redirect based on role
      const role = response.user.role;
      if (role === 'MANAGER') navigate('/dashboard/manager');
      else if (role === 'SALES_AGENT') navigate('/dashboard/sales');
      else if (role === 'DIRECTOR') navigate('/dashboard/director');
      
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <button 
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
      </button>

      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">KGL System</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Operations Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              dark:text-white
              className="w-full mt-1 p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              dark:text-white
              className="w-full mt-1 p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}