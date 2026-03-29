import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  AlertCircle, 
  Search, 
  Filter,
  ArrowRight,
  MessageSquare,
  History,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { listTickets, updateTicketStatus } from '../api/ticketsApi';
import { StatusActionModal } from '../components/tickets/StatusActionModal';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  OPEN: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  IN_PROGRESS: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: PlayCircle },
  RESOLVED: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  CLOSED: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: CheckCircle },
  REJECTED: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertCircle },
};

const PRIORITY_CONFIG = {
  LOW: { color: 'text-slate-400' },
  MEDIUM: { color: 'text-amber-400' },
  HIGH: { color: 'text-orange-400' },
  URGENT: { color: 'text-rose-500 font-bold' },
  CRITICAL: { color: 'text-rose-600 font-black' },
};

export function TechnicianDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resolveModal, setResolveModal] = useState({ open: false, ticketId: null });
  const [actionBusy, setActionBusy] = useState(false);

  const fetchAssignedTickets = useCallback(async () => {
    try {
      setLoading(true);
      // listTickets backend handles role-based filtering: 
      // Technicians only see their assigned tickets.
      const data = await listTickets({ 
        q: searchTerm,
        status: statusFilter || undefined,
        size: 50, // Dashboard view shows more at once
        sort: 'createdAt,desc'
      });
      setTickets(data.content || []);
    } catch (err) {
      console.error('Failed to fetch assigned tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  const handleStartProgress = async (ticketId) => {
    try {
      setActionBusy(true);
      await updateTicketStatus(ticketId, { status: 'IN_PROGRESS' });
      await fetchAssignedTickets();
    } catch (err) {
      console.error('Failed to start progress:', err);
    } finally {
      setActionBusy(false);
    }
  };

  const handleOpenResolve = (ticketId) => {
    setResolveModal({ open: true, ticketId });
  };

  const handleConfirmResolve = async (resolutionNotes) => {
    try {
      setActionBusy(true);
      await updateTicketStatus(resolveModal.ticketId, { 
        status: 'RESOLVED',
        resolutionNotes 
      });
      setResolveModal({ open: false, ticketId: null });
      await fetchAssignedTickets();
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Technician Dashboard</h1>
          <p className="text-gray-400 font-medium mt-1">Manage your assigned technical tasks and campus maintenance.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="px-4 py-2 text-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Tasks</div>
            <div className="text-xl font-black text-white">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="px-4 py-2 text-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending</div>
            <div className="text-xl font-black text-white">{tickets.filter(t => t.status === 'OPEN').length}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search your tasks..."
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="h-12 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xs uppercase tracking-widest text-gray-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <Button 
          variant="secondary" 
          onClick={() => fetchAssignedTickets()}
          className="h-12 w-12 p-0 flex items-center justify-center rounded-2xl"
        >
          <History className="w-4 h-4" />
        </Button>
      </div>

      {/* Assigned Tickets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-white/5" />
          ))
        ) : tickets.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-600">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white px-4">No tasks assigned to you</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Great job! All your assigned maintenance works are completed or handled.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const Config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            const StatusIcon = Config.icon;
            
            return (
              <Card key={ticket.id} className="p-0 overflow-hidden group hover:scale-[1.01] transition-all duration-300 border-white/10 bg-white/5 hover:bg-white/[0.07] shadow-xl">
                <div className="flex h-full">
                  {/* Status Indicator Stripe */}
                  <div className={`w-1.5 ${Config.color.split(' ')[2].replace('text-', 'bg-')}`} />
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-black text-gray-500 tracking-tighter">#{ticket.ticketNumber}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${Config.color}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight truncate pr-4 group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h3>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                        {ticket.priority}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                      {ticket.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Category</span>
                          <span className="text-[11px] font-bold text-gray-300 mt-1">{ticket.category}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Location</span>
                          <span className="text-[11px] font-bold text-gray-300 mt-1 truncate max-w-[120px]">{ticket.locationText || 'On-site'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        {ticket.status === 'OPEN' && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleStartProgress(ticket.id); }}
                            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                            disabled={actionBusy}
                          >
                            <PlayCircle className="w-4 h-4" />
                            Start Work
                          </Button>
                        )}
                        
                        {ticket.status === 'IN_PROGRESS' && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleOpenResolve(ticket.id); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-600/20"
                            disabled={actionBusy}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <StatusActionModal 
        isOpen={resolveModal.open}
        onClose={() => setResolveModal({ open: false, ticketId: null })}
        onConfirm={handleConfirmResolve}
        title="Resolve Ticket"
        description="Please provide details about the maintenance work performed."
        label="Resolution Notes"
        placeholder="Describe the issue found and actions taken (e.g., Repaired faulty wiring in Room 302...)"
        confirmLabel="Complete Task"
        variant="success"
        busy={actionBusy}
      />
    </div>
  );
}

