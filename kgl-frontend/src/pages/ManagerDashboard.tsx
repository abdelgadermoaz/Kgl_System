import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, LogOut, PackagePlus, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [procureForm, setProcureForm] = useState({
    produceName: '', 
    produceType: '', 
    tonnageKg: '', 
    costUgx: '', 
    sellingPriceUgx: '', 
    dealerName: '', 
    branch: 'Kampala HQ'
  });

  const fetchData = async () => {
    try {
      const [reports, inv] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/inventory')
      ]);
      setReportData(reports);
      setInventory(inv);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/procurements', {
        ...procureForm,
        tonnageKg: Number(procureForm.tonnageKg),
        costUgx: Number(procureForm.costUgx),
        sellingPriceUgx: Number(procureForm.sellingPriceUgx)
      });
      toast.success('Procurement recorded successfully!');
      setProcureForm({ produceName: '', produceType: '', tonnageKg: '', costUgx: '', sellingPriceUgx: '', dealerName: '', branch: 'Kampala HQ' });
      fetchData(); 
    } catch (err: any) {
      toast.error(err.message || 'Failed to record procurement');
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading secure system data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 p-8 transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <BarChart3 /> KGL Manager Workspace
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">UGX {reportData?.totalRevenueUgx?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Credit (Due)</p>
          <h3 className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-2">UGX {reportData?.totalPendingCreditUgx?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Inventory Value</p>
          <h3 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-2">UGX {reportData?.totalInventoryValueUgx?.toLocaleString() || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Procurement Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <PackagePlus size={20} className="text-yellow-500" /> Receive New Stock
          </h2>
          <form onSubmit={handleProcurement} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Produce Name</label>
              <input required type="text" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={procureForm.produceName} onChange={e => setProcureForm({...procureForm, produceName: e.target.value})} placeholder="e.g., Maize" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tonnage (Kg)</label>
                <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={procureForm.tonnageKg} onChange={e => setProcureForm({...procureForm, tonnageKg: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Cost (UGX)</label>
                <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={procureForm.costUgx} onChange={e => setProcureForm({...procureForm, costUgx: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Selling Price / Kg (UGX)</label>
              <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={procureForm.sellingPriceUgx} onChange={e => setProcureForm({...procureForm, sellingPriceUgx: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Supplier Name</label>
              <input required type="text" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={procureForm.dealerName} onChange={e => setProcureForm({...procureForm, dealerName: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded transition-colors mt-2">
              Record Procurement
            </button>
          </form>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <TrendingUp size={20} className="text-green-500" /> Current Inventory
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                  <th className="p-3 border-b dark:border-gray-700">Produce</th>
                  <th className="p-3 border-b dark:border-gray-700">Branch</th>
                  <th className="p-3 border-b dark:border-gray-700">Stock (Kg)</th>
                  <th className="p-3 border-b dark:border-gray-700">Price/Kg</th>
                  <th className="p-3 border-b dark:border-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No inventory found. Procure stock to begin.</td></tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-medium">{item.produceName}</td>
                      <td className="p-3 text-sm">{item.branch}</td>
                      <td className="p-3 font-mono">{item.quantityKg?.toLocaleString() || 0} kg</td>
                      <td className="p-3 font-mono">UGX {item.sellingPriceUgx?.toLocaleString() || 0}</td>
                      <td className="p-3">
                        {item.quantityKg < item.lowStockThresholdKg 
                          ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Low Stock</span>
                          : <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Healthy</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}