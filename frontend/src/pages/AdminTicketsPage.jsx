import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Ticket as TicketIcon,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowRight,
  UserPlus,
  Box,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listTickets, assignTechnician, updateTicketStatus } from '../api/ticketsApi';
import { listUsers } from '../api/adminUsersApi';
import { StatusActionModal } from '../components/tickets/StatusActionModal';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Table, TableAction } from '../components/common/Table';
import { StatusIndicator } from '../components/common/StatusIndicator';
import clsx from 'clsx';

const TICKET_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' }
];

const TICKET_CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Equipment Issue', value: 'EQUIPMENT_ISSUE' },
  { label: 'Facility Damage', value: 'FACILITY_DAMAGE' },
  { label: 'Technical Error', value: 'TECHNICAL_ERROR' },
  { label: 'Network Issue', value: 'NETWORK_ISSUE' },
  { label: 'Plumbing', value: 'PLUMBING' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'HVAC', value: 'HVAC' },
  { label: 'IT Support', value: 'IT_SUPPORT' },
  { label: 'Cleaning', value: 'CLEANING' },
  { label: 'Furniture', value: 'FURNITURE' },
  { label: 'General', value: 'GENERAL' },
  { label: 'Other', value: 'OTHER' }
];

const TICKET_PRIORITIES = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'Emergency', value: 'EMERGENCY' }
];

const STATUS_VARIANTS = {
  OPEN: 'primary',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'secondary',
  REJECTED: 'error',
  APPROVED: 'success'
};

const PRIORITY_VARIANTS = {
  LOW: 'secondary',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'error',
  CRITICAL: 'error',
  EMERGENCY: 'error'
};

const AdminTicketsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [assignmentModal, setAssignmentModal] = useState({ open: false, ticket: null });
  const [rejectModal, setRejectModal] = useState({ open: false, ticketId: null });
  const [assigningLoading, setAssigningLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listTickets({
        q: searchTerm,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        size: 7
      });
      setTickets(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, page]);

  const fetchTechnicians = async () => {
    if (!currentUser || currentUser.role?.name !== 'ADMIN') return;
    try {
      const data = await listUsers({ role: 'TECHNICIAN', size: 100 });
      setTechnicians(data.content);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleAssign = async (technicianId) => {
    try {
      setAssigningLoading(true);
      await assignTechnician(assignmentModal.ticket.id, technicianId);
      setAssignmentModal({ open: false, ticket: null });
      fetchTickets();
    } catch (err) {
      console.error('Failed to assign technician:', err);
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setAssigningLoading(true);
      await updateTicketStatus(rejectModal.ticketId, { status: 'REJECTED', rejectionReason: reason });
      setRejectModal({ open: false, ticketId: null });
      fetchTickets();
    } catch (err) {
      console.error('Failed to reject ticket:', err);
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setPage(0);
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <TicketIcon className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Operations Desk</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--color-text)] italic underline decoration-primary/10 decoration-8 underline-offset-[-2px]">Incident Governance</h2>
          <p className="text-[var(--color-text-secondary)] font-medium mt-1 leading-none italic opacity-80">Orchestrate campus maintenance and infrastructure resolutions.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="secondary" onClick={handleResetFilters} leftIcon={<RefreshCw className="w-4 h-4" />}>Reset View</Button>
           <div className="w-px h-8 bg-[var(--color-border)] mx-2 hidden lg:block" />
           <div className="flex items-center gap-4 px-4 h-12 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest line-none">Total Incidents</span>
                 <span className="text-lg font-black text-[var(--color-text)] leading-none mt-0.5">{totalElements}</span>
              </div>
              <TrendingUp className="w-5 h-5 text-primary opacity-40" />
           </div>
        </div>
      </div>

      {/* ── Precision Filter Strip ── */}
      <div className="grid gap-4 lg:grid-cols-4 items-end card-premium p-6 border-dashed">
        <div className="lg:col-span-1">
           <Input 
              label="Incident Identification"
              placeholder="Search by ID or title..." 
              icon={Search}
              value={searchTerm}
              className="bg-[var(--color-surface-soft)]"
              onChange={(e) => { setPage(0); setSearchTerm(e.target.value); }}
           />
        </div>
        <Select 
           label="Life-cycle State"
           value={statusFilter}
           className="bg-[var(--color-surface-soft)]"
           onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }}
           options={TICKET_STATUSES}
        />
        <Select 
           label="System Category"
           value={categoryFilter}
           className="bg-[var(--color-surface-soft)]"
           onChange={(e) => { setPage(0); setCategoryFilter(e.target.value); }}
           options={TICKET_CATEGORIES}
        />
        <Select 
           label="Criticality Index"
           value={priorityFilter}
           className="bg-[var(--color-surface-soft)]"
           onChange={(e) => { setPage(0); setPriorityFilter(e.target.value); }}
           options={TICKET_PRIORITIES}
        />
      </div>

      {/* ── Incident Registry Table ── */}
      <Table 
        headers={['Incident Identity', 'Status / Scale', 'Stakeholders', 'Temporal Data', 'Operation']}
        isLoading={loading}
        emptyMessage="No active incidents match the current locality matrix."
      >
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary transition-all duration-500 border border-[var(--color-border)] group-hover:border-primary/20 shadow-soft group-hover:shadow-lg group-hover:shadow-primary/10">
                  <TicketIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black font-mono tracking-widest text-[var(--color-muted)] uppercase">{ticket.ticketNumber}</span>
                      <Badge variant={PRIORITY_VARIANTS[ticket.priority]} size="sm" className="scale-75 origin-left">{ticket.priority}</Badge>
                   </div>
                   <div className="text-sm font-black text-[var(--color-text)] tracking-tight italic line-clamp-1 max-w-[240px] group-hover:text-primary transition-colors">{ticket.title}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-5">
               <div className="flex flex-col gap-1.5">
                  <StatusIndicator status={STATUS_VARIANTS[ticket.status]} label={ticket.status} />
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-muted)] px-1 uppercase tracking-tighter">
                     {ticket.category.replace('_', ' ')}
                  </div>
               </div>
            </td>
            <td className="px-6 py-5">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-[var(--color-text)] leading-none italic">{ticket.createdByFullName || 'Analyst'}</span>
                       <span className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-tighter mt-0.5">Origin Reporter</span>
                    </div>
                  </div>
                  
                  {ticket.assignedTechnicianId ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                        <User className="w-3.5 h-3.5 text-success" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-[var(--color-text)] leading-none italic">{ticket.assignedTechnicianName || 'Field Op'}</span>
                         <span className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-tighter mt-0.5">Assigned Technician</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssignmentModal({ open: true, ticket })}
                      className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Assign Field Op
                    </button>
                  )}
               </div>
            </td>
            <td className="px-6 py-5">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm font-black text-[var(--color-text)] tracking-tight italic">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mt-0.5">
                    Logged {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
               </div>
            </td>
            <td className="px-6 py-5">
               <div className="flex items-center justify-end gap-2">
                  {ticket.status === 'OPEN' && (
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setRejectModal({ open: true, ticketId: ticket.id })}
                      className="text-[10px] font-black h-9 px-4 uppercase tracking-widest border-error/20 hover:bg-error/5 text-error"
                    >
                      Decline
                    </Button>
                  )}
                  <TableAction icon={ArrowRight} onClick={() => navigate(`/tickets/${ticket.id}`)} />
               </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* ── Enterprise Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-[var(--color-divider)]">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] italic">
              Incident Registry &bull; Node {page + 1} of {totalPages} &bull; Stream Active
           </div>
           <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="p-3 min-w-0 rounded-[14px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-6 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                {page + 1}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="p-3 min-w-0 rounded-[14px]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
           </div>
        </div>
      )}

      {/* ── High-Fidelity Assignment Modal ── */}
      {assignmentModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAssignmentModal({ open: false, ticket: null })} />
           
           <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-[380px] overflow-hidden shadow-2xl animate-fade-in-up">
              <div className="p-3 border-b border-[var(--color-divider)] flex items-center justify-between bg-[var(--color-bg-alt)]/30">
                 <div>
                    <h2 className="text-base font-black text-[var(--color-text)] tracking-tighter italic">Strategic Dispatch</h2>
                    <p className="text-[8px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5 opacity-60">ID: {assignmentModal.ticket?.ticketNumber}</p>
                 </div>
                 <button 
                  onClick={() => setAssignmentModal({ open: false, ticket: null })}
                  className="p-1.5 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors"
                 >
                    <X className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="p-2 max-h-[160px] overflow-y-auto space-y-1 custom-scrollbar">
                 {technicians.length === 0 ? (
                    <div className="py-6 text-center opacity-30 italic font-black text-[var(--color-muted)] uppercase tracking-widest text-[9px]">
                       NULL_ACTIVE_OPS
                    </div>
                 ) : (
                    technicians.map((tech) => (
                      <button
                        key={tech.id}
                        onClick={() => handleAssign(tech.id)}
                        disabled={assigningLoading}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--color-bg-alt)]/30 border border-[var(--color-border)] hover:border-primary/40 hover:bg-primary/5 transition-all group overflow-hidden relative"
                      >
                         <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                         
                         <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-[var(--color-border)] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                               <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black text-[var(--color-text)] tracking-tight leading-tight">
                                  {tech.fullName || 'Analyst'}
                                </p>
                               <p className="text-[8px] font-bold text-[var(--color-muted)] uppercase tracking-tighter opacity-60 leading-none">{tech.email}</p>
                            </div>
                         </div>
                         <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))
                 )}
              </div>

              <div className="p-2 border-t border-[var(--color-divider)] bg-[var(--color-bg-alt)]/30 flex justify-end">
                 <Button 
                   variant="ghost"
                   onClick={() => setAssignmentModal({ open: false, ticket: null })}
                   className="text-[8px] font-black uppercase tracking-widest h-7 px-4"
                 >
                   Abort Protocol
                 </Button>
              </div>
           </div>
        </div>
      )}

      <StatusActionModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, ticketId: null })}
        onConfirm={handleReject}
        title="Administrative Decline"
        description="Provide a formal justification for the nullification of this incident report."
        label="Operational Reasoning"
        placeholder="Enter administrative justification..."
        confirmLabel="Decline Incident"
        variant="danger"
        busy={assigningLoading}
      />
    </div>
  );
};

// Simple RefreshCw icon for the button since it wasn't imported
const RefreshCw = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default AdminTicketsPage;
