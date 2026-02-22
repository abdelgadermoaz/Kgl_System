import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'SALES_AGENT', 
    branch: 'Kampala HQ' 
  });

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/register', form);
      toast.success('New employee registered!');
      setForm({ name: '', email: '', password: '', role: 'SALES_AGENT', branch: 'Kampala HQ' });
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error creating user';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="p-10 text-center dark:text-white font-bold">Loading employee directory...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-8 text-gray-900 dark:text-gray-100">
      <button 
        onClick={() => navigate('/dashboard/director')} 
        className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-6 hover:underline font-medium"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <UserPlus size={20} className="text-sky-500" /> Register Employee
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Full Name</label>
              <input required placeholder="Name" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Email Address</label>
              <input required type="email" placeholder="email@kgl.com" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Initial Password</label>
              <input required type="password" placeholder="••••••••" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Role</label>
              <select className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="SALES_AGENT">Sales Agent</option>
                <option value="MANAGER">Branch Manager</option>
                <option value="DIRECTOR">Director</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded font-bold hover:bg-sky-700">
              Create Account
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <Users size={20} className="text-green-500" /> Current Employees
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                  <th className="p-3 border-b dark:border-gray-700">Name & Email</th>
                  <th className="p-3 border-b dark:border-gray-700">Role</th>
                  <th className="p-3 border-b dark:border-gray-700">Branch</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="p-3">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded-full text-[10px] font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{u.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}