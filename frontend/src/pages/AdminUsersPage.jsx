import React, { useEffect, useState } from 'react';
import { listUsers, updateUserRole, toggleUserStatus, updateUserProfile, createUser, deleteUser } from '../api/adminUsersApi';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { Spinner } from '../components/common/Spinner';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  UserCog, 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Save,
  Mail,
  UserX,
  UserCheck,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';

export function AdminUsersPage() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    status: '',
    language: 'en',
    timezone: 'UTC',
    role: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    department: '',
    role: 'TECHNICIAN',
    status: 'ACTIVE'
  });
  const [userToDelete, setUserToDelete] = useState(null);

  async function refresh() {
    if (!user || user.role?.name !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const d = await listUsers({ page, size: 7, query: search });
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditFormData({
      fullName: u.fullName || '',
      phone: u.phone || '',
      department: u.department || '',
      status: u.status || '',
      language: u.language || 'en',
      timezone: u.timezone || 'UTC',
      role: u.role || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setBusyId(editingUser.id);
    setError(null);
    try {
      await updateUserProfile(editingUser.id, editFormData);
      if (editFormData.role !== editingUser.role) {
        await updateUserRole(editingUser.id, editFormData.role);
      }
      setEditingUser(null);
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to update user profile');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUser(createFormData);
      setShowCreateModal(false);
      setCreateFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        department: '',
        role: 'TECHNICIAN',
        status: 'ACTIVE'
      });
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setBusyId(id);
    setError(null);
    try {
      await deleteUser(id);
      setUserToDelete(null);
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className={`space-y-6 animate-fade-in-up ${isDarkMode ? 'dark' : ''}`}>
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text">User Governance</h2>
          <p className="text-muted mt-1 font-medium">Configure access levels and permissions for campus personnel.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search via name, email, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-surface border-border focus:border-primary"
            />
                </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 h-10 px-6 font-black uppercase tracking-widest text-[11px] bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-white rounded-xl">
             <Plus className="w-4 h-4" />
             <span className="hidden sm:inline">Add Personnel</span>
          </Button>
          <Button variant="secondary" onClick={refresh} disabled={loading} className="gap-2 h-10 px-4 bg-surface-soft border-border text-text-secondary hover:text-primary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Directory</span>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-4 font-bold text-error text-sm flex items-center gap-3 rounded-2xl">
           <ShieldCheck className="w-4 h-4" />
           {error}
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden border-border bg-surface rounded-2xl shadow-soft">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
             <Spinner size="lg" className="mb-4 text-primary" />
             <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Syncing User Database...</p>
          </div>
        ) : data?.content?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-alt/50 uppercase tracking-widest font-bold text-[10px] text-muted">
                    <th className="px-6 py-4">Identity & Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Auth Assignment</th>
                    <th className="px-6 py-4 text-right">Commit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.content.filter(u => u.email !== 'admin@smartcampus.com').map((u) => (
                    <tr key={u.id} className="group hover:bg-bg-alt/50 transition-all">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-4">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl border-2 border-surface shadow-sm object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-surface shadow-sm flex items-center justify-center text-primary font-extrabold text-xs">
                                 {getInitials(u.fullName)}
                              </div>
                            )}
                            <div className="min-w-0">
                               <div className="text-sm font-extrabold text-text truncate">{u.fullName}</div>
                               <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-muted uppercase tracking-tighter">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge 
                           variant={u.status === 'ACTIVE' ? 'success' : 'danger'}
                           className="font-bold uppercase tracking-widest text-[10px] px-2.5 py-1"
                         >
                           {u.status}
                         </Badge>
                      </td>
                       <td className="px-6 py-4">
                          <div className="max-w-[200px]">
                            <Select
                              value={u.role}
                              onChange={async (e) => {
                                const role = e.target.value;
                                if (u.role === role) return;
                                setBusyId(u.id);
                                setError(null);
                                try {
                                  await updateUserRole(u.id, role);
                                  await refresh();
                                } catch (err) {
                                  setError(err?.response?.data?.error?.message || 'Role sync failed');
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              options={[
                                { value: 'USER', label: 'End User' },
                                { value: 'ADMIN', label: 'System Admin' },
                                { value: 'TECHNICIAN', label: 'Technician' },
                              ]}
                              className="text-sm font-bold bg-surface border-border"
                            />
                          </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button
                               size="sm"
                               variant="secondary"
                               disabled={busyId === u.id}
                               onClick={() => handleEditClick(u)}
                               className="h-9 w-9 p-0 rounded-xl flex items-center justify-center border-border bg-surface hover:bg-bg-alt text-muted"
                               title="Edit Profile"
                             >
                                <UserCog className="w-3.5 h-3.5" />
                             </Button>
                             <Button
                               size="sm"
                               variant="secondary"
                               disabled={busyId === u.id}
                               onClick={async () => {
                                 setBusyId(u.id);
                                 setError(null);
                                 try {
                                   await toggleUserStatus(u.id);
                                   await refresh();
                                 } catch (e) {
                                   setError(e?.response?.data?.error?.message || 'Failed to toggle status');
                                 } finally {
                                   setBusyId(null);
                                 }
                               }}
                               className="h-9 w-9 p-0 rounded-xl flex items-center justify-center border-border bg-surface hover:bg-bg-alt"
                               title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                             >
                               {u.status === 'ACTIVE' ? (
                                 <UserX className="w-3.5 h-3.5 text-error" />
                               ) : (
                                 <UserCheck className="w-3.5 h-3.5 text-success" />
                               )}
                             </Button>
                             <Button
                               size="sm"
                               variant="secondary"
                               disabled={busyId === u.id}
                               onClick={() => setUserToDelete(u)}
                               className="h-9 w-9 p-0 rounded-xl flex items-center justify-center border-border bg-surface hover:bg-bg-alt"
                               title="Delete User"
                             >
                               <Trash2 className="w-3.5 h-3.5 text-error" />
                             </Button>
                             <Button
                               size="sm"
                               disabled={busyId === u.id}
                               onClick={async () => {
                                 setBusyId(u.id);
                                 setError(null);
                                 try {
                                   await updateUserRole(u.id, u.role);
                                   await refresh();
                                 } catch (e) {
                                   setError(e?.response?.data?.error?.message || 'Failed to update role');
                                 } finally {
                                   setBusyId(null);
                                 }
                               }}
                               className="h-9 px-4 rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-white"
                             >
                               {busyId === u.id ? (
                                 <RefreshCw className="w-3 h-3 animate-spin" />
                               ) : (
                                 <Save className="w-3 h-3" />
                               )}
                               {busyId === u.id ? 'Syncing' : 'Push'}
                             </Button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border bg-bg-alt/30 flex items-center justify-between">
               <div className="text-xs font-bold text-muted uppercase tracking-tighter">
                  Page {data.number + 1} of {data.totalPages || 1}
               </div>
               <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.first} 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="h-8 w-8 p-0 flex items-center justify-center rounded-lg shadow-sm bg-surface border-border"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.last} 
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 w-8 p-0 flex items-center justify-center rounded-lg shadow-sm bg-surface border-border"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-bg-alt rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-muted/30" />
             </div>
             <h3 className="text-lg font-bold text-text">No personnel found</h3>
             <p className="text-muted max-w-xs mx-auto mt-2 text-sm font-medium">The user database is currently empty or unavailable.</p>
          </div>
        )}
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in transition-all">
          <Card className="w-full max-w-2xl p-0 overflow-hidden border-border bg-surface rounded-2xl shadow-2xl animate-scale-in">
             <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-alt/30">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                      <UserCog className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-base font-black text-text uppercase tracking-tight">Modify Personnel Record</h4>
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest opacity-60">ID: {editingUser.id}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-bg-alt rounded-xl transition-all text-muted hover:text-primary"
                >
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handleEditSubmit} className="p-4 space-y-3 compact">
                <div className="grid grid-cols-2 gap-3">
                   <Input 
                     label="Full Name"
                     value={editFormData.fullName}
                     onChange={e => setEditFormData({...editFormData, fullName: e.target.value})}
                   />
                   <Input 
                     label="Phone"
                     value={editFormData.phone}
                     onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                   />
                   <Input 
                     label="Department"
                     value={editFormData.department}
                     onChange={e => setEditFormData({...editFormData, department: e.target.value})}
                   />
                   <Select 
                     label="Operational Status"
                     value={editFormData.status}
                     onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                     options={[
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' },
                        { value: 'SUSPENDED', label: 'Suspended' }
                     ]}
                   />
                   <Select 
                     label="System Language"
                     value={editFormData.language}
                     onChange={e => setEditFormData({...editFormData, language: e.target.value})}
                     options={[
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'French' },
                        { value: 'es', label: 'Spanish' }
                     ]}
                   />
                   <Select 
                     label="Default Timezone"
                     value={editFormData.timezone}
                     onChange={e => setEditFormData({...editFormData, timezone: e.target.value})}
                     options={[
                        { value: 'UTC', label: 'UTC' },
                        { value: 'EST', label: 'EST' },
                        { value: 'PST', label: 'PST' },
                        { value: 'IST', label: 'IST' }
                     ]}
                   />
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--color-divider)]">
                   <Select 
                      label="Auth Assignment"
                      value={editFormData.role}
                      onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                      options={[
                         { value: 'USER', label: 'End User' },
                         { value: 'TECHNICIAN', label: 'Technician' },
                         { value: 'ADMIN', label: 'System Admin' }
                      ]}
                      className="text-sm font-bold bg-surface border-border"
                   />
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--color-divider)]">
                   <Button 
                     type="submit" 
                     className="flex-1 h-10 font-black uppercase tracking-widest text-[9px] shadow-premium rounded-xl bg-primary text-white"
                     disabled={busyId === editingUser.id}
                   >
                      {busyId === editingUser.id ? 'Syncing...' : 'Synchronize Identity'}
                   </Button>
                   <Button 
                     type="button" 
                     variant="secondary" 
                     className="px-6 h-10 font-black uppercase tracking-widest text-[9px] rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-muted)]"
                     onClick={() => setEditingUser(null)}
                   >
                      Abort
                   </Button>
                </div>
             </form>
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        formData={createFormData}
        setFormData={setCreateFormData}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDeleteUser(userToDelete.id)}
        userName={userToDelete?.fullName}
        loading={busyId === userToDelete?.id}
      />
    </div>
  );
}

