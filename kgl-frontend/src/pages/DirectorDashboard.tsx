import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, LogOut, Wallet, AlertCircle, Building2, TrendingUp, Package, Search, Calendar, Users, Receipt, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import kglLogo from '../assets/kgl-logo.png';

export default function DirectorDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- EXPENSE FORM STATE ---
  const [expenseForm, setExpenseForm] = useState({
    category: 'TRANSPORT',
    amountUgx: '',
    description: ''
  });

  const fetchExecutiveData = async () => {
    try {
      const [reports, sls, exps] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/sales'),
        api.get('/expenses')
      ]);
      setReportData(reports);
      setSales(sls);
      setExpenses(exps);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch executive data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- HANDLE EXPENSE SUBMISSION ---
  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...expenseForm,
        amountUgx: Number(expenseForm.amountUgx)
      });
      toast.success('Operating expense recorded!');
      setExpenseForm({ category: 'TRANSPORT', amountUgx: '', description: '' });
      fetchExecutiveData(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  // --- FILTER LOGIC ---
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sale.produceName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'PAID' && (sale.saleType === 'CASH' || sale.creditStatus === 'PAID')) ||
                           (statusFilter === 'PENDING' && sale.creditStatus === 'PENDING');

      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      const matchesStart = !startDate || saleDate >= startDate;
      const matchesEnd = !endDate || saleDate <= endDate;

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [sales, searchQuery, statusFilter, startDate, endDate]);

  // --- CHART DATA PROCESSING ---
  const revenueData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!dailyData[date]) dailyData[date] = 0;
      dailyData[date] += sale.totalAmountUgx;
    });
    return Object.keys(dailyData).map(date => ({ date, Revenue: dailyData[date] })).reverse();
  }, [sales]);

  const produceData = useMemo(() => {
    const itemData: Record<string, number> = {};
    sales.forEach(sale => {
      if (!itemData[sale.produceName]) itemData[sale.produceName] = 0;
      itemData[sale.produceName] += sale.tonnageKg;
    });
    return Object.keys(itemData).map(name => ({ name, 'Kg Sold': itemData[name] }));
  }, [sales]);

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading secure executive data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 p-8 transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <img src={kglLogo} alt="KGL Logo" className="h-10 w-auto" />  
          KGL Executive Board
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
          </button>
          <button onClick={() => navigate('/dashboard/director/users')} className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 rounded-lg hover:bg-sky-100 transition-colors">
            <Users size={18} /> Manage Team
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <LogOut size={18} /> Logout  
          </button>
        </div>
      </div>

      {/* --- FINANCIAL KPIs (4 Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-green-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <ArrowUpRight size={18} /> <span>Gross Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">UGX {reportData?.totalRevenueUgx?.toLocaleString() || 0}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-red-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <ArrowDownRight size={18} /> <span>Operating Expenses</span>
          </div>
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">UGX {reportData?.totalExpensesUgx?.toLocaleString() || 0}</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-purple-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Wallet size={18} /> <span>Net Profit</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">UGX {reportData?.netProfitUgx?.toLocaleString() || 0}</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <AlertCircle size={18} /> <span>Outstanding Credit</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">UGX {reportData?.totalPendingCreditUgx?.toLocaleString() || 0}</h3>
        </div>
      </div>

      {/* --- EXPENSE MANAGER SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <Receipt size={20} className="text-red-500" /> Log Operating Expense
          </h2>
          <form onSubmit={handleRecordExpense} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Category</label>
              <select className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                <option value="TRANSPORT">Transport & Logistics</option>
                <option value="RENT">Facility Rent</option>
                <option value="SALARIES">Payroll & Salaries</option>
                <option value="UTILITIES">Utilities (Water, Power)</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Amount (UGX)</label>
              <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500" value={expenseForm.amountUgx} onChange={e => setExpenseForm({...expenseForm, amountUgx: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <input required type="text" placeholder="e.g., Fuel for delivery truck" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors shadow-lg shadow-red-600/20">
              Deduct Expense
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[380px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2 shrink-0">
            Recent Expenses Ledger
          </h2>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 sticky top-0">
                <tr>
                  <th className="p-3 border-b dark:border-gray-700">Date</th>
                  <th className="p-3 border-b dark:border-gray-700">Category</th>
                  <th className="p-3 border-b dark:border-gray-700">Description</th>
                  <th className="p-3 border-b dark:border-gray-700 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-3 text-gray-500">{new Date(exp.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-medium">
                      <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[10px] font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{exp.description}</td>
                    <td className="p-3 text-right font-mono text-red-500 font-bold">- UGX {exp.amountUgx.toLocaleString()}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No expenses recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-green-500" /> Revenue Trend</h2>
          <div className="h-72 w-full" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(val) => `UGX ${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="Revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Package className="text-sky-500" /> Volume Sold</h2>
          <div className="h-72 w-full" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={produceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(val) => `${val} kg`} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} cursor={{ fill: theme === 'dark' ? '#374151' : '#f3f4f6' }} formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, 'Volume']} />
                <Bar dataKey="Kg Sold" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-xl border border-gray-200 dark:border-gray-700 border-b-0 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search buyer or produce..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-sky-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="p-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-sky-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid Only</option>
          <option value="PENDING">Pending Credit</option>
        </select>

        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <input type="date" className="p-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>to</span>
          <input type="date" className="p-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Global Sales Activity Table */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                <th className="p-3 border-b dark:border-gray-700">Date</th>
                <th className="p-3 border-b dark:border-gray-700">Agent</th>
                <th className="p-3 border-b dark:border-gray-700">Type</th>
                <th className="p-3 border-b dark:border-gray-700">Produce</th>
                <th className="p-3 border-b dark:border-gray-700">Buyer</th>
                <th className="p-3 border-b dark:border-gray-700">Total (UGX)</th>
                <th className="p-3 border-b dark:border-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-sky-600 dark:text-sky-400">{sale.salesAgentName}</td>
                  <td className="p-3 font-bold text-gray-500">{sale.saleType}</td>
                  <td className="p-3">{sale.produceName} ({sale.tonnageKg}kg)</td>
                  <td className="p-3">{sale.buyerName}</td>
                  <td className="p-3 font-mono">UGX {sale.totalAmountUgx.toLocaleString()}</td>
                  <td className="p-3">
                    {(sale.saleType === 'CASH' || sale.creditStatus === 'PAID') 
                      ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">PAID</span> 
                      : <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{sale.creditStatus}</span>}
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No matching sales found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}