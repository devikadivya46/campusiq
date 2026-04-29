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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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
      { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} />, roles: ['Administrator'] },
      { id: 'inventory', label: 'Resource Inventory', icon: <Box size={18} />, roles: ['Administrator', 'Faculty'] },
      { id: 'booking', label: 'Booking Management', icon: <CalendarCheck size={18} />, roles: ['Administrator', 'Faculty', 'Student'] },
      { id: 'approvals', label: 'Approval Module', icon: <ShieldCheck size={18} />, roles: ['Administrator'] },
      { id: 'optimization', label: 'Optimization Module', icon: <Zap size={18} />, roles: ['Administrator'] },
      { id: 'analytics', label: 'Usage & Analytics', icon: <BarChart4 size={18} />, roles: ['Administrator'] },
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
      <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 z-50 flex flex-col">
        <div className="p-5 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">IQ</div>
            <span className="text-lg font-bold tracking-tight">CampusIQ <span className="text-indigo-600">AI</span></span>
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">Infrastructure Intelligence</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-0.5">
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
      <main className="ml-56 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-6 h-14 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none uppercase">System Control</h1>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Node: Sector-07</span>
            </div>
            
            <div className="hidden xl:flex items-center relative group">
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-slate-50 border border-slate-200 rounded-lg px-8 py-1.5 text-[11px] font-medium w-64 outline-none focus:ring-2 ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
              />
              <div className="absolute left-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Box size={12} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 pr-6">
               <div className="flex flex-col">
                  <span className="text-slate-900 tabular-nums">1.2ms</span>
                  <span>Latency</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-emerald-500">Optimal</span>
                  <span>System</span>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider outline-none hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 pl-3 relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors relative bg-slate-50 rounded-lg border border-slate-100"
                >
                  <Bell size={16} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      className="absolute right-0 top-12 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Logs</span>
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-[9px] font-bold text-indigo-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-[10px] italic">No logs.</div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default", !notif.read && "bg-indigo-50/10")}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                    "text-[8px] font-bold px-1 py-0.5 rounded uppercase",
                                    notif.type === 'Success' ? "bg-emerald-50 text-emerald-600" : 
                                    notif.type === 'Warning' ? "bg-amber-50 text-amber-600" :
                                    "bg-indigo-50 text-indigo-600"
                                    )}>
                                    {notif.type}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-900">{notif.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-lg border border-slate-100"><Settings size={16} /></button>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
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

        {/* Global Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
            <div className="flex flex-col md:flex-row items-center gap-3 text-[9px] font-black uppercase tracking-widest leading-none">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Encrypted Pulse</span>
              </div>
              <span className="hidden md:block w-1.5 h-px bg-slate-200" />
              <span>CampusIQ v2.4.0</span>
              <span className="hidden md:block w-1.5 h-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Activity size={12} className="text-indigo-500" />
                <span>Node Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-tight">
              <a href="#" className="hover:text-indigo-600 transition-all">Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-all">Keys</a>
              <a href="#" className="hover:text-indigo-600 transition-all">Status</a>
              <div className="pl-6 border-l border-slate-100 flex items-center gap-2 text-slate-300">
                <LayoutDashboard size={12} />
                <span className="text-[9px]">© 2024 INFRA-INTEL</span>
              </div>
            </div>
          </div>
        </footer>
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-indigo-600 hover:bg-black text-white p-3 rounded-full shadow-xl shadow-indigo-100 transition-all transform hover:scale-110 active:scale-95 group flex items-center gap-2 overflow-hidden">
            <Zap size={18} />
            <span className="max-w-0 transition-all duration-300 group-hover:max-w-xs group-hover:ml-1 font-black text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">
              Optimize
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
        "w-full px-3 py-2 flex items-center gap-2.5 transition-all duration-200",
        active 
          ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 shadow-[inset_0_0_10px_rgba(108,99,255,0.05)] translate-x-1" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

// Updated Components

function DashboardView({ bookings, rooms }: { bookings: Booking[], rooms: Room[] }) {
  const approvedToday = bookings.filter(b => b.status === 'Approved' && isSameDay(new Date(b.startTime), new Date()));
  const pending = bookings.filter(b => b.status === 'Pending').length;
  
  const inUseCount = rooms.filter(r => {
    const nowISO = new Date().toISOString();
    return approvedToday.some(b => b.roomId === r.id && b.startTime <= nowISO && b.endTime >= nowISO);
  }).length;

  const chartData = [
    { name: 'Mon', usage: 65 },
    { name: 'Tue', usage: 78 },
    { name: 'Wed', usage: 92 },
    { name: 'Thu', usage: 84 },
    { name: 'Fri', usage: 70 },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Row - Matching User Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard 
          label="Available now" 
          value={rooms.length - inUseCount} 
          subLabel={`of ${rooms.length} rooms`} 
          color="text-emerald-500" 
        />
        <DashboardStatCard 
          label="In use now" 
          value={inUseCount} 
          subLabel="rooms occupied" 
          color="text-red-500" 
        />
        <DashboardStatCard 
          label="Bookings today" 
          value={approvedToday.length} 
          subLabel="approved" 
          color="text-slate-900" 
        />
        <DashboardStatCard 
          label="Pending" 
          value={pending} 
          subLabel="need approval" 
          color="text-orange-500" 
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Utilization */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-base text-slate-900 font-bold mb-6">Weekly utilization by resource type</h2>
          <div className="flex items-end justify-between gap-4 h-48">
            {[
              { label: 'Classrooms', val: 72, color: 'bg-blue-500' },
              { label: 'Labs', val: 88, color: 'bg-emerald-500' },
              { label: 'Seminar halls', val: 45, color: 'bg-orange-600' },
              { label: 'Equipment', val: 60, color: 'bg-amber-600' },
            ].map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-end relative h-36">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.val}%` }}
                    className={cn("w-full absolute bottom-0", item.color)} 
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-900">{item.label}</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.val}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking status breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-base text-slate-900 font-bold mb-6">Booking status breakdown</h2>
          <div className="flex items-center justify-between gap-4 h-48">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: 50, color: '#3b82f6' },
                      { name: 'Completed', value: 32, color: '#10b981' },
                      { name: 'Rejected', value: 9, color: '#ef4444' },
                      { name: 'Pending', value: 9, color: '#f59e0b' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { color: '#3b82f6' },
                      { color: '#10b981' },
                      { color: '#ef4444' },
                      { color: '#f59e0b' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1 pl-4 border-l border-slate-100">
              {[
                { label: 'Approved', val: 50, color: 'bg-blue-500' },
                { label: 'Completed', val: 32, color: 'bg-emerald-500' },
                { label: 'Rejected', val: 9, color: 'bg-red-500' },
                { label: 'Pending', val: 9, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-slate-400">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live availability heatmap */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <h2 className="text-base text-slate-900 font-bold mb-6 italic">Live availability heatmap — today</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th />
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'].map(day => (
                  <th key={day} className="pb-3 px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map(time => (
                <tr key={time}>
                  <td className="pr-6 py-1 text-[10px] font-bold text-slate-500 text-right">{time}</td>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const isBooked = Math.random() > 0.6;
                    return (
                      <td key={i} className="p-0.5">
                        <div className={cn(
                          "h-8 rounded flex items-center justify-center text-[9px] font-bold border transition-all",
                          isBooked 
                            ? "bg-red-50 text-red-700 border-red-100" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        )}>
                          {isBooked ? 'Booked' : 'Free'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization insights */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <h2 className="text-base text-slate-900 font-bold mb-4">Optimization Engine</h2>
        <div className="space-y-2">
          <OptimizationInsightCard 
            message="Seminar Hall B has only 45% utilization. Consider reassigning small-group bookings from Lab 3 (88% full)."
          />
          <OptimizationInsightCard 
            message="Peak demand: 10 AM – 12 PM. 6 resources reach 90% occupancy. Stagger scheduling recommended."
          />
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({ label, value, subLabel, color }: { label: string, value: string | number, subLabel: string, color: string }) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">{label}</p>
      <div className="space-y-0.5">
        <h3 className={cn("text-3xl font-black tracking-tighter", color)}>{value}</h3>
        <p className="text-[10px] font-bold text-slate-300 uppercase">{subLabel}</p>
      </div>
    </div>
  );
}

function OptimizationInsightCard({ message }: { message: string }) {
  return (
    <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-2.5">
      <Zap size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
      <p className="text-[10px] text-indigo-900 font-bold leading-tight">{message}</p>
    </div>
  );
}

function StatCard({ label, value, trend, color, pulse }: { label: string, value: string, trend: string, color: string, pulse?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1.5">
        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">{label}</p>
        <Activity size={10} className="text-slate-300" />
      </div>
      <div className="flex items-end justify-between">
        <p className={cn(
          "text-xl font-black tracking-tight",
          color === 'indigo' ? "text-indigo-600" : color === 'emerald' ? "text-emerald-600" : "text-amber-600"
        )}>{value}</p>
        <span className={cn(
          "text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
        )}>{trend}</span>
      </div>
      {pulse && (
        <div className="mt-3 flex items-center gap-2">
           <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%] animate-pulse" />
           </div>
           <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
        </div>
      )}
    </div>
  );
}

function OptimizationCard({ id, time, message, canExecute, status }: { id: string, time: string, message: React.ReactNode, canExecute?: boolean, status?: string }) {
  return (
    <div className="border border-indigo-100 bg-indigo-50/30 rounded-lg p-3 relative group hover:bg-indigo-50/50 transition-colors">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[8px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black">{id}</span>
        <span className="text-[8px] text-slate-400 font-bold">{time}</span>
      </div>
      <div className="text-[11px] font-bold text-slate-700 leading-tight">{message}</div>
      {canExecute && (
        <button className="mt-2.5 w-full bg-indigo-600 text-white text-[9px] font-black py-1.5 rounded-md hover:bg-black transition-all shadow-sm uppercase tracking-widest">
          Deploy node
        </button>
      )}
      {status && (
        <div className="mt-1.5 flex items-center gap-1">
           <div className="w-1 h-1 rounded-full bg-indigo-500" />
           <span className="text-[8px] text-indigo-700 font-black uppercase tracking-widest">{status}</span>
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
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
             <div className="w-1 h-6 bg-indigo-500 rounded-full" />
             Resource Inventory
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 ml-3">Managing {rooms.length} System Resources</p>
        </div>
        <button className="bg-slate-900 text-white hover:bg-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg active:scale-95">Add Resource</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start">
              <div className={cn(
                "p-2 rounded-lg transition-colors border",
                room.type === 'Lab' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                room.type === 'Auditorium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-indigo-50 text-indigo-600 border-indigo-100"
              )}>
                {room.type === 'Lab' ? <Activity size={16} /> : room.type === 'Auditorium' ? <LayoutDashboard size={16} /> : <CalendarCheck size={16} />}
              </div>
              <span className="text-[8px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded font-bold uppercase border border-slate-100">
                L: {room.floor}
              </span>
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-xs truncate">{room.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{room.building}</p>
            </div>
            <div className="flex gap-3 pt-2 border-t border-slate-50">
              <div className="flex-1">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Capacity</p>
                <p className="text-slate-700 font-mono font-bold text-[10px]">{room.capacity}</p>
              </div>
              <div className="flex-1 border-l border-slate-50 pl-3">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Type</p>
                <p className="text-slate-700 font-bold text-[10px]">{room.type}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 mt-auto">
              <div className="flex -space-x-1.5">
                {[1, 2].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-100 overflow-hidden ring-1 ring-slate-200 shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=u${i}${room.id}`} alt="user" />
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <button className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"><Settings size={12} /></button>
                <button className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Activity size={12} className="rotate-45" /></button>
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
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">Booking Management</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Scheduling & Pulse Coordination</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setViewMode('form')}
            className={cn(
              "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
              viewMode === 'form' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Form
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={cn(
              "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Target node</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 ring-indigo-500/10 font-bold text-[11px]"
                value={formData.roomId}
                onChange={e => setFormData({...formData, roomId: e.target.value})}
                required
              >
                <option value="">Select facility...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} - {r.building}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Date Pulse</label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Priority</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                  disabled={role !== 'Administrator'}
                >
                  <option value={1}>Student</option>
                  <option value={2}>Faculty</option>
                  <option value={3}>Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Start</label>
                <input 
                  type="time"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">End</label>
                <input 
                  type="time"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Intent</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 h-20 resize-none text-[11px] font-bold"
                placeholder="State purpose..."
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
              "w-full py-3 rounded-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg text-[10px]",
              conflict 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-indigo-600 hover:bg-black text-white shadow-indigo-100"
            )}
          >
            {conflict ? <AlertTriangle size={14} /> : <Zap size={14} />}
            {conflict ? 'Node Engaged' : 'Execute Booking'}
          </button>
        </form>

        {/* Real-time Preview / Conflicts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <h3 className="text-slate-900 text-xs font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-600" />
              Conflict Monitor
            </h3>
            
            {conflict ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-red-600 ">
                    <AlertTriangle size={14} />
                    <span className="font-black text-[9px] uppercase tracking-widest">Collsion</span>
                  </div>
                  <span className="text-[8px] font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black">#ERR</span>
                </div>
                <div className="text-[10px] text-slate-700 font-bold leading-tight">
                   Resource engaged by <span className="text-indigo-600">{conflict.userName}</span>.
                </div>
                <div className="pt-3 border-t border-red-100">
                  <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">AI Recommendation</p>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <p className="text-[10px] font-black text-indigo-900 mb-1">Reroute to Seminar Hall A</p>
                    <button 
                      onClick={() => {
                        setFormData({...formData, roomId: '4'});
                        addNotification('Optimization Applied', 'Rerouted to Seminar Hall A.', 'Success');
                      }}
                      className="mt-2 w-full bg-white text-indigo-600 text-[9px] font-black py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                    >
                      Process Reroute
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-50 rounded-lg flex flex-col items-center justify-center text-center">
                <Activity size={24} className="text-slate-100 mb-2" />
                <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Scanning pulses...</p>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <Activity size={14} className="rotate-180" />
                </button>
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <Activity size={14} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/20">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
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
                    }}
                    className={cn(
                      "h-20 p-2 border-r border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative group",
                      !currentMonthDay && "opacity-20",
                      isSelected && "bg-indigo-50/50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold",
                      isSelected ? "text-indigo-600" : "text-slate-400",
                      isSameDay(day, new Date()) && "bg-indigo-600 text-white px-1 rounded-sm"
                    )}>
                      {format(day, 'd')}
                    </span>

                    {bookingsOnDay && (
                      <div className="absolute right-1 top-1">
                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
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
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 border-l-2 border-indigo-600 pl-3">Approval Module</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 ml-3">Reviewing Pending Infrastructure Requests</p>
        </div>
        <div className="flex bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
            <span className="text-xs font-black text-slate-900 tabular-nums">{pendingBookings.length}</span>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Conflicts</span>
            <span className="text-xs font-black text-red-600 tabular-nums">
              {pendingBookings.filter(pb => getConflict(pb, bookings.filter(b => b.status === 'Approved'))).length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {pendingBookings.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 text-center rounded-xl text-slate-300 font-black uppercase text-[10px] tracking-widest">
            Queue clear
          </div>
        )}
        {pendingBookings.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          const conflict = getConflict(booking, bookings.filter(b => b.status === 'Approved'));
          
          return (
            <div key={booking.id} className={cn(
              "bg-white border p-4 rounded-xl flex items-center justify-between group hover:shadow-sm transition-all",
              conflict ? "border-amber-200 bg-amber-50/10" : "border-slate-200"
            )}>
              <div className="flex gap-4 items-center">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all border shrink-0",
                  conflict ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white border-slate-100"
                )}>
                  {conflict ? <AlertTriangle size={16} /> : <Box size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-bold text-xs">{booking.userName}</h3>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase border",
                      booking.priority === 3 ? "bg-red-50 text-red-600 border-red-100" :
                      booking.priority === 2 ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                      {booking.priority === 3 ? 'Admin' : booking.priority === 2 ? 'Faculty' : 'Student'}
                    </span>
                    {conflict && (
                      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase animate-pulse">
                        Conflict
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold mt-0.5">Requesting <span className="text-slate-900">{room?.name || booking.roomId}</span> for <span className="text-slate-400 font-medium">"{booking.purpose}"</span></p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black uppercase tracking-tight">
                       <CalendarCheck size={10} />
                       {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleAction(booking.id, 'Approved')}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                >
                  <CheckCircle2 size={16} />
                </button>
                <button 
                  onClick={() => handleAction(booking.id, 'Rejected')}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
                >
                  <Activity size={16} className="rotate-45" />
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 border-l-2 border-emerald-500 pl-3">Optimization Module</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 ml-3">Strategic Efficiency Engine</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-2">
           <Zap size={14} fill="currentColor" />
           <span className="text-[9px] font-black uppercase tracking-widest tracking-tighter">Live Scan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                   {rec.type === 'Power' ? <Zap size={16} /> : rec.type === 'Energy' ? <Activity size={16} /> : <CalendarCheck size={16} />}
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{rec.efficiency}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mb-1">{rec.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold leading-tight">{rec.description}</p>
            </div>
            <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all border border-transparent shadow-lg shadow-slate-100">Sync node</button>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Predicted ROI: <span className="text-emerald-400">₹4.2L / mo</span></h3>
            <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-5 opacity-80">Our predictive model reduces operational variance by automating intelligent room swaps during off-peak windows.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-500/10">Initialize Flow</button>
          </div>
          <div className="h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
             <div className="flex gap-3">
                {[40, 70, 45, 90, 60].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: `${h}%` }}
                      className="w-6 bg-emerald-500/20 border-t border-emerald-400 rounded-t-sm"
                    />
                    <span className="text-[8px] font-mono font-bold text-slate-500">M{i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -mr-24 -mt-24" />
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
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 border-l-2 border-indigo-600 pl-3">Admin Analytics</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 ml-3">System-wide resource utilization</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">Export Ledger</button>
          <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Run AI Audit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart4 className="text-indigo-600" size={14} />
            Utility Pulse
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={9} fontWeight="bold" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="power" fill="#4f46e5" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="hvac" fill="#10b981" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingDown className="text-amber-600" size={14} />
            Anomaly Stream
          </h3>
          <div className="space-y-2">
             {[
               { id: 'AN-89', type: 'Load Peak', block: 'Science', time: '10:45 AM', level: 'Critical' },
               { id: 'AN-90', type: 'HVAC Leak', block: 'Main Hall', time: '02:15 PM', level: 'Moderate' },
               { id: 'AN-92', type: 'Low Usage', block: 'Admin', time: 'Yesterday', level: 'Low' },
             ].map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:border-slate-200 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
                     a.level === 'Critical' ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                   )}>
                     <AlertTriangle size={14} />
                   </div>
                   <div>
                     <p className="text-slate-900 font-bold text-[11px] leading-none mb-1">{a.type}</p>
                     <p className="text-slate-400 text-[8px] uppercase font-black tracking-widest">{a.block} • {a.time}</p>
                   </div>
                 </div>
                 <span className="text-[8px] font-mono font-black bg-white border border-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter tabular-nums">{a.id}</span>
               </div>
             ))}
          </div>
          <button className="mt-6 w-full py-2 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border border-slate-100">
             Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
}