// Sub-component for Create User Modal
function CreateUserModal({ isOpen, onClose, onSubmit, formData, setFormData, loading }) {
  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in transition-all">
      <Card className="w-full max-w-xl p-0 overflow-hidden border-[var(--color-border)] bg-[var(--color-bg)] rounded-2xl shadow-2xl animate-scale-in">
         <div className="px-5 py-4 border-b border-[var(--color-divider)] flex items-center justify-between bg-[var(--color-bg-alt)]/30">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <Plus className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="text-base font-black text-[var(--color-text)] uppercase tracking-tight">Onboard New Personnel</h4>
                  <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-60">Authorize new network access.</p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--color-bg-alt)] rounded-lg transition-all text-[var(--color-muted)] hover:text-primary"
            >
               <X className="w-4 h-4" />
            </button>
         </div>
         
         <form onSubmit={onSubmit} className="p-4 space-y-3 compact">
            <div className="grid grid-cols-2 gap-3">
               <Input 
                 label="Username"
                 placeholder="e.g. jsmith24"
                 value={formData.username}
                 onChange={e => setFormData({...formData, username: e.target.value})}
                 required
               />
               <Input 
                 label="Email Address"
                 type="email"
                 placeholder="jsmith@university.edu"
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
                 required
               />
               <Input 
                 label="Initial Password"
                 type="password"
                 placeholder="••••••••"
                 value={formData.password}
                 onChange={e => setFormData({...formData, password: e.target.value})}
                 required
               />
               <Input 
                 label="Full Identity Name"
                 placeholder="John Smith"
                 value={formData.fullName}
                 onChange={e => setFormData({...formData, fullName: e.target.value})}
                 required
               />
               <Input 
                 label="Phone"
                 placeholder="+1 (555) 000-0000"
                 value={formData.phone}
                 onChange={e => setFormData({...formData, phone: e.target.value})}
               />
               <Input 
                 label="Department"
                 placeholder="Campus Services"
                 value={formData.department}
                 onChange={e => setFormData({...formData, department: e.target.value})}
               />
               <Select 
                 label="Access Tier"
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value})}
                 options={[
                    { value: 'TECHNICIAN', label: 'Technician' },
                    { value: 'USER', label: 'End User' },
                    { value: 'ADMIN', label: 'System Admin' }
                 ]}
               />
               <Select 
                 label="Initial Status"
                 value={formData.status}
                 onChange={e => setFormData({...formData, status: e.target.value})}
                 options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' }
                 ]}
               />
            </div>

            <div className="flex gap-2 pt-3 border-t border-[var(--color-divider)]">
               <Button 
                 type="submit" 
                 className="flex-1 h-10 font-black uppercase tracking-widest text-[9px] shadow-premium rounded-xl bg-primary text-white"
                 disabled={loading}
               >
                  {loading ? 'Processing...' : 'Authorize Personnel'}
               </Button>
               <Button 
                 type="button" 
                 variant="secondary" 
                 className="px-6 h-10 font-black uppercase tracking-widest text-[9px] rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-muted)]"
                 onClick={onClose}
               >
                  Cancel
               </Button>
            </div>
         </form>
      </Card>
    </div>
  );
}

