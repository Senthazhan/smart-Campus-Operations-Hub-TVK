import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { 
  createResource, 
  deleteResource, 
  getResource, 
  updateResource 
} from '../api/resourcesApi';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Info, 
  Calendar,
  Layers,
  Eye,
  Settings2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { CardLoader } from '../components/common/PageLoader';

export function ResourceAdminFormPage({ mode }) {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    resourceCode: '',
    type: 'LECTURE_HALL',
    description: '',
    capacity: 0,
    building: '',
    floor: '',
    roomNumber: '',
    availabilityJson: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    setLoading(true);
    setError(null);
    getResource(id)
      .then((r) => {
        if (!alive) return;
        setForm({
          name: r.name || '',
          resourceCode: r.resourceCode || '',
          type: r.type || 'LECTURE_HALL',
          description: r.description || '',
          capacity: r.capacity ?? 0,
          building: r.building || '',
          floor: r.floor || '',
          roomNumber: r.roomNumber || '',
          availabilityJson: r.availabilityJson || '',
          status: r.status || 'ACTIVE',
        });
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || 'Failed to load resource');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const title = useMemo(() => (isEdit ? 'Resource Governance' : 'New Asset Registration'), [isEdit]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, capacity: Number(form.capacity) || 0 };
      const saved = isEdit ? await updateResource(id, payload) : await createResource(payload);
      nav(`/resources/${saved.id}`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleteModal(false);
    setSaving(true);
    setError(null);
    try {
      await deleteResource(id);
      nav('/resources');
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to delete resource');
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    if (!isEdit) return;
    setDeleteModal(true);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            <Settings2 className="w-3.5 h-3.5" />
            Infrastructure Manager
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--color-text)]">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/resources">
            <Button variant="secondary" className="gap-2 bg-[var(--color-surface)] shadow-sm border-[var(--color-border)] font-bold uppercase tracking-widest text-[10px]">
              <ChevronLeft className="w-4 h-4" />
              Catalogue
            </Button>
          </Link>
          {isEdit && (
            <Link to={`/resources/${id}`}>
              <Button variant="secondary" className="gap-2 bg-[var(--color-surface)] shadow-sm border-[var(--color-border)] font-bold uppercase tracking-widest text-[10px]">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <CardLoader text="Initializing Interface..." />
      ) : (
        <form onSubmit={onSubmit} className="space-y-8">
          {error && (
            <Card className="bg-error/5 border-error/20 p-4 font-bold text-error text-sm flex items-center gap-3">
               <AlertCircle className="w-5 h-5" />
               {error}
            </Card>
          )}

          <div className="grid lg:grid-cols-12 gap-8">
             {/* Left Column: Form Sections */}
             <div className="lg:col-span-8 space-y-8">
                {/* Core Configuration */}
                <Card className="p-8 space-y-8 border-[var(--color-border)] shadow-sm">
                   <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-divider)]">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                         <Info className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)]">Identity Details</h3>
                         <p className="text-xs font-medium text-[var(--color-muted)] mt-0.5">Primary identification parameters for this asset.</p>
                      </div>
                   </div>

                   <div className="grid gap-6">
                      <Input 
                        label="Official Designation" 
                        value={form.name} 
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                        required 
                        placeholder="e.g. Grand Auditorium Hall"
                        className="h-12 font-bold text-[var(--color-text)]"
                      />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                         <Input
                           label="Asset Identifier (Code)"
                           value={form.resourceCode}
                           onChange={(e) => setForm((f) => ({ ...f, resourceCode: e.target.value }))}
                           required
                           placeholder="LH-A202"
                           hint="Global system identifier"
                           className="font-mono h-12"
                         />
                         <Input
                           label="Total Capacity"
                           type="number"
                           min="0"
                           value={form.capacity}
                           onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                           hint="Occupant upper limit"
                           className="h-12 font-black"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">Asset Specification</label>
                         <textarea
                           className="input-premium min-h-[160px] resize-none"
                           rows={5}
                           value={form.description}
                           onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                           placeholder="Describe technical specifications, included equipment, or special usage instructions..."
                         />
                      </div>
                   </div>
                </Card>

                {/* Location Parameters */}
                <Card className="p-8 space-y-8 border-[var(--color-border)] shadow-sm">
                   <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-divider)]">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)]">Deployment Location</h3>
                         <p className="text-xs font-medium text-[var(--color-muted)] mt-0.5">Physical coordinates within the campus grid.</p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-6">
                      <Input 
                        label="Building Complex" 
                        value={form.building} 
                        onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} 
                        required 
                        placeholder="Main Campus"
                        className="h-12 font-bold"
                      />
                      <Input 
                        label="Floor Level" 
                        value={form.floor} 
                        onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} 
                        placeholder="3rd Floor"
                        className="h-12 font-bold"
                      />
                      <Input 
                        label="Locale/Room #" 
                        value={form.roomNumber} 
                        onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} 
                        placeholder="Suite 305"
                        className="h-12 font-bold"
                      />
                   </div>
                </Card>

                {/* Temporal Configuration */}
                <Card className="p-8 space-y-8 border-[var(--color-border)] shadow-sm">
                   <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-divider)]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)]">Availability Matrix</h3>
                         <p className="text-xs font-medium text-[var(--color-muted)] mt-0.5">Define JSON structured temporal constraints for booking.</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <textarea
                        className="w-full rounded-2xl border border-[var(--color-border)] bg-slate-900 px-5 py-4 font-mono text-sm text-emerald-400 shadow-lg outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all leading-relaxed"
                        rows={6}
                        value={form.availabilityJson}
                        onChange={(e) => setForm((f) => ({ ...f, availabilityJson: e.target.value }))}
                        placeholder='{"mon":[{"from":"08:00","to":"18:00"}]}'
                      />
                      <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest text-center">Structure must conform to strict JSON specifications.</p>
                   </div>
                </Card>
             </div>

             {/* Right Column: Status & Metadata */}
             <div className="lg:col-span-4 space-y-8">
                <Card className="p-8 space-y-8 border-[var(--color-border)] shadow-sm sticky top-8">
                   <div className="space-y-6">
                      <div className="pb-6 border-b border-[var(--color-divider)]">
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] flex items-center gap-2">
                           <Layers className="w-4 h-4 text-primary" />
                           Classification
                         </h3>
                      </div>

                      <Select
                        label="Asset Category"
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                        options={[
                          { value: 'LECTURE_HALL', label: 'Instructional Hall' },
                          { value: 'LAB', label: 'Technical Laboratory' },
                          { value: 'MEETING_ROOM', label: 'Collaboration Space' },
                          { value: 'EQUIPMENT', label: 'Technical Equipment' },
                        ]}
                      />

                      <Select
                        label="Operational Status"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        options={[
                          { value: 'ACTIVE', label: 'Status: Optimal / Ready' },
                          { value: 'UNDER_MAINTENANCE', label: 'Status: Maintenance Required' },
                          { value: 'OUT_OF_SERVICE', label: 'Status: Decommissioned' },
                        ]}
                        className={clsx(
                          "h-12 font-bold uppercase tracking-widest text-[10px]",
                          form.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        )}
                      />
                   </div>

                   <div className="space-y-3 pt-8 border-t border-[var(--color-divider)]">
                      <Button 
                        type="submit" 
                        disabled={saving} 
                        className="w-full h-14 rounded-2xl bg-[var(--color-text)] text-[var(--color-bg)] group shadow-xl shadow-primary/10 font-black uppercase tracking-[0.2em] text-xs gap-3"
                      >
                         {saving ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                         {saving ? 'Syncing...' : isEdit ? 'Commit Changes' : 'Transmit Record'}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => nav('/resources')} 
                        disabled={saving}
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                      >
                        Cancel Transaction
                      </Button>

                      {isEdit && (
                        <div className="pt-6 border-t border-[var(--color-divider)] mt-6">
                           <Button 
                             type="button" 
                             variant="secondary" 
                             onClick={onDelete} 
                             disabled={saving}
                             className="w-full h-12 rounded-xl text-error border-error/20 hover:bg-error/10 font-black uppercase tracking-widest text-[9px] gap-2"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                             Purge Asset Record
                           </Button>
                        </div>
                      )}
                   </div>
                </Card>
             </div>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Asset Decommissioning"
        message="Permanently redact this asset from the infrastructure registry? This operation is logged and irreversible."
        confirmLabel="Destroy Record"
        variant="danger"
      />
    </div>
  );
}
