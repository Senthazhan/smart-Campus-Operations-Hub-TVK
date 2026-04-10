import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { listResources, previewResourceTimeFit } from '../api/resourcesApi';
import { createBooking, getBooking, updateBooking } from '../api/bookingsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ConfirmModal } from '../components/common/ConfirmModal';
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
  CalendarDays,
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

function timeToMinutes(value) {
  if (!value) return null;
  const [hours, minutes] = String(value).split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60) + minutes;
}

function clampPercentage(value) {
  return Math.max(0, Math.min(100, value));
}

function buildRangeStyle(start, end) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return { left: '0%', width: '0%' };
  }

  const left = clampPercentage((startMinutes / 1440) * 100);
  const width = clampPercentage(((endMinutes - startMinutes) / 1440) * 100);
  return { left: `${left}%`, width: `${width}%` };
}

export function BookingRequestPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { id: bookingId } = useParams();
  const isEditMode = Boolean(bookingId);
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const queryParams = new URLSearchParams(location.search);
  const initialResourceId = queryParams.get('resourceId') || '';

  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const [resourceId, setResourceId] = useState(initialResourceId);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
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
  const [bookingNotice, setBookingNotice] = useState({ open: false, title: '', message: '' });
  const [lastNoticeKey, setLastNoticeKey] = useState('');

  const selectedResource = useMemo(
    () => resources.find((r) => String(r.id) === String(resourceId)),
    [resources, resourceId],
  );

  const requestedSlotStyle = useMemo(
    () => buildRangeStyle(form.startTime, form.endTime),
    [form.startTime, form.endTime],
  );

  const attendeeCapacityRequirement = useMemo(() => {
    const attendees = Number(form.expectedAttendees);
    const manualMinimum = Number.parseInt(filterMinCapacity, 10);

    if (Number.isFinite(attendees) && attendees > 0 && Number.isFinite(manualMinimum) && manualMinimum > 0) {
      return Math.max(attendees, manualMinimum);
    }
    if (Number.isFinite(attendees) && attendees > 0) {
      return attendees;
    }
    if (Number.isFinite(manualMinimum) && manualMinimum > 0) {
      return manualMinimum;
    }
    return undefined;
  }, [form.expectedAttendees, filterMinCapacity]);

  const availabilityBoardResources = useMemo(() => {
    if (!previewRows.length) return [];
    const ordered = [...previewRows].sort((a, b) => {
      if (String(a.resource?.id) === String(resourceId)) return -1;
      if (String(b.resource?.id) === String(resourceId)) return 1;
      return String(a.resource?.name || '').localeCompare(String(b.resource?.name || ''));
    });
    return ordered.slice(0, 6);
  }, [previewRows, resourceId]);

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
    if (attendeeCapacityRequirement) params.minCapacity = attendeeCapacityRequirement;
    if (form.bookingDate && form.startTime && form.endTime) {
      params.bookingDate = form.bookingDate;
      params.startTime = form.startTime;
      params.endTime = form.endTime;
      if (isEditMode && bookingId) {
        params.excludeBookingId = bookingId;
      }
    }

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
  }, [
    filterQuery,
    filterType,
    filterBuilding,
    attendeeCapacityRequirement,
    form.bookingDate,
    form.startTime,
    form.endTime,
    bookingId,
    isEditMode,
    resourceId,
  ]);

  useEffect(() => {
    const hasSchedule = Boolean(form.bookingDate && form.startTime && form.endTime);
    if (!hasSchedule) {
      setPreviewRows([]);
      setPreviewLoading(false);
      return;
    }

    let alive = true;
    setPreviewLoading(true);
    const params = {
      page: 0,
      size: 12,
      status: 'ACTIVE',
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
    };
    if (filterQuery) params.q = filterQuery;
    if (filterType) params.type = filterType;
    if (filterBuilding) params.building = filterBuilding;
    if (attendeeCapacityRequirement) params.minCapacity = attendeeCapacityRequirement;
    if (isEditMode && bookingId) {
      params.excludeBookingId = bookingId;
    }

    previewResourceTimeFit(params)
      .then((d) => {
        if (!alive) return;
        setPreviewRows(d?.content || []);
      })
      .catch(() => {
        if (!alive) return;
        setPreviewRows([]);
      })
      .finally(() => {
        if (!alive) return;
        setPreviewLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [
    filterQuery,
    filterType,
    filterBuilding,
    attendeeCapacityRequirement,
    form.bookingDate,
    form.startTime,
    form.endTime,
    bookingId,
    isEditMode,
  ]);

  function validate() {
    if (!resourceId) return 'Please select a resource';
    if (!form.bookingDate) return 'Booking date is required';
    if (form.bookingDate < today) return 'Booking date cannot be in the past';
    if (!form.startTime || !form.endTime) return 'Start and end time are required';
    if (form.bookingDate === today && form.startTime <= currentTime) {
      return 'Start time must be in the future for bookings scheduled today';
    }
    if (form.startTime >= form.endTime) return 'Start time must be before end time';
    if (!form.purpose.trim()) return 'Purpose is required';
    const attendees = Number(form.expectedAttendees);
    if (!Number.isFinite(attendees) || attendees < 1) return 'Expected attendees must be at least 1';
    return null;
  }

  function openBookingNotice(title, message) {
    setBookingNotice({ open: true, title, message });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      openBookingNotice('Booking Not Allowed', validationError);
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
      const message = err?.message || `Failed to ${isEditMode ? 'update' : 'submit'} booking request`;
      setError(message);
      openBookingNotice('Booking Not Allowed', message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const hasSchedule = Boolean(form.bookingDate && form.startTime && form.endTime);
    const noticeKey = [
      form.bookingDate,
      form.startTime,
      form.endTime,
      filterType,
      filterBuilding,
      filterMinCapacity,
      filterQuery,
    ].join('|');

    if (!hasSchedule || resourcesLoading || resources.length > 0 || noticeKey === lastNoticeKey) {
      return;
    }

    openBookingNotice(
      'No Booking Slot Available',
      'No resources are available for the selected date and time. The slot may already be reserved, outside allowed availability, or filtered out by your current search criteria.',
    );
    setLastNoticeKey(noticeKey);
  }, [
    form.bookingDate,
    form.startTime,
    form.endTime,
    filterType,
    filterBuilding,
    filterMinCapacity,
    filterQuery,
    resourcesLoading,
    resources.length,
    lastNoticeKey,
  ]);

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
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">2. Schedule &amp; Logistics</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      min={today}
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
                      min={form.bookingDate === today ? currentTime : undefined}
                      value={form.startTime}
                      onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                      required
                    />
                    <Input
                      label="End Time"
                      type="time"
                      min={
                        form.bookingDate === today
                          ? (form.startTime && form.startTime > currentTime ? form.startTime : currentTime)
                          : form.startTime || undefined
                      }
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
                      <Search className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">3. Select Resource</h3>
                  </div>

                  {resourcesLoading ? (
                    <p className="text-sm text-[var(--color-muted)] font-medium animate-pulse">Loading available resources...</p>
                  ) : resources.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-medium">
                      No resources are available for this request. Adjust the time slot, attendee count, or filters to continue.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        label="Choose Resource"
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        options={resources.map((r) => ({
                          value: String(r.id),
                          label: `${r.name} (${r.resourceCode || r.type}) - Cap. ${r.capacity}`,
                        }))}
                      />
                      <p className="text-xs font-medium text-[var(--color-muted)]">
                        Showing resources that can support at least {attendeeCapacityRequirement || form.expectedAttendees || 1} attendees.
                      </p>
                    </div>
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
                      {(selectedResource.availableFrom || selectedResource.availableTo) && (
                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                          <Clock className="w-4 h-4 text-[var(--color-muted)]" />
                          <span>
                            Available:
                            {' '}
                            {selectedResource.availableFrom || '--:--'}
                            {' - '}
                            {selectedResource.availableTo || '--:--'}
                          </span>
                        </div>
                      )}
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
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">4. Time Fit Preview</h3>
                  </div>

                  {!form.bookingDate || !form.startTime || !form.endTime ? (
                    <div className="p-4 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] font-medium">
                      Pick a date and time first. We will then show whether your requested slot fits inside each resource's allowed booking hours.
                    </div>
                  ) : previewLoading ? (
                    <p className="text-sm text-[var(--color-muted)] font-medium animate-pulse">Preparing time preview...</p>
                  ) : availabilityBoardResources.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-medium">
                      No resources match your current filters, attendee count, and time selection.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/40 p-4">
                        <div className="text-sm font-bold text-[var(--color-text)]">How to read this preview</div>
                        <div className="mt-2 grid gap-2 text-sm text-[var(--color-text-secondary)]">
                          <p>
                            <span className="font-bold text-emerald-300">Green bar</span>
                            {' '}
                            means the hours when that resource can normally be booked.
                          </p>
                          <p>
                            <span className="font-bold text-primary">Blue bar</span>
                            {' '}
                            means the time slot you selected in this form.
                          </p>
                          <p>The status message under each row explains whether that room is available, outside hours, or blocked by another booking.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((label) => (
                          <div key={label}>{label}</div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {availabilityBoardResources.map((preview) => {
                          const resource = preview.resource;
                          const operatingWindowStyle = buildRangeStyle(resource?.availableFrom, resource?.availableTo);
                          const conflictWindowStyle = buildRangeStyle(preview.conflictStart, preview.conflictEnd);
                          const isSelected = String(resource?.id) === String(resourceId);
                          const isAvailable = preview.previewStatus === 'AVAILABLE';
                          const isOutsideHours = preview.previewStatus === 'OUTSIDE_HOURS';
                          const isConflict = preview.previewStatus === 'BOOKING_CONFLICT';

                          return (
                            <div
                              key={resource.id}
                              className={`rounded-2xl border p-4 transition-all ${
                                isSelected
                                  ? 'border-primary/40 bg-primary/5 shadow-soft'
                                  : 'border-[var(--color-border)] bg-[var(--color-bg-alt)]/30'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                <div>
                                  <div className="text-sm font-black text-[var(--color-text)]">{resource.name}</div>
                                  <div className="text-[10px] font-mono font-bold text-[var(--color-muted)]">
                                    {resource.resourceCode}
                                    {resource.building ? ` • ${resource.building}` : ''}
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                                  Bookable Hours {resource.availableFrom || '--:--'} - {resource.availableTo || '--:--'}
                                </div>
                              </div>

                              <div className="relative h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                                <div className="absolute inset-y-0 left-0 right-0 bg-[linear-gradient(to_right,transparent_0%,transparent_16.66%,rgba(255,255,255,0.06)_16.66%,rgba(255,255,255,0.06)_17.1%,transparent_17.1%,transparent_33.33%,rgba(255,255,255,0.06)_33.33%,rgba(255,255,255,0.06)_33.8%,transparent_33.8%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_50.4%,transparent_50.4%,transparent_66.66%,rgba(255,255,255,0.06)_66.66%,rgba(255,255,255,0.06)_67.1%,transparent_67.1%,transparent_83.33%,rgba(255,255,255,0.06)_83.33%,rgba(255,255,255,0.06)_83.8%,transparent_83.8%,transparent_100%)]" />
                                <div
                                  className="absolute top-2 bottom-2 rounded-lg bg-emerald-500/25 border border-emerald-400/30"
                                  style={operatingWindowStyle}
                                />
                                {isConflict && (
                                  <div
                                    className="absolute top-2 bottom-2 rounded-lg bg-red-500/25 border border-red-400/30"
                                    style={conflictWindowStyle}
                                  />
                                )}
                                <div
                                  className={`absolute top-3 bottom-3 rounded-lg border ${
                                    isConflict
                                      ? 'bg-red-500/40 border-red-400/60'
                                      : isOutsideHours
                                        ? 'bg-amber-500/40 border-amber-400/60'
                                        : isSelected
                                          ? 'bg-primary/45 border-primary/60'
                                          : 'bg-sky-500/35 border-sky-400/40'
                                  }`}
                                  style={requestedSlotStyle}
                                />
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                                  Room Available
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                                  Your Chosen Time
                                </span>
                                {isConflict && (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-red-300">
                                    Existing Booking
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--color-text)]">
                                    Currently Selected
                                  </span>
                                )}
                              </div>

                              <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-medium ${
                                isAvailable
                                  ? 'border-emerald-400/15 bg-emerald-500/10 text-emerald-300'
                                  : isConflict
                                    ? 'border-red-400/15 bg-red-500/10 text-red-300'
                                    : isOutsideHours
                                      ? 'border-amber-400/15 bg-amber-500/10 text-amber-300'
                                      : 'border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 text-[var(--color-text-secondary)]'
                              }`}>
                                {preview.previewReason}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[var(--color-divider)]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest">5. Booking Details</h3>
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

      <ConfirmModal
        isOpen={bookingNotice.open}
        onClose={() => setBookingNotice({ open: false, title: '', message: '' })}
        onConfirm={() => setBookingNotice({ open: false, title: '', message: '' })}
        title={bookingNotice.title || 'Booking Notice'}
        message={bookingNotice.message || 'This booking cannot be completed with the current details.'}
        confirmLabel="OK"
        cancelLabel="Close"
        variant="warning"
      />
    </div>
  );
}