// Sub-component for Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, userName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in transition-all">
      <Card className="w-full max-w-md p-0 overflow-hidden border-border bg-surface rounded-2xl shadow-2xl animate-scale-in">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-error/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error shadow-sm">
                <Trash2 className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-base font-black text-text uppercase tracking-tight">Confirm Deletion</h4>
                <p className="text-[9px] font-black text-error uppercase tracking-widest opacity-80">Permanent Action</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-bg-alt rounded-xl transition-all text-muted hover:text-error"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
           <div className="space-y-2">
             <p className="text-text font-bold text-sm">
               Are you sure you want to permanently delete <span className="text-error">"{userName}"</span>?
             </p>
             <p className="text-muted text-xs font-medium leading-relaxed">
               This will remove all associated records from the central campus database. This process is irreversible and may impact linked resource assignments.
             </p>
           </div>
        </div>

        <div className="p-4 bg-bg-alt/30 border-t border-border flex gap-3">
           <Button 
             variant="secondary"
             className="flex-1 h-11 font-black uppercase tracking-widest text-[10px] rounded-xl bg-surface border-border text-muted"
             onClick={onClose}
             disabled={loading}
           >
              Cancel
           </Button>
           <Button 
             className="flex-[1.5] h-11 font-black uppercase tracking-widest text-[10px] shadow-premium rounded-xl bg-error hover:bg-error/90 text-white gap-2"
             onClick={onConfirm}
             disabled={loading}
           >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm Deletion
                </>
              )}
           </Button>
        </div>
      </Card>
    </div>
  );
}


