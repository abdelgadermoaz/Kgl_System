import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, LogOut, LineChart, Wallet, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectorDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExecutiveData = async () => {
      try {
        const [reports, sls] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/sales')
        ]);
        setReportData(reports);
        setSales(sls);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch executive data');
      } finally {
        setLoading(false);
      }
    };
    fetchExecutiveData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading secure executive data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 p-8 transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <Building2 /> KGL Executive Board
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-green-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Wallet size={18} /> <span>Gross Revenue</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">UGX {reportData?.totalRevenueUgx?.toLocaleString() || 0}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <AlertCircle size={18} /> <span>Outstanding Credit</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">UGX {reportData?.totalPendingCreditUgx?.toLocaleString() || 0}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-sky-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <LineChart size={18} /> <span>Total Inventory Value</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">UGX {reportData?.totalInventoryValueUgx?.toLocaleString() || 0}</h3>
        </div>
      </div>

      {/* Global Sales Ledger */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
          Global Sales Activity
        </h2>
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
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-sky-600 dark:text-sky-400">{sale.salesAgentName}</td>
                  <td className="p-3 font-bold text-gray-500">{sale.saleType}</td>
                  <td className="p-3">{sale.produceName} ({sale.tonnageKg}kg)</td>
                  <td className="p-3">{sale.buyerName}</td>
                  <td className="p-3 font-mono">UGX {sale.totalAmountUgx.toLocaleString()}</td>
                  <td className="p-3">
                    {sale.saleType === 'CASH' 
                      ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">PAID</span> 
                      : <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{sale.creditStatus}</span>}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">No company sales recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}