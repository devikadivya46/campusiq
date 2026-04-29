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
  BarChart4,
  Search,
  Calendar,
  Clock
} from 'lucide-react';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, MOCK_USERS } from './constants';
import { Room, Booking, UserRole, AppNotification, User } from './types';
import { cn, getConflict, findAvailableRooms, findAvailableSlots, getPriorityLabel } from './lib/utils';
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

type Tab = 'dashboard' | 'inventory' | 'booking' | 'approvals' | 'analytics' | 'optimization' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const role = currentUser?.role || 'Student';
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
      { id: 'inventory', label: 'Resource Inventory', icon: <Box size={18} />, roles: ['Administrator', 'Faculty', 'Student'] },
      { id: 'booking', label: 'Booking Management', icon: <CalendarCheck size={18} />, roles: ['Administrator', 'Faculty', 'Student'] },
      { id: 'approvals', label: 'Approval Module', icon: <ShieldCheck size={18} />, roles: ['Administrator'] },
      { id: 'optimization', label: 'Optimization Module', icon: <Zap size={18} />, roles: ['Administrator'] },
      { id: 'analytics', label: 'Usage & Analytics', icon: <BarChart4 size={18} />, roles: ['Administrator'] },
      { id: 'settings', label: 'Preferences', icon: <Settings size={18} />, roles: ['Administrator', 'Faculty', 'Student'] },
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

  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());

  // Automated Reminders Engine
  React.useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      bookings.forEach(booking => {
        if (booking.status === 'Approved' && booking.reminderMinutes && booking.reminderMinutes > 0) {
          const startTime = new Date(booking.startTime);
          const reminderTime = new Date(startTime.getTime() - booking.reminderMinutes * 60000);
          
          // Trigger if current time passed reminder time AND booking is in future
          if (!sentReminders.has(booking.id) && now >= reminderTime && now < startTime) {
            const roomName = rooms.find(r => r.id === booking.roomId)?.name || 'Facility';
            addNotification(
              'Automated Reminder',
              `Alert: Your session in ${roomName} is scheduled to commence in ${booking.reminderMinutes >= 60 ? booking.reminderMinutes / 60 + ' hour(s)' : booking.reminderMinutes + ' minutes'}.`,
              'Info'
            );
            setSentReminders(prev => {
              const next = new Set(prev);
              next.add(booking.id);
              return next;
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 15000); // High frequency check for demo
    checkReminders();
    return () => clearInterval(interval);
  }, [bookings, rooms, addNotification, sentReminders]);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

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
                <div className="flex gap-2 items-center bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                  <span>{currentUser?.name} ({role})</span>
                  <div className="w-[1px] h-3 bg-slate-700 mx-1"></div>
                  <button onClick={() => setCurrentUser(null)} className="hover:text-red-400 text-slate-300 transition-colors">
                    Logout
                  </button>
                </div>
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
              {activeTab === 'inventory' && (role === 'Administrator' || role === 'Faculty' || role === 'Student') && <InventoryView rooms={rooms} bookings={bookings} role={role} />}
              {activeTab === 'booking' && <BookingView rooms={rooms} bookings={bookings} onApply={handleApplyBooking} role={role} addNotification={addNotification} />}
              {activeTab === 'approvals' && role === 'Administrator' && <ApprovalsView bookings={bookings} setBookings={setBookings} addNotification={addNotification} rooms={rooms} />}
              {activeTab === 'optimization' && role === 'Administrator' && <OptimizationView rooms={rooms} bookings={bookings} />}
              {activeTab === 'analytics' && role === 'Administrator' && <AnalyticsView bookings={bookings} rooms={rooms} />}
              {activeTab === 'settings' && <SettingsView addNotification={addNotification} />}
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
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const now = new Date();
  
  const approvedToday = approvedBookings.filter(b => isSameDay(new Date(b.startTime), now));
  const pending = bookings.filter(b => b.status === 'Pending');
  
  const inUseCount = rooms.filter(r => {
    const nowISO = now.toISOString();
    return approvedToday.some(b => b.roomId === r.id && b.startTime <= nowISO && b.endTime >= nowISO);
  }).length;

  const currentConflicts = useMemo(() => {
    return pending.filter(pb => getConflict(pb, approvedBookings)).slice(0, 3);
  }, [pending, approvedBookings]);

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Row */}
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
          color="text-indigo-600" 
        />
        <DashboardStatCard 
          label="Pending Queue" 
          value={pending.length} 
          subLabel="requests" 
          color="text-orange-500" 
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Utilization */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 size={14} className="text-indigo-600" />
            Live Sector Load
          </h2>
          <div className="flex items-end justify-between gap-4 h-48">
            {[
              { label: 'Classrooms', val: 72, color: 'bg-indigo-500' },
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
                  <div className="absolute inset-x-0 bottom-full mb-1 text-center">
                    <span className="text-[9px] font-black tabular-nums">{item.val}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-900">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Occupancy Feed */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
           <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" />
            Occupancy Pulse
          </h2>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {rooms.slice(0, 5).map(room => {
              const active = approvedToday.find(b => {
                const nowISO = new Date().toISOString();
                return b.roomId === room.id && b.startTime <= nowISO && b.endTime >= nowISO;
              });
              return (
                <div key={room.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", active ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                    <div>
                      <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{room.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{room.type} • {room.building}</p>
                    </div>
                  </div>
                  <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded", active ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                    {active ? 'Engaged' : 'Active'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conflict Feed */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Critical Conflicts
          </h2>
          <div className="space-y-2">
            {currentConflicts.length > 0 ? currentConflicts.map(c => (
              <div key={c.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center group hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-amber-600">
                     <AlertTriangle size={14} />
                   </div>
                   <div>
                     <p className="text-[11px] font-black text-slate-900">Collision in {rooms.find(r => r.id === c.roomId)?.name}</p>
                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Requester: {c.userName}</p>
                   </div>
                </div>
                <button className="text-[8px] font-black uppercase text-indigo-600 hover:underline">Resolve</button>
              </div>
            )) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-xl">
                 <ShieldCheck size={24} className="mx-auto text-slate-100 mb-2" />
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Active Collisions</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-indigo-600" />
            Pulse Distribution
          </h2>
          <div className="flex items-center justify-between gap-4 h-48">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: 50, color: '#4f46e5' },
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
                      { color: '#4f46e5' }, { color: '#10b981' }, { color: '#ef4444' }, { color: '#f59e0b' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1 pl-6 border-l border-slate-100">
              {[
                { label: 'Approved', val: 50, color: 'bg-indigo-600' },
                { label: 'Completed', val: 32, color: 'bg-emerald-500' },
                { label: 'Rejected', val: 9, color: 'bg-red-500' },
                { label: 'Pending', val: 9, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[10px] font-bold">
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

      {/* Optimization Insights */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <Zap size={14} className="text-emerald-400" />
             <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Optimization Engine active</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <OptimizationInsightCard message="Seminar Hall B has only 45% utilization. Consider reassigning small-group bookings from Lab 3 (88% full)." />
             <OptimizationInsightCard message="Peak demand identified: 10 AM – 12 PM. Stagger scheduling to reduce network load by 14%." />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
      </div>

      {/* Live availability heatmap - Based on user attachment */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-indigo-600" />
            Live availability heatmap — today
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded bg-red-50 border border-red-100" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded bg-emerald-50 border border-emerald-100" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Free</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-16"></th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'].map(day => (
                  <th key={day} className="px-1 pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map(time => (
                <tr key={time}>
                  <td className="pr-4 py-1 text-[10px] font-bold text-slate-500 text-right">{time}</td>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const hour = parseInt(time.split(':')[0]);
                    const targetDate = new Date();
                    
                    if (i < 7) {
                      const currentDay = targetDate.getDay() || 7; // Convert 0 (Sun) to 7
                      const targetDay = i + 1; // Mon = 1, Tue = 2... Sun = 7
                      targetDate.setDate(targetDate.getDate() + (targetDay - currentDay));
                    }
                    
                    const isBooked = approvedBookings.some(b => {
                      const bStart = new Date(b.startTime);
                      const bEnd = new Date(b.endTime);
                      const sameDate = bStart.getFullYear() === targetDate.getFullYear() && 
                                       bStart.getMonth() === targetDate.getMonth() && 
                                       bStart.getDate() === targetDate.getDate();
                      return sameDate && hour >= bStart.getHours() && hour < bEnd.getHours();
                    });

                    return (
                      <td key={i} className="min-w-[60px]">
                        <div className={cn(
                          "h-8 rounded-lg flex items-center justify-center text-[8px] font-black uppercase tracking-widest border transition-all",
                          isBooked 
                            ? "bg-red-50 text-red-600 border-red-100" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
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

function InventoryView({ rooms, bookings, role }: { rooms: Room[], bookings: Booking[], role: UserRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const currentBookings = bookings.filter(b => b.status === 'Approved');
  
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            room.building.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || room.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [rooms, searchQuery, selectedType]);

  const types = ['All', ...Array.from(new Set(rooms.map(r => r.type)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
             <div className="w-1 h-6 bg-indigo-500 rounded-full" />
             Resource Inventory
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 ml-3">Managing {rooms.length} System Resources</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text"
              placeholder="Search resources..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold focus:ring-2 ring-indigo-500/10 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {role !== 'Student' && (
            <button className="bg-slate-900 text-white hover:bg-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg active:scale-95">Add Resource</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const now = new Date();
          const activeBooking = currentBookings.find(b => 
            b.roomId === room.id && 
            new Date(b.startTime) <= now && 
            new Date(b.endTime) >= now
          );
          const isAvailable = !activeBooking;

          return (
            <div key={room.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start">
                <div className={cn(
                  "p-2 rounded-lg transition-colors border",
                  room.type === 'Lab' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  room.type === 'Auditorium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  room.type === 'Equipment' ? "bg-purple-50 text-purple-600 border-purple-100" :
                  room.type === 'Seminar Hall' ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-indigo-50 text-indigo-600 border-indigo-100"
                )}>
                  {room.type === 'Lab' ? <Activity size={16} /> : 
                   room.type === 'Auditorium' ? <LayoutDashboard size={16} /> : 
                   room.type === 'Equipment' ? <Box size={16} /> :
                   room.type === 'Seminar Hall' ? <CalendarCheck size={16} /> :
                   <CalendarCheck size={16} />}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "text-[7px] px-1.5 py-0.5 rounded font-black uppercase border tracking-widest",
                    isAvailable 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-red-50 text-red-600 border-red-100 animate-pulse"
                  )}>
                    {isAvailable ? 'Available' : 'Engaged'}
                  </span>
                  <span className="text-[7px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded font-bold uppercase border border-slate-100">
                    L: {room.floor}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-xs truncate">{room.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{room.building}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Capacity</p>
                  <p className="text-slate-700 font-mono font-bold text-[10px]">{room.capacity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Type</p>
                  <p className="text-slate-700 font-bold text-[10px]">{room.type}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Booking Status</p>
                {activeBooking ? (
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-900 truncate">{activeBooking.userName}</p>
                    <p className="text-[8px] text-slate-500 font-bold">{format(new Date(activeBooking.endTime), 'hh:mm a')} finish</p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/30 rounded-lg p-2 border border-emerald-100/50">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Idle / Ready</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 mt-auto border-t border-slate-50">
                <div className="flex -space-x-1.5">
                  {[1, 2].map(i => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=u${i}${room.id}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button className="p-1 text-slate-300 hover:text-indigo-600 transition-all"><Settings size={12} /></button>
                  <button className="p-1 text-slate-300 hover:text-red-500 transition-all"><Activity size={12} className="rotate-45" /></button>
                </div>
              </div>
            </div>
          );
        })}
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
    reminderMinutes: 60,
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

  const suggestions = useMemo(() => {
    if (!conflict) return [];
    const s = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const e = new Date(`${formData.date}T${formData.endTime}`).toISOString();
    return findAvailableRooms(s, e, rooms, bookings).filter(r => r.id !== formData.roomId);
  }, [conflict, formData, rooms, bookings]);

  const availableSlots = useMemo(() => {
    if (!conflict || !formData.roomId) return [];
    return findAvailableSlots(formData.date, formData.roomId, bookings);
  }, [conflict, formData.date, formData.roomId, bookings]);

  // Trigger conflict notification
  React.useEffect(() => {
    if (conflict) {
      addNotification(
        'Collision Detected', 
        `Conflict with ${conflict.userName}'s session in ${rooms.find(r => r.id === formData.roomId)?.name}. AI identifies ${suggestions.length} available alternatives.`, 
        'Warning'
      );
    }
  }, [conflict, rooms, formData.roomId, addNotification, suggestions]);

  const canOverride = useMemo(() => {
    return conflict && formData.priority > conflict.priority;
  }, [conflict, formData.priority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict && !canOverride) return;

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
      reminderMinutes: formData.reminderMinutes,
      status: 'Pending',
      priority: formData.priority,
    };

    onApply(newBooking);
    if (canOverride) {
      addNotification('Priority Escalation', `Request logged with higher priority than existing occupant.`, 'Info');
    }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Demand Peak', value: '11:00 AM - 02:00 PM', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Idle Windows', value: '04:00 PM - 07:00 PM', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Optimized Slots', value: '86% Efficiency', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <p className="text-[10px] font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
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

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Reminder Pulse</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold focus:outline-none focus:ring-2 ring-indigo-500/10"
                    value={formData.reminderMinutes || 60}
                    onChange={e => setFormData({...formData, reminderMinutes: parseInt(e.target.value)})}
                  >
                    <option value={15}>15 Minutes before</option>
                    <option value={30}>30 Minutes before</option>
                    <option value={60}>1 Hour before</option>
                    <option value={1440}>1 Day before</option>
                    <option value={0}>No reminder</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!!conflict && !canOverride}
                className={cn(
                  "w-full py-3 rounded-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg text-[10px]",
                  conflict && !canOverride
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                    : canOverride 
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
                      : "bg-indigo-600 hover:bg-black text-white shadow-indigo-100"
                )}
              >
                {conflict ? <AlertTriangle size={14} /> : <Zap size={14} />}
                {conflict 
                  ? canOverride ? 'Escalate Request' : 'Node Engaged' 
                  : 'Execute Booking'}
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
                    className={cn(
                      "p-4 border rounded-lg space-y-3",
                      canOverride ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "flex items-center gap-2",
                        canOverride ? "text-amber-600" : "text-red-600"
                      )}>
                        <AlertTriangle size={14} />
                        <span className="font-black text-[9px] uppercase tracking-widest">
                          {canOverride ? 'Priority Conflict' : 'Hard Collision'}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[8px] font-mono px-1.5 py-0.5 rounded font-black",
                        canOverride ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {canOverride ? '#OVERRIDE' : '#ERR'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-700 font-bold leading-tight">
                       Resource engaged by <span className="text-indigo-600">{conflict.userName}</span> ({getPriorityLabel(conflict.priority)}).
                       {canOverride && <p className="mt-1 text-amber-700 font-black">Your higher priority allows escalation.</p>}
                    </div>
                    <div className={cn(
                      "pt-3 border-t space-y-4",
                      canOverride ? "border-amber-100" : "border-red-100"
                    )}>
                      <div>
                        <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">AI Reroute suggestions</p>
                        <div className="space-y-2">
                          {suggestions.slice(0, 2).map(alt => (
                            <div key={alt.id} className="p-3 bg-white border border-indigo-100 rounded-lg flex justify-between items-center group hover:border-indigo-400 transition-all">
                              <div>
                                <p className="text-[10px] font-black text-indigo-900 mb-0.5">{alt.name}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{alt.type} • Cap: {alt.capacity}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, roomId: alt.id});
                                  addNotification('System Rerouted', `Shifted to ${alt.name}.`, 'Success');
                                }}
                                className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                              >
                                Swap Room
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {availableSlots.length > 0 && (
                        <div>
                          <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">Available pulses today</p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableSlots.slice(0, 5).map((slot, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, startTime: slot.start, endTime: slot.end });
                                  addNotification('Time Optimized', `Slot adjusted to ${slot.start}.`, 'Success');
                                }}
                                className="px-2 py-1 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                              >
                                {slot.start} - {slot.end}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.length === 0 && availableSlots.length === 0 && (
                        <p className="text-[9px] text-slate-400 font-bold italic">No immediate optimizations found.</p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-50 rounded-lg flex flex-col items-center justify-center text-center">
                    <Activity size={24} className="text-slate-100 mb-2" />
                    <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Scanning pulses...</p>
                  </div>
                )}
              </div>

              {/* Mini Heatmap Visualization for the chosen room */}
              {formData.roomId && (
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h3 className="text-slate-900 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={14} className="text-indigo-600" />
                    Daily Pulse Visualizer
                  </h3>
                  <div className="grid grid-cols-4 gap-1">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(time => {
                      const hour = parseInt(time.split(':')[0]);
                      const isBooked = bookings.some(b => 
                        b.roomId === formData.roomId && 
                        b.status === 'Approved' &&
                        new Date(b.startTime).getHours() === hour &&
                        isSameDay(new Date(b.startTime), new Date(formData.date))
                      );
                      
                      return (
                        <div 
                          key={time} 
                          className={cn(
                            "p-2 rounded border text-[7px] font-black uppercase tracking-tighter text-center transition-all",
                            isBooked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}
                        >
                          {time}
                          <div className="mt-0.5">{isBooked ? 'Busy' : 'Idle'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Booking Tracking */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Booking Ledger</h3>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{bookings.filter(b => b.userName === formData.userName).length} Active</span>
                </div>
                <div className="p-0 max-h-[300px] overflow-y-auto">
                  {bookings.filter(b => b.userName === formData.userName).length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-200">
                        <CalendarCheck size={24} />
                      </div>
                      <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No local pulses found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {bookings.filter(b => b.userName === formData.userName).map(b => (
                        <div key={b.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center border",
                              b.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              b.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                              "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              {b.status === 'Approved' ? <CheckCircle2 size={16} /> : 
                               b.status === 'Rejected' ? <AlertTriangle size={16} /> : 
                               <Activity size={16} />}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-900 truncate max-w-[120px]">{rooms.find(r => r.id === b.roomId)?.name}</p>
                              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">{format(new Date(b.startTime), 'MMM d')} • {b.purpose}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm scale-90",
                              b.status === 'Approved' ? "bg-emerald-500 text-white border-emerald-400" :
                              b.status === 'Rejected' ? "bg-red-500 text-white border-red-400" :
                              "bg-white text-amber-500 border-amber-100"
                            )}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

function SettingsView({ addNotification }: { addNotification: (t: string, m: string, type: AppNotification['type']) => void }) {
  const [pref, setPref] = useState({
    defaultReminder: '60',
    emailNotifications: true,
    inAppPopups: true,
    reminderFrequency: 'standard'
  });

  const handleSave = () => {
    addNotification('Preferences Updated', 'Your system configurations have been synchronized.', 'Success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">System Preferences</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Notification & Workflow Tuning</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bell size={14} className="text-indigo-600" />
              Notification Pulse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">Email Relay</p>
                    <p className="text-[9px] text-slate-400">Receive external alerts for node status</p>
                  </div>
                  <button 
                    onClick={() => setPref({...pref, emailNotifications: !pref.emailNotifications})}
                    className={cn(
                      "w-8 h-4 rounded-full transition-all relative",
                      pref.emailNotifications ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      pref.emailNotifications ? "right-0.5" : "left-0.5"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">In-App Pulses</p>
                    <p className="text-[9px] text-slate-400">Real-time terminal notifications</p>
                  </div>
                  <button 
                    onClick={() => setPref({...pref, inAppPopups: !pref.inAppPopups})}
                    className={cn(
                      "w-8 h-4 rounded-full transition-all relative",
                      pref.inAppPopups ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      pref.inAppPopups ? "right-0.5" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Default Reminder Interval</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 text-[11px] font-bold focus:outline-none focus:ring-2 ring-indigo-500/10"
                    value={pref.defaultReminder}
                    onChange={e => setPref({...pref, defaultReminder: e.target.value})}
                  >
                    <option value="15">15 Minutes before</option>
                    <option value="30">30 Minutes before</option>
                    <option value="60">1 Hour before</option>
                    <option value="1440">1 Day before</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-slate-900 text-white hover:bg-black px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg active:scale-95"
            >
              Sync Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Security Invariant</h3>
            <p className="text-[10px] text-white/70 mt-1 leading-relaxed">
              All reminder pulses are end-to-end encrypted. System notifications utilize low-latency WebSocket relays to ensure delivery sub-100ms.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
      </div>
    </div>
  );
}

function AnalyticsView({ bookings, rooms }: { bookings: Booking[], rooms: Room[] }) {
  const approvedBookings = useMemo(() => bookings.filter(b => b.status === 'Approved'), [bookings]);
  
  // 1. Occupancy Rate by Room Type
  const utilizationByType = useMemo(() => {
    const types = Array.from(new Set(rooms.map(r => r.type)));
    return types.map(type => {
      const typeRooms = rooms.filter(r => r.type === type);
      const typeBookings = approvedBookings.filter(b => typeRooms.some(tr => tr.id === b.roomId));
      // Simple metric: bookings per room of this type
      const utilization = typeRooms.length > 0 ? (typeBookings.length / typeRooms.length) * 10 : 0;
      return { name: type, value: Math.min(Math.round(utilization), 100) };
    });
  }, [approvedBookings, rooms]);

  // 2. Booking Trends (Last 7 days)
  const trendsData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    return last7Days.map(dayStr => {
      const count = approvedBookings.filter(b => format(new Date(b.startTime), 'MMM dd') === dayStr).length;
      return { day: dayStr, bookings: count };
    });
  }, [approvedBookings]);

  // 3. Room Popularity (Top 5)
  const popularRooms = useMemo(() => {
    const stats = rooms.map(room => {
      const count = approvedBookings.filter(b => b.roomId === room.id).length;
      return { name: room.name, value: count };
    });
    return stats.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [approvedBookings, rooms]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const conflicts = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'Pending');
    return pending.map(p => {
      const conflictMsg = getConflict(p, approvedBookings);
      if (conflictMsg) {
        return {
          id: `CF-${p.id.slice(0, 3).toUpperCase()}`,
          type: 'Node Conflict',
          block: rooms.find(r => r.id === p.roomId)?.name || 'Unknown',
          time: format(new Date(p.startTime), 'HH:mm'),
          level: 'Critical'
        };
      }
      return null;
    }).filter(Boolean);
  }, [bookings, approvedBookings, rooms]);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Analysis */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <BarChart4 className="text-indigo-600" size={14} />
              Booking Trajectory
            </h3>
            <span className="text-[9px] font-bold text-slate-400">LAST 7 DAYS</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={9} fontWeight="bold" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#4f46e5" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popularity Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" size={14} />
            High Demand Nodes
          </h3>
          <div className="space-y-4">
            {popularRooms.map((room, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-700">{room.name}</span>
                  <span className="text-indigo-600">{room.value} sessions</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(room.value / (popularRooms[0].value || 1)) * 100}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            ))}
            {popularRooms.length === 0 && <p className="text-center text-[10px] text-slate-400 italic">No data available.</p>}
          </div>
        </div>

        {/* Utilization by Type */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Activity className="text-emerald-500" size={14} />
             Sector Utilization
          </h3>
          <div className="h-[240px] flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {utilizationByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2 pl-6 border-l border-slate-100">
               {utilizationByType.map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{item.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Conflict Alerts */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={14} />
            System Instabilities
          </h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
             {conflicts.length > 0 ? conflicts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-red-50/30 border border-red-100 rounded-lg group hover:border-red-200 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 bg-red-50 text-red-600 border-red-100">
                     <AlertTriangle size={14} />
                   </div>
                   <div>
                     <p className="text-slate-900 font-bold text-[11px] leading-none mb-1">{a.type}</p>
                     <p className="text-slate-400 text-[8px] uppercase font-black tracking-widest">{a.block} • {a.time}</p>
                   </div>
                 </div>
                 <span className="text-[8px] font-mono font-black bg-white border border-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter tabular-nums">{a.id}</span>
               </div>
             )) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <ShieldCheck size={24} className="mx-auto text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Stable - 0 Conflicts</p>
              </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.id === uid.trim().toUpperCase());
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Invalid Unique ID. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600 rounded-full blur-[100px] mix-blend-screen" />
      </div>
      
      <div className="z-10 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 transform transition-all relative">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-indigo-200">
             IQ
           </div>
           <h1 className="text-2xl font-black tracking-tight text-slate-900">CampusIQ <span className="text-indigo-600">AI</span></h1>
           <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">Infrastructure Intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2" htmlFor="uid">
              System Access Key
            </label>
            <div className="relative">
               <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 id="uid"
                 name="uid"
                 type="text" 
                 value={uid}
                 onChange={(e) => { setUid(e.target.value); setError(''); }}
                 placeholder="Enter Unique ID (e.g., ADMIN123)"
                 className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                 autoComplete="off"
               />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-red-500 text-[10px] font-bold mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-black text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex justify-center items-center gap-2 group"
          >
             Authenticate <Zap size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 -mb-8 p-6 rounded-b-2xl">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 block text-center">Reference Keys</h4>
           <div className="flex justify-center gap-3">
             <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">ADMIN123</span>
             <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">FACULTY123</span>
             <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">STU123</span>
           </div>
        </div>
      </div>
    </div>
  );
}
