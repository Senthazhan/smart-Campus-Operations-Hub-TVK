import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { listResources } from '../api/resourcesApi';
import { createBooking, getBooking, updateBooking } from '../api/bookingsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import {
  Search,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  Building2,
  Filter,
  Package,
} from 'lucide-react';

const RESOURCE_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'SEMINAR_ROOM', label: 'Seminar Room' },
  { value: 'AUDITORIUM', label: 'Auditorium' },
  { value: 'STUDY_ROOM', label: 'Study Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
];

export function BookingRequestPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { id: bookingId } = useParams();
  const isEditMode = Boolean(bookingId);

  const queryParams = new URLSearchParams(location.search);
  const initialResourceId = queryParams.get('resourceId') || '';

  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const [resourceId, setResourceId] = useState(initialResourceId);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(isEditMode);

  const [form, setForm] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const selectedResource = useMemo(
    () => resources.find((r) => String(r.id) === String(resourceId)),
    [resources, resourceId],
  );
//
  useEffect(() => {
    if (!isEditMode) {
      setBookingLoading(false);
      return;
    }

    let alive = true;
    setBookingLoading(true);
    setError(null);

    getBooking(bookingId)
      .then((booking) => {
        if (!alive) return;
        setResourceId(String(booking.resourceId));
        setForm({
          bookingDate: booking.bookingDate || '',
          startTime: booking.startTime ? String(booking.startTime).slice(0, 5) : '',
          endTime: booking.endTime ? String(booking.endTime).slice(0, 5) : '',
          purpose: booking.purpose || '',
          expectedAttendees: booking.expectedAttendees ?? 1,
          notes: booking.notes || '',
        });
        setFilterQuery(booking.resourceName || '');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'Failed to load booking');
      })
      .finally(() => {
        if (!alive) return;
        setBookingLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [bookingId, isEditMode]);

  useEffect(() => {
    let alive = true;
    setResourcesLoading(true);
    const params = { page: 0, size: 50, status: 'ACTIVE' };
    if (filterQuery) params.q = filterQuery;
    if (filterType) params.type = filterType;
    if (filterBuilding) params.building = filterBuilding;
    if (filterMinCapacity) params.minCapacity = parseInt(filterMinCapacity, 10);

    listResources(params)
      .then((d) => {
        if (!alive) return;
        const nextResources = d?.content || [];
        setResources(nextResources);

        if (!nextResources.length) {
          setResourceId('');
          return;
        }

        const hasSelectedResource = nextResources.some((r) => String(r.id) === String(resourceId));
        if (!hasSelectedResource) {
          setResourceId(String(nextResources[0].id));
        }
      })
      .catch(() => {
        if (!alive) return;
        setResources([]);
      })
      .finally(() => {
        if (!alive) return;
        setResourcesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [filterQuery, filterType, filterBuilding, filterMinCapacity, resourceId]);

  function validate() {
    if (!resourceId) return 'Please select a resource';
    if (!form.bookingDate) return 'Booking date is required';
    if (!form.startTime || !form.endTime) return 'Start and end time are required';
    if (form.startTime >= form.endTime) return 'Start time must be before end time';
    if (!form.purpose.trim()) return 'Purpose is required';
    const attendees = Number(form.expectedAttendees);
    if (!Number.isFinite(attendees) || attendees < 1) return 'Expected attendees must be at least 1';
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const normalizeTime = (time) => (time ? time.substring(0, 5) : time);
      const payload = {
        resourceId: String(resourceId),
        bookingDate: form.bookingDate,
        startTime: normalizeTime(form.startTime),
        endTime: normalizeTime(form.endTime),
        purpose: form.purpose,
        expectedAttendees: Number(form.expectedAttendees),
        notes: form.notes || null,
      };

      if (isEditMode) {
        await updateBooking(bookingId, payload);
      } else {
        await createBooking(payload);
      }
      nav('/my-bookings');
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err?.message || `Failed to ${isEditMode ? 'update' : 'submit'} booking request`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            {isEditMode ? 'Edit Booking Request' : 'Request a Booking'}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-1 font-medium">
            {isEditMode
              ? 'Update your pending reservation before it reaches a final decision.'
              : 'Reserve campus facilities or equipment for your upcoming events.'}
          </p>
        </div>
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-4 flex items-center gap-3">
          <div className="p-2 bg-error/10 text-error rounded-lg">
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-error">{error}</p>
        </Card>
      )}

      {bookingLoading ? (
        <Card className="p-6 border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-muted)] font-medium animate-pulse">Loading booking details...</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 border-[var(--color-border)]">
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Filter className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">1. Filter Resources</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Search by Name / Code"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="e.g. Lab 3, ROOM-101"
                    />
                    <Select
                      label="Resource Type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      options={RESOURCE_TYPE_OPTIONS}
                    />
                    <Input
                      label="Building"
                      value={filterBuilding}
                      onChange={(e) => setFilterBuilding(e.target.value)}
                      placeholder="e.g. Science Block"
                    />
                    <Input
                      label="Min. Capacity"
                      type="number"
                      min="1"
                      value={filterMinCapacity}
                      onChange={(e) => setFilterMinCapacity(e.target.value)}
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>

                <div className="h-px bg-[var(--color-divider)]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">2. Select Resource</h3>
                  </div>

                  {resourcesLoading ? (
                    <p className="text-sm text-[var(--color-muted)] font-medium animate-pulse">Loading available resources...</p>
                  ) : resources.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-medium">
                      No active resources match your filters. Try adjusting the criteria above.
                    </div>
                  ) : (
                    <Select
                      label="Choose Resource"
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                      options={resources.map((r) => ({
                        value: String(r.id),
                        label: `${r.name} (${r.resourceCode || r.type}) - Cap. ${r.capacity}`,
                      }))}
                    />
                  )}

                  {selectedResource && (
                    <div className="p-4 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border)] grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                        <Package className="w-4 h-4 text-[var(--color-muted)]" />
                        <span>{selectedResource.type?.replace(/_/g, ' ')}</span>
                      </div>
                      {selectedResource.building && (
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                          <Building2 className="w-4 h-4 text-[var(--color-muted)]" />
                          <span>
                            {selectedResource.building}
                            {selectedResource.floor ? `, Floor ${selectedResource.floor}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                        <Users className="w-4 h-4 text-[var(--color-muted)]" />
                        <span>Capacity: {selectedResource.capacity}</span>
                      </div>
                      {selectedResource.availableEquipment?.length > 0 && (
                        <div className="sm:col-span-3 flex flex-wrap gap-1 mt-1">
                          {selectedResource.availableEquipment.map((eq) => (
                            <Badge key={eq} variant="secondary" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-[var(--color-divider)]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">3. Schedule &amp; Logistics</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      value={form.bookingDate}
                      onChange={(e) => setForm((f) => ({ ...f, bookingDate: e.target.value }))}
                      required
                    />
                    <Input
                      label="Expected Attendees"
                      type="number"
                      min="1"
                      value={form.expectedAttendees}
                      onChange={(e) => setForm((f) => ({ ...f, expectedAttendees: e.target.value }))}
                      required
                    />
                    <Input
                      label="Start Time"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                      required
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="h-px bg-[var(--color-divider)]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">4. Booking Details</h3>
                  </div>
                  <Input
                    label="Purpose of Booking"
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    placeholder="E.g., Guest lecture, project meeting"
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest ml-1">Additional Notes</label>
                    <textarea
                      className="input-premium min-h-[140px] resize-none"
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Any special requirements or info for reviewer..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                  <Button variant="secondary" type="button" onClick={() => nav(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || resources.length === 0} className="px-8 shadow-premium">
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isEditMode ? 'Saving...' : 'Submitting...'}
                      </div>
                    ) : isEditMode ? (
                      'Save Changes'
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[var(--color-bg-alt)] border-[var(--color-border)] p-6 shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-[var(--color-text)]">Booking Tips</h4>
              </div>
              <ul className="space-y-4 relative">
                {[
                  'Use filters to narrow down the best resource for your needs.',
                  'Check capacity and book a room that fits your expected attendees.',
                  'Provide a clear purpose to help administrators evaluate your request.',
                  'Only pending reservations can be edited before review.',
                ].map((tip, index) => (
                  <li key={index} className="flex gap-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
              <h4 className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-4">Approval Process</h4>
              <div className="space-y-6 relative ml-2 mt-4">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-border)]" />
                {[
                  { label: 'Submission', desc: 'Your request is sent to the admin queue.' },
                  { label: 'Review', desc: 'Resource availability and purpose are verified.' },
                  { label: 'Decision', desc: 'You will receive a notification of approval or rejection.' },
                ].map((step, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                    <div className="text-sm font-bold text-[var(--color-text)]">{step.label}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5">{step.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
