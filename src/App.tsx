/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Box, 
  CalendarCheck, 
  CheckCircle2, 
  BarChart3, 
  Activity,
  Bell,
  Settings,
  ShieldCheck,
  Zap,
  MoreVertical,
  AlertTriangle,
  TrendingDown,
  BarChart4
} from 'lucide-react';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from './constants';
import { Room, Booking, UserRole, AppNotification } from './types';
import { cn, getConflict } from './lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths 
} from 'date-fns';

type Tab = 'dashboard' | 'inventory' | 'booking' | 'approvals' | 'analytics' | 'optimization';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [role, setRole] = useState<UserRole>('Administrator');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  const addNotification = React.useCallback((title: string, message: string, type: AppNotification['type'] = 'Info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const handleApplyBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    addNotification('Booking Requested', `Your request for ${newBooking.roomId} is pending approval.`, 'Success');
  };

  const menuItems = useMemo(() => {
    const items: { id: string, label: string, icon: React.ReactNode, roles: UserRole[] }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['Administrator'] },
      { id: 'inventory', label: 'Resource Map', icon: <Box size={18} />, roles: ['Administrator', 'Faculty'] },
      { id: 'booking', label: 'Booking Ledger', icon: <CalendarCheck size={18} />, roles: ['Administrator', 'Faculty', 'Student'] },
      { id: 'approvals', label: 'Approvals', icon: <CheckCircle2 size={18} />, roles: ['Administrator'] },
      { id: 'optimization', label: 'AI Optimization', icon: <Zap size={18} />, roles: ['Administrator'] },
      { id: 'analytics', label: 'Predictive Analytics', icon: <BarChart3 size={18} />, roles: ['Administrator'] },
    ];
    return items.filter(item => item.roles.includes(role));
  }, [role]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: startOfWeek(start), end: endOfWeek(end) });
    return days;
  }, [currentMonth]);

  const monthBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'Approved');
  }, [bookings]);

  // Handle auto-tab switch if current tab is not allowed for new role
  React.useEffect(() => {
    const allowed = menuItems.find(i => i.id === activeTab);
    if (!allowed && menuItems.length > 0) {
      setActiveTab(menuItems[0].id as Tab);
    }
  }, [role, menuItems, activeTab]);

  return (
    <div className="flex min-h-screen bg-background font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col">
        <div className="p-6 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">IQ</div>
            <span className="text-xl font-bold tracking-tight">CampusIQ <span className="text-indigo-600">AI</span></span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-2 font-bold">Infrastructure Intelligence</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(item => (
            <React.Fragment key={item.id}>
              <NavItem 
                active={activeTab === item.id} 
                onClick={() => setActiveTab(item.id as Tab)} 
                icon={item.icon} 
                label={item.label} 
              />
            </React.Fragment>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} alt={role} className="w-full h-full" />
            </div>
            <div>
              <p className="text-xs font-bold">{role}</p>
              <p className="text-[10px] text-slate-500">Campus Infrastructure Control</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-8 h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">Infrastructure Intelligence</h1>
            <span className="text-slate-400 text-xs hidden sm:inline-block">Real-time optimization of campus resources</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 outline-none"
              >
                <option value="Administrator">Administrator</option>
                <option value="Faculty">Faculty</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Live Monitor</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100 relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative"
              >
                <Bell size={18} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm" />
                )}
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</span>
                      <button 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs italic">No notifications yet.</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default", !notif.read && "bg-indigo-50/20")}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                notif.type === 'Success' ? "bg-emerald-50 text-emerald-600" : 
                                notif.type === 'Warning' ? "bg-amber-50 text-amber-600" :
                                "bg-indigo-50 text-indigo-600"
                              )}>
                                {notif.type}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Settings size={18} /></button>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && role === 'Administrator' && <DashboardView bookings={bookings} rooms={rooms} />}
              {activeTab === 'inventory' && (role === 'Administrator' || role === 'Faculty') && <InventoryView rooms={rooms} />}
              {activeTab === 'booking' && <BookingView rooms={rooms} bookings={bookings} onApply={handleApplyBooking} role={role} addNotification={addNotification} />}
              {activeTab === 'approvals' && role === 'Administrator' && <ApprovalsView bookings={bookings} setBookings={setBookings} addNotification={addNotification} rooms={rooms} />}
              {activeTab === 'optimization' && role === 'Administrator' && <OptimizationView rooms={rooms} bookings={bookings} />}
              {activeTab === 'analytics' && role === 'Administrator' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/20 transition-all transform hover:scale-110 active:scale-95 group flex items-center gap-2 overflow-hidden">
            <Zap size={20} />
            <span className="max-w-0 transition-all duration-500 group-hover:max-w-xs group-hover:ml-2 font-bold text-sm tracking-tight overflow-hidden whitespace-nowrap">
              Instant optimization
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

// Components

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 flex items-center gap-3 transition-all duration-200",
        active 
          ? "bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500 shadow-[inset_0_0_10px_rgba(108,99,255,0.1)] translate-x-1" 
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// Updated Components

function DashboardView({ bookings, rooms }: { bookings: Booking[], rooms: Room[] }) {
  const chartData = [
    { name: 'Mon', usage: 65 },
    { name: 'Tue', usage: 78 },
    { name: 'Wed', usage: 92 },
    { name: 'Thu', usage: 84 },
    { name: 'Fri', usage: 70 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="TAM Efficiency" value="₹1.2M" trend="+12.4%" color="indigo" />
        <StatCard label="Conflict Prevention" value="99.2%" trend="Stable" color="emerald" pulse />
        <StatCard label="Room Utilization" value="84.5%" trend="+5.2%" color="amber" />
        <StatCard label="Predicted Savings" value="18.4%" trend="Optimized" color="indigo" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl text-slate-900 font-bold">Resource Demand Heatmap</h2>
              <p className="text-slate-500 text-xs font-medium">Weekly utilization variance</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded bg-slate-900 text-white text-[10px] font-bold">Peak</span>
              <span className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">Normal</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4f46e5' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Optimization Engine */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-indigo-500/20 flex justify-between items-center bg-indigo-500/5">
            <h2 className="font-display text-lg text-white font-bold">AI Optimization Engine</h2>
            <Zap className="text-secondary" size={20} />
          </div>
          <div className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto">
            <OptimizationCard 
              id="EFFICIENCY_RULE_01" 
              time="2m ago" 
              message={<>Seminar Hall A is <span className="text-indigo-300 font-bold">80% underutilized</span>; recommend shifting <span className="text-secondary font-bold">Lab CS-1</span> here.</>}
              canExecute
            />
            <OptimizationCard 
              id="HVAC_OPT_44" 
              time="14m ago" 
              message={<>Main Library occupancy dropping. Suggest scaling down <span className="text-tertiary">Sector 4 HVAC</span> to energy-save mode.</>}
            />
            <OptimizationCard 
              id="CONFLICT_RESOLVED" 
              time="25m ago" 
              message={<>Predicted clash between <span className="font-bold">Maths-II</span> and <span className="font-bold">Physics Lab</span> resolved by auto-extending Block B session.</>}
              status="System Self-Healed"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Resource Distribution */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-slate-900 font-bold mb-6">Load Distribution</h3>
          <div className="space-y-4">
             {[
               { label: 'Academic Block', val: 88, color: 'bg-indigo-500' },
               { label: 'Lab Wing', val: 74, color: 'bg-emerald-500' },
               { label: 'Admin Central', val: 32, color: 'bg-amber-500' },
               { label: 'Hostel Areas', val: 15, color: 'bg-slate-400' },
             ].map(item => (
               <div key={item.label} className="space-y-1.5">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      className={cn("h-full rounded-full", item.color)} 
                    />
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Real-time table */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-lg text-slate-900 font-bold">Real-time Occupancy</h2>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase tracking-wider">32 Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Facility / Lab</th>
                  <th className="px-6 py-4">Current Load</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.slice(0, 3).map((room, idx) => (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-bold text-sm">{room.name}</span>
                        <span className="text-[10px] text-slate-500">{room.building}, Level {room.floor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                      {idx === 1 ? '482 / 450' : `${Math.floor(room.capacity * 0.8)} / ${room.capacity}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {idx === 1 ? '107%' : '80%'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-2 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit border",
                        idx === 1 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", idx === 1 ? "bg-red-600 animate-pulse" : "bg-emerald-600")} />
                        {idx === 1 ? 'CRITICAL' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <BarChart4 size={18} />
                      </button>
                    </td>
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

function StatCard({ label, value, trend, color, pulse }: { label: string, value: string, trend: string, color: string, pulse?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
        <Activity size={12} className="text-slate-300" />
      </div>
      <div className="flex items-end justify-between">
        <p className={cn(
          "text-2xl font-bold",
          color === 'indigo' ? "text-indigo-600" : color === 'emerald' ? "text-emerald-600" : "text-amber-600"
        )}>{value}</p>
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
        )}>{trend}</span>
      </div>
      {pulse && (
        <div className="mt-4 flex items-center gap-2">
           <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%] animate-pulse" />
           </div>
           <span className="text-[8px] font-bold text-emerald-600 uppercase">Stable</span>
        </div>
      )}
    </div>
  );
}

function OptimizationCard({ id, time, message, canExecute, status }: { id: string, time: string, message: React.ReactNode, canExecute?: boolean, status?: string }) {
  return (
    <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-4 relative group hover:bg-indigo-50/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[9px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">{id}</span>
        <span className="text-[9px] text-slate-400 font-bold">{time}</span>
      </div>
      <div className="text-xs font-medium text-slate-700 leading-relaxed">{message}</div>
      {canExecute && (
        <button className="mt-3 w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          Apply Optimized Routing
        </button>
      )}
      {status && (
        <div className="mt-2 flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
           <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">{status}</span>
        </div>
      )}
    </div>
  );
}

function InventoryView({ rooms }: { rooms: Room[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Campus Inventory</h2>
          <p className="text-slate-500 text-sm ml-4">Real-time optimization of {rooms.length} campus resources.</p>
        </div>
        <button className="bg-slate-900 text-white hover:bg-black px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-slate-200">Add Resource</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                room.type === 'Lab' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" :
                room.type === 'Auditorium' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100" :
                "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
              )}>
                {room.type === 'Lab' ? <Activity size={20} /> : room.type === 'Auditorium' ? <LayoutDashboard size={20} /> : <CalendarCheck size={20} />}
              </div>
              <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 rounded-lg font-bold uppercase tracking-widest border border-slate-100">
                REF: {room.id}
              </span>
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base leading-tight">{room.name}</h3>
              <p className="text-slate-500 text-xs mt-1">{room.building} • Floor {room.floor}</p>
            </div>
            <div className="flex gap-4 border-y border-slate-50 py-4">
              <div className="flex-1">
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Capacity</p>
                <p className="text-slate-700 font-mono font-bold text-sm">{room.capacity} seats</p>
              </div>
              <div className="flex-1 border-l border-slate-50 pl-4">
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Type</p>
                <p className="text-slate-700 font-bold text-sm">{room.type}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 ring-1 ring-slate-200">+4</div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-100 rounded-lg"><Settings size={14} /></button>
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-100 rounded-lg"><Activity size={14} className="rotate-45" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingView({ rooms, bookings, onApply, role, addNotification }: { rooms: Room[], bookings: Booking[], onApply: (b: Booking) => void, role: UserRole, addNotification: (t: string, m: string, type: AppNotification['type']) => void }) {
  const [viewMode, setViewMode] = useState<'form' | 'calendar'>('form');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    roomId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    purpose: '',
    userName: role === 'Administrator' ? 'Admin IQ' : role === 'Faculty' ? 'Prof. Sharma' : 'Devika (Student)',
    priority: role === 'Administrator' ? 3 : role === 'Faculty' ? 2 : 1
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: startOfWeek(start), end: endOfWeek(end) });
  }, [currentMonth]);

  const hasBookingOnDay = (day: Date) => {
    return bookings.some(b => b.status === 'Approved' && isSameDay(new Date(b.startTime), day));
  };

  // Keep formData in sync with role
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userName: role === 'Administrator' ? 'Admin IQ' : role === 'Faculty' ? 'Prof. Sharma' : 'Devika (Student)',
      priority: role === 'Administrator' ? 3 : role === 'Faculty' ? 2 : 1
    }));
  }, [role]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const conflict = useMemo(() => {
    if (!formData.roomId) return null;
    const s = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const e = new Date(`${formData.date}T${formData.endTime}`).toISOString();
    return getConflict({ roomId: formData.roomId, startTime: s, endTime: e }, bookings);
  }, [formData, bookings]);

  // Trigger conflict notification
  React.useEffect(() => {
    if (conflict) {
      addNotification(
        'Collision Detected', 
        `Conflict with ${conflict.userName}'s session in ${rooms.find(r => r.id === formData.roomId)?.name}. AI recommends redirecting to Seminar Hall A.`, 
        'Warning'
      );
    }
  }, [conflict, rooms, formData.roomId, addNotification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict) return;

    const s = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const e_time = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      roomId: formData.roomId,
      userId: 'u_dev',
      userName: formData.userName,
      startTime: s,
      endTime: e_time,
      purpose: formData.purpose,
      status: 'Pending',
      priority: formData.priority,
    };

    onApply(newBooking);
    setNotification({ type: 'success', msg: 'Booking request sent for approval!' });
    setFormData({ ...formData, purpose: '', roomId: '' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Booking Ledger</h2>
          <p className="text-slate-500 text-sm">Schedule and manage campus infrastructure with automated conflict resolution.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setViewMode('form')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              viewMode === 'form' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Form View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              viewMode === 'calendar' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Calendar
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'form' ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Select Resource</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 ring-indigo-500/10 font-medium"
                value={formData.roomId}
                onChange={e => setFormData({...formData, roomId: e.target.value})}
                required
              >
                <option value="">Select a facility...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} - {r.building}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Date</label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Role/Priority</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                  disabled={role !== 'Administrator'}
                >
                  <option value={1}>Student</option>
                  <option value={2}>Faculty</option>
                  <option value={3}>Admin/System</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Start Time</label>
                <input 
                  type="time"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">End Time</label>
                <input 
                  type="time"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Purpose of Request</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 h-24 resize-none"
                placeholder="Briefly state intended use..."
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!!conflict}
            className={cn(
              "w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg",
              conflict 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
            )}
          >
            {conflict ? <AlertTriangle size={18} /> : <Zap size={18} />}
            {conflict ? 'Conflict Detected' : 'Execute Booking'}
          </button>
        </form>

        {/* Real-time Preview / Conflicts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              Conflict Engine Snapshot
            </h3>
            
            {conflict ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-red-50 border border-red-100 rounded-xl space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-red-600 ">
                    <AlertTriangle size={18} />
                    <span className="font-bold text-xs uppercase tracking-wider">Collision Detected</span>
                  </div>
                  <span className="text-[9px] font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">#CONFLICT</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                   The resource <span className="font-bold text-slate-900">{rooms.find(r => r.id === formData.roomId)?.name}</span> is already engaged by <span className="font-bold text-indigo-700">{conflict.userName}</span> for their session.
                </div>
                <div className="pt-4 border-t border-red-100">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-3 tracking-widest">AI Recommends Resolution</p>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 bg-indigo-600 text-white text-[9px] px-2 py-1 rounded-bl font-bold">92% MATCH</div>
                    <p className="text-xs font-bold text-indigo-900 mb-2">Switch slot to Seminar Hall A</p>
                    <ul className="text-[10px] space-y-1.5 text-indigo-700">
                      <li className="flex items-center gap-2">• Distance: 15m from current building</li>
                      <li className="flex items-center gap-2">• Hardware: Full A/V compatible</li>
                    </ul>
                    <button 
                      onClick={() => {
                        setFormData({...formData, roomId: '4'});
                        addNotification('Optimization Applied', 'Rerouted to Seminar Hall A based on AI availability prediction.', 'Success');
                      }}
                      className="mt-3 w-full bg-white text-indigo-600 text-[10px] font-bold py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors uppercase tracking-wider"
                    >
                      Apply Intelligent Routing
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-center">
                <Activity size={32} className="text-slate-200 mb-3" />
                <p className="text-slate-400 text-xs font-medium">Monitoring for overlap (O(n log n))</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-lg",
                  notification.type === 'success' ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-red-600 text-white shadow-red-100"
                )}
              >
                <CheckCircle2 size={18} />
                {notification.msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    ) : (
      <motion.div 
        key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  <Activity size={18} className="rotate-180" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  <Activity size={18} />
                </button>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Click a date to start booking
              </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase border-r border-slate-50 last:border-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const isSelected = isSameDay(day, new Date(formData.date));
                const currentMonthDay = isSameMonth(day, currentMonth);
                const bookingsOnDay = hasBookingOnDay(day);

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, date: format(day, 'yyyy-MM-dd') });
                      setViewMode('form');
                      addNotification('Date Selected', `Selected date updated to ${format(day, 'PPP')}`, 'Info');
                    }}
                    className={cn(
                      "h-32 p-3 border-r border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative group",
                      !currentMonthDay && "opacity-30",
                      isSelected && "bg-indigo-50/50 ring-1 ring-inset ring-indigo-200"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-indigo-600" : "text-slate-600",
                      isSameDay(day, new Date()) && "bg-indigo-600 text-white px-1.5 py-0.5 rounded"
                    )}>
                      {format(day, 'd')}
                    </span>

                    {bookingsOnDay && (
                      <div className="mt-2 space-y-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mx-auto" title="Allocated" />
                        <div className="text-[8px] text-indigo-400 font-bold uppercase text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          Allocated
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApprovalsView({ bookings, setBookings, addNotification, rooms }: { bookings: Booking[], setBookings: (b: any) => void, addNotification: (t: string, m: string, type: AppNotification['type']) => void, rooms: Room[] }) {
  const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
    const booking = bookings.find(b => b.id === id);
    setBookings((prev: Booking[]) => prev.map(b => b.id === id ? { ...b, status } : b));
    
    if (booking) {
      addNotification(
        `Request ${status}`, 
        `Booking for ${booking.roomId} by ${booking.userName} has been ${status.toLowerCase()}.`,
        status === 'Approved' ? 'Success' : 'Warning'
      );
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Queue Management</h2>
          <p className="text-slate-500 text-sm ml-4">Approve or redirect pending infrastructure requests.</p>
        </div>
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pending</span>
            <span className="text-sm font-bold text-slate-900">{pendingBookings.length}</span>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Potential Conflicts</span>
            <span className="text-sm font-bold text-red-600">
              {pendingBookings.filter(pb => getConflict(pb, bookings.filter(b => b.status === 'Approved'))).length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {pendingBookings.length === 0 && (
          <div className="bg-white border border-slate-200 border-dashed p-12 text-center rounded-2xl text-slate-400">
            Queue empty. No active requests found.
          </div>
        )}
        {pendingBookings.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          const conflict = getConflict(booking, bookings.filter(b => b.status === 'Approved'));
          
          return (
            <div key={booking.id} className={cn(
              "bg-white border p-6 rounded-2xl flex items-center justify-between group hover:shadow-sm transition-all",
              conflict ? "border-amber-200" : "border-slate-200"
            )}>
              <div className="flex gap-6 items-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
                  conflict ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 border-slate-100"
                )}>
                  {conflict ? <AlertTriangle size={20} /> : <Box size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-slate-900 font-bold">{booking.userName}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                      booking.priority === 3 ? "bg-red-50 text-red-600 border-red-100" :
                      booking.priority === 2 ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                      {booking.priority === 3 ? 'Admin Priority' : booking.priority === 2 ? 'Faculty' : 'Student'}
                    </span>
                    {conflict && (
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
                        Conflict Detected
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Requesting <span className="text-slate-900 font-bold">{room?.name || booking.roomId}</span> for <span className="italic">"{booking.purpose}"</span></p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                       <CalendarCheck size={12} />
                       {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {conflict && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[10px] text-amber-800 font-medium">Overlaps with <span className="font-bold">{conflict.userName}&apos;s</span> session. AI suggests redirecting to {rooms.find(r => r.capacity >= (room?.capacity || 0) && r.id !== room?.id)?.name || 'Alternate Hall'}.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(booking.id, 'Approved')}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                >
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={() => handleAction(booking.id, 'Rejected')}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
                >
                  <Activity size={18} className="rotate-45" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OptimizationView({ rooms, bookings }: { rooms: Room[], bookings: Booking[] }) {
  const recommendations = [
    { title: 'Consolidate High-Cap Labs', description: 'Lab CS-1 is currently 20% occupied. Moving this session to Room 302 would save 42% on power load.', efficiency: '+42%', type: 'Power' },
    { title: 'HVAC Duty Cycle Optimization', description: 'Block B has zero occupancy for the next 4 hours. Recommend shutdown of Sector 2 chilling unit.', efficiency: '+12%', type: 'Energy' },
    { title: 'Resource Redirect', description: 'Seminar A has a conflict. Redirecting the lower-priority event to Seminar B will resolve it with 0% time variance.', efficiency: 'Conflict Resolved', type: 'Scheduling' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-500 pl-4">Optimization Engine</h2>
          <p className="text-slate-500 text-sm ml-4">Algorithmic suggestions to improve campus efficiency.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2">
           <Zap size={16} fill="currentColor" />
           <span className="text-xs font-bold uppercase tracking-wider">Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                   {rec.type === 'Power' ? <Zap size={20} /> : rec.type === 'Energy' ? <Activity size={20} /> : <CalendarCheck size={20} />}
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{rec.efficiency}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{rec.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{rec.description}</p>
            </div>
            <button className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">Execute Recommendation</button>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-4">Predicted Savings: <span className="text-emerald-400">₹4.2L / Month</span></h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Our predictive model analysis shows that by automating room swaps during off-peak hours, the campus can reduce operational costs by up to 18%.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20">Initialize Full Automation</button>
          </div>
          <div className="h-48 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-center justify-center">
             <div className="flex gap-4">
                {[40, 70, 45, 90, 60].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-8 bg-emerald-500/40 border-t-2 border-emerald-400 rounded-t"
                    />
                    <span className="text-[10px] font-mono text-slate-500">M{i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
      </div>
    </div>
  );
}

function AnalyticsView() {
  const data = [
    { day: 'Mon', power: 45, water: 30, hvac: 60 },
    { day: 'Tue', power: 52, water: 35, hvac: 65 },
    { day: 'Wed', power: 65, water: 45, hvac: 80 },
    { day: 'Thu', power: 58, water: 40, hvac: 72 },
    { day: 'Fri', power: 48, water: 32, hvac: 62 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Infrastructure Analytics</h2>
          <p className="text-slate-500 text-sm ml-4">Predictive modeling and consumption variance maps.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">Export Ledger</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Run AI Audit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <h3 className="text-slate-900 font-bold mb-8 flex items-center gap-2">
            <BarChart4 className="text-indigo-600" size={18} />
            Utility Consumption Pulse
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="power" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="hvac" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <h3 className="text-slate-900 font-bold mb-8 flex items-center gap-2">
            <TrendingDown className="text-amber-600" size={18} />
            Anomaly Detection Stream
          </h3>
          <div className="space-y-3">
             {[
               { id: 'AN-89', type: 'Load Peak', block: 'Science', time: '10:45 AM', level: 'Critical' },
               { id: 'AN-90', type: 'HVAC Leak', block: 'Main Hall', time: '02:15 PM', level: 'Moderate' },
               { id: 'AN-92', type: 'Low Usage', block: 'Admin', time: 'Yesterday', level: 'Low' },
             ].map(a => (
               <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center border",
                     a.level === 'Critical' ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                   )}>
                     <AlertTriangle size={18} />
                   </div>
                   <div>
                     <p className="text-slate-900 font-bold text-sm leading-none mb-1">{a.type} Flagged</p>
                     <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{a.block} • {a.time}</p>
                   </div>
                 </div>
                 <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{a.id}</span>
               </div>
             ))}
          </div>
          <button className="mt-8 w-full py-3 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all">
             View Historical Logs
          </button>
        </div>
      </div>
    </div>
  );
}
