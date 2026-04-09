import React, { useEffect, useRef, useState } from "react";
import {
  listResources,
  createResource,
  updateResource,
  deleteResource,
} from "../api/resourcesApi";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Building2,
  Users,
  AlertCircle,
} from "lucide-react";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { CardLoader } from '../components/common/PageLoader';
import clsx from "clsx";

export function AdminResourcesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    resourceCode: "",
    type: "MEETING_ROOM",
    description: "",
    imageUrl: "",
    building: "",
    floor: "",
    roomNumber: "",
    availableFrom: "08:00",
    availableTo: "17:00",
    capacity: 0,
    status: "ACTIVE",
    availableEquipment: "",
    lastMaintenanceDate: "",
  });

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await listResources({ page, size: 7, q: search });
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.error?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(refresh, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setImagePreviewUrl("");
      setFormData({
        name: resource.name,
        resourceCode: resource.resourceCode || "",
        type: resource.type,
        description: resource.description,
        imageUrl: resource.imageUrl || "",
        building: resource.building || "",
        floor: resource.floor || "",
        roomNumber: resource.roomNumber || "",
        availableFrom: resource.availableFrom || "08:00",
        availableTo: resource.availableTo || "17:00",
        capacity: resource.capacity,
        status: resource.status,
        availableEquipment: resource.availableEquipment ? resource.availableEquipment.join(", ") : "",
        lastMaintenanceDate: resource.lastMaintenanceDate || "",
      });
    } else {
      setEditingResource(null);
      setImagePreviewUrl("");
      setFormData({
        name: "",
        resourceCode: "",
        type: "MEETING_ROOM",
        description: "",
        imageUrl: "",
        building: "",
        floor: "",
        roomNumber: "",
        availableFrom: "08:00",
        availableTo: "17:00",
        capacity: 0,
        status: "ACTIVE",
        availableEquipment: "",
        lastMaintenanceDate: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        availableEquipment: formData.availableEquipment 
          ? formData.availableEquipment.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (editingResource) {
        await updateResource(editingResource.id, payload);
      } else {
        await createResource(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    if (!id) return;
    setDeleteModal({ open: false, id: null });
    setLoading(true);
    try {
      await deleteResource(id);
      refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "OUT_OF_SERVICE":
        return "warning";
      case "MAINTENANCE":
        return "danger";
      default:
        return "secondary";
    }
  };

  const processImageFile = (file) => {
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Resource image must be less than 1MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageUrl: String(reader.result || "") }));
      setError(null);
    };
    reader.onerror = () => setError("Failed to read selected image.");
    reader.readAsDataURL(file);
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Resource Registry
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-1 font-medium">
            Manage campus inventory, rooms, and technical equipment.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="gap-2 shadow-premium px-6"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </Button>
      </div>

      {/* Filters/Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
          <Input
            placeholder="Search resources by name or location..."
            className="pl-11 h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={refresh}
          className="h-12 w-12 p-0 flex items-center justify-center rounded-2xl border-[var(--color-border)]"
        >
          <RefreshCw
            className={`w-5 h-5 text-[var(--color-text-secondary)] ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error/5 border border-error/20 rounded-2xl flex items-center gap-3 text-error font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Registry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && !data ? (
          <div className="col-span-full">
            <CardLoader text="Scanning Registry..." />
          </div>
        ) : (
          data?.content?.map((r) => (
            <Card
              key={r.id}
              className="group relative overflow-hidden border-[var(--color-border)] hover:border-primary/30 transition-all p-0 shadow-sm hover:shadow-premium"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] flex items-center justify-center shadow-sm">
                      <Package className="w-7 h-7 text-[var(--color-muted)] group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-[var(--color-text)] tracking-tight">
                          {r.name}
                        </h3>
                        <Badge
                          variant={getStatusColor(r.status)}
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {(r.building || r.floor) && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                            <Building2 className="w-3.5 h-3.5" />
                            {r.building || "N/A"} - Floor{" "}
                            {r.floor || "N/A"}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                          <Users className="w-3.5 h-3.5" />
                          Cap. {r.capacity}
                        </div>
                        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
                          {r.availableFrom && r.availableTo ? `${r.availableFrom} - ${r.availableTo}` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenModal(r)}
                      className="w-10 h-10 p-0 rounded-xl border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDeleteModal({ open: true, id: r.id })}
                      className="w-10 h-10 p-0 rounded-xl border-[var(--color-border)] hover:bg-error/10 hover:text-error hover:border-error/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--color-text-secondary)] font-medium leading-relaxed line-clamp-2">
                  {r.description ||
                    "No description provided for this campus resource."}
                </p>
              </div>
            </Card>
          ))
        )}

        {!loading && !data?.content?.length && (
          <div className="col-span-full py-24 text-center">
            <div className="w-20 h-20 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              No resources found
            </h3>
            <p className="text-[var(--color-text-secondary)] max-w-xs mx-auto mt-2 font-medium">
              Try adjusting your search filters or add a new resource to the
              directory.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-lg shadow-premium border-[var(--color-border)] rounded-2xl overflow-hidden p-0 bg-[var(--color-bg)]">
            <div className="p-4 border-b border-[var(--color-divider)] bg-[var(--color-bg-alt)]/50">
              <h3 className="text-base font-extrabold text-[var(--color-text)] uppercase tracking-tight">
                {editingResource ? "Modify Asset" : "Register New Asset"}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-[9px] font-medium uppercase tracking-widest opacity-60">
                System Record Update
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 compact">
              <div className="grid grid-cols-12 gap-3">
                <Input 
                  label="Name" 
                  required 
                  value={formData.name} 
                  containerClassName="col-span-8"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
                <Input 
                  label="Code" 
                  required 
                  placeholder="ROOM-101" 
                  value={formData.resourceCode} 
                  containerClassName="col-span-4"
                  onChange={(e) => setFormData({ ...formData, resourceCode: e.target.value })} 
                  inputClassName="font-mono uppercase"
                />

                <Select 
                  label="Type" 
                  containerClassName="col-span-6"
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                  options={[
                      { value: "MEETING_ROOM", label: "Meeting Room" },
                      { value: "LECTURE_HALL", label: "Lecture Hall" },
                      { value: "LAB", label: "Laboratory" },
                      { value: "SEMINAR_ROOM", label: "Seminar Room" },
                      { value: "AUDITORIUM", label: "Auditorium" },
                      { value: "STUDY_ROOM", label: "Study Room" },
                      { value: "EQUIPMENT", label: "Technical Kit" },
                    ]}
                />
                <Input 
                  label="Capacity" 
                  type="number" 
                  containerClassName="col-span-6"
                  value={formData.capacity === 0 && !formData.capacity.toString() ? '' : formData.capacity} 
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} 
                />

                <Input 
                  label="Building" 
                  required 
                  containerClassName="col-span-4" 
                  value={formData.building} 
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })} 
                />
                <Input 
                  label="Floor" 
                  containerClassName="col-span-4" 
                  value={formData.floor} 
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })} 
                />
                <Input 
                  label="Room" 
                  containerClassName="col-span-4" 
                  value={formData.roomNumber} 
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} 
                />
                <Input
                  label="Available From"
                  type="time"
                  required
                  containerClassName="col-span-6"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                />
                <Input
                  label="Available To"
                  type="time"
                  required
                  containerClassName="col-span-6"
                  value={formData.availableTo}
                  onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                />

                <Select 
                  label="Status" 
                  containerClassName="col-span-6"
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  options={[
                      { value: "ACTIVE", label: "Active Use" },
                      { value: "OUT_OF_SERVICE", label: "Offline" },
                      { value: "MAINTENANCE", label: "Under Maintenance" },
                    ]}
                />
                <Input 
                  label="Maintenance" 
                  type="date" 
                  containerClassName="col-span-6"
                  value={formData.lastMaintenanceDate} 
                  onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })} 
                />

                <Input 
                  label="Equipment" 
                  placeholder="e.g. Projector, Whiteboard" 
                  containerClassName="col-span-12"
                  value={formData.availableEquipment} 
                  onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value })} 
                />
                <div className="col-span-12 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">Resource Image</label>
                  <div
                    className={clsx(
                      "rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer",
                      dragActive ? "border-primary bg-primary/5" : "border-[var(--color-border)] bg-[var(--color-bg-alt)]/40"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      processImageFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageInputChange}
                    />
                    <p className="text-xs font-bold text-[var(--color-text)]">
                      upload image
                    </p>
                    <p className="text-[10px] font-medium text-[var(--color-muted)] mt-1">PNG, JPG, WEBP up to 1MB</p>
                    {(imagePreviewUrl || formData.imageUrl) ? (
                      <div className="mt-3 space-y-2">
                        <img
                          src={imagePreviewUrl || formData.imageUrl}
                          alt="Resource preview"
                          className="h-24 w-full rounded-lg object-cover border border-[var(--color-border)]"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 text-[9px] font-black uppercase tracking-widest rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreviewUrl("");
                            setFormData((prev) => ({ ...prev, imageUrl: "" }));
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-[var(--color-divider)]">
                <Button type="submit" className="flex-1 shadow-premium h-10 text-[9px] font-black uppercase tracking-widest rounded-xl text-white">
                  {editingResource ? "Commit Sync" : "Provision Asset"}
                </Button>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-6 h-10 text-[9px] font-black uppercase tracking-widest rounded-xl">
                  Discard
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Asset Deletion"
        message="Are you sure you want to permanently decommission this resource? This action is irreversible."
        confirmLabel="Destroy Record"
        variant="danger"
      />
    </div>
  );
}
