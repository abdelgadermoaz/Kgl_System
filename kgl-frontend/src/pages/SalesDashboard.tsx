import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, LogOut, ShoppingCart, ListChecks, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { generateReceipt } from '../lib/generateReceipt';
import kglLogo from '../assets/kgl-logo.png';

export default function SalesDashboard() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [saleForm, setSaleForm] = useState({
    saleType: 'CASH', 
    produceName: '', 
    tonnageKg: '', 
    unitPriceUgx: '', 
    buyerName: '', 
    amountPaidUgx: '', 
    nationalIdNIN: '', 
    dueDate: '', 
    branch: 'Kampala HQ'
  });

  const fetchData = async () => {
    try {
      const [inv, sls] = await Promise.all([
        api.get('/inventory'),
        api.get('/sales')
      ]);
      setInventory(inv);
      setSales(sls);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch data');
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

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...saleForm,
        tonnageKg: Number(saleForm.tonnageKg),
        unitPriceUgx: Number(saleForm.unitPriceUgx),
        amountPaidUgx: Number(saleForm.amountPaidUgx)
      };

      if (saleForm.saleType === 'CASH') {
        delete payload.nationalIdNIN;
        delete payload.dueDate;
      } else {
        payload.dueDate = payload.dueDate ? new Date(payload.dueDate).toISOString() : new Date().toISOString();
      }

      await api.post('/sales', payload);
      toast.success('Sale recorded successfully!');
      setSaleForm({ 
        saleType: 'CASH', 
        produceName: '', 
        tonnageKg: '', 
        unitPriceUgx: '', 
        buyerName: '', 
        amountPaidUgx: '', 
        nationalIdNIN: '', 
        dueDate: '', 
        branch: 'Kampala HQ' 
      });
      fetchData(); 
    } catch (err: any) {
      if (err.errors) {
        err.errors.forEach((e: any) => toast.error(e.message));
      } else {
        toast.error(err.message || 'Failed to record sale');
      }
    }
  };

  const handlePayment = async (saleId: string, currentDue: number) => {
    const amountStr = window.prompt(`Enter payment amount (Remaining Balance: UGX ${currentDue.toLocaleString()}):`);
    if (!amountStr) return; 
    
    const paymentAmount = Number(amountStr);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (paymentAmount > currentDue) {
      toast.error('Payment cannot be greater than the remaining balance.');
      return;
    }

    try {
      await api.post(`/sales/${saleId}/pay`, { paymentAmount });
      toast.success('Payment recorded successfully!');
      fetchData(); 
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading secure system data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 p-8 transition-colors duration-300">
      
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <img src={kglLogo} alt="KGL Logo" className="h-10 w-auto" />
           KGL Sales Agent Workspace
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
            <ShoppingCart size={20} className="text-sky-500" /> Record New Sale
          </h2>
          <form onSubmit={handleSale} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Sale Type</label>
              <select className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.saleType} onChange={e => setSaleForm({...saleForm, saleType: e.target.value})}>
                <option value="CASH">Cash Sale</option>
                <option value="CREDIT">Credit Sale</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Produce Name (e.g., Maize)</label>
              <input required type="text" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.produceName} onChange={e => setSaleForm({...saleForm, produceName: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tonnage (Kg)</label>
                <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.tonnageKg} onChange={e => setSaleForm({...saleForm, tonnageKg: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Unit Price (UGX)</label>
                <input required type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.unitPriceUgx} onChange={e => setSaleForm({...saleForm, unitPriceUgx: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Buyer Name</label>
              <input required type="text" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.buyerName} onChange={e => setSaleForm({...saleForm, buyerName: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Amount Paid Today (UGX)</label>
              <input required type="number" min="0" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-sky-500" value={saleForm.amountPaidUgx} onChange={e => setSaleForm({...saleForm, amountPaidUgx: e.target.value})} />
            </div>

            {saleForm.saleType === 'CREDIT' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm mb-1 text-orange-800 dark:text-orange-300">National ID (NIN)</label>
                  <input required type="text" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-orange-500" value={saleForm.nationalIdNIN} onChange={e => setSaleForm({...saleForm, nationalIdNIN: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-orange-800 dark:text-orange-300">Due Date</label>
                  <input required type="datetime-local" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-orange-500" value={saleForm.dueDate} onChange={e => setSaleForm({...saleForm, dueDate: e.target.value})} />
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors mt-2">
              Complete Sale
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
              <ListChecks size={20} className="text-yellow-500" /> Available Stock to Sell
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                    <th className="p-2 border-b dark:border-gray-700">Produce</th>
                    <th className="p-2 border-b dark:border-gray-700">Stock Available</th>
                    <th className="p-2 border-b dark:border-gray-700">Min Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item._id} className="border-b dark:border-gray-700">
                      <td className="p-2 font-medium">{item.produceName}</td>
                      <td className="p-2">{item.quantityKg.toLocaleString()} kg</td>
                      <td className="p-2">UGX {item.sellingPriceUgx.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
              <ListChecks size={20} className="text-green-500" /> Recent Sales Ledger
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                    <th className="p-2 border-b dark:border-gray-700">Type</th>
                    <th className="p-2 border-b dark:border-gray-700">Buyer</th>
                    <th className="p-2 border-b dark:border-gray-700">Total (UGX)</th>
                    <th className="p-2 border-b dark:border-gray-700 text-orange-600">Balance Due</th>
                    <th className="p-2 border-b dark:border-gray-700">Status & Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2 font-bold text-gray-500">{sale.saleType}</td>
                      <td className="p-2">{sale.buyerName}</td>
                      <td className="p-2">UGX {sale.totalAmountUgx.toLocaleString()}</td>
                      <td className="p-2 font-mono text-orange-600 font-bold">
                        {sale.amountDueUgx > 0 ? `UGX ${sale.amountDueUgx.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {sale.saleType === 'CASH' || sale.creditStatus === 'PAID' ? (
                            <span className="text-green-600 font-bold">PAID</span> 
                          ) : (
                            <>
                              <span className="text-orange-500 font-bold">{sale.creditStatus}</span>
                              <button 
                                onClick={() => handlePayment(sale._id, sale.amountDueUgx)}
                                className="px-2 py-1 bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 rounded text-xs font-bold transition-colors"
                              >
                                Pay Balance
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => generateReceipt(sale)}
                            className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded transition-colors ml-auto"
                            title="Download Receipt"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No sales recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}