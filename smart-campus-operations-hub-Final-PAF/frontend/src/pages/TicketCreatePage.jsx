import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketsApi";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import {
  ArrowLeft,
  Send,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Tag,
  FileText,
  LifeBuoy,
  X,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

const CATEGORIES = [
  "EQUIPMENT_ISSUE",
  "FACILITY_DAMAGE",
  "TECHNICAL_ERROR",
  "NETWORK_ISSUE",
  "PLUMBING",
  "ELECTRICAL",
  "HVAC",
  "IT_SUPPORT",
  "CLEANING",
  "FURNITURE",
  "GENERAL",
  "OTHER",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL", "EMERGENCY"];


export function TicketCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "EQUIPMENT_ISSUE",
    priority: "MEDIUM",
    preferredContact: "",
    locationText: "",
    resourceId: "", // Ensure resourceId is tracked
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 3) {
      setError("Maximum 3 image attachments allowed.");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setError(null);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resourceId", form.resourceId || "");
      formData.append("locationText", form.locationText);
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("priority", form.priority);
      formData.append("description", form.description);
      formData.append("preferredContact", form.preferredContact);

      files.forEach((f) => formData.append("attachments", f));

      await createTicket(formData);
      setStep(3); // Success step
    } catch (e) {
      setError(
        e?.response?.data?.error?.message ||
          "Failed to initialize incident report.",
      );
      setBusy(false);
    }
  };

  const isStep1Valid = form.title.length >= 5 && form.locationText;
  const isStep2Valid = form.description.length >= 20;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-20">
      {/* SaaS Context Nav */}
      <button
        onClick={() => navigate("/tickets")}
        className="group flex items-center gap-2 text-[var(--color-muted)] hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] transition-all"
      >
        <div className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Return to Operations Queue
      </button>

      {/* Modern Stepper */}
      <div className="flex items-center justify-between px-2">
        {[
          { id: 1, label: "Context", icon: MapPin },
          { id: 2, label: "Technical Details", icon: FileText },
          { id: 3, label: "Deployment", icon: Send },
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-3 group relative">
              <div
                className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
                  step >= s.id
                    ? "bg-primary border-primary text-white shadow-premium"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                <s.icon className="w-5 h-5" />
                {step > s.id && (
                  <div className="absolute -top-1 -right-1 bg-success text-white rounded-full p-0.5 shadow-lg animate-bounce-in">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-success" />
                  </div>
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors ${step >= s.id ? "text-primary" : "text-[var(--color-muted)]"}`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className="flex-1 h-[2px] mx-4 -mt-8 relative overflow-hidden bg-[var(--color-border)] rounded-full">
                <div
                  className="absolute inset-0 bg-primary transition-all duration-1000"
                  style={{ width: step > s.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border-[var(--color-border)] shadow-premium bg-[var(--color-surface)] rounded-[2.5rem]">
        {step === 1 && (
          <div className="p-10 space-y-10">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                Priority Assignment
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
                Identify the Incident
              </h2>
              <p className="text-[var(--color-muted)] font-medium">
                Define the core parameters and spatial context of the report.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                    Primary Objective
                  </label>
                  <Input
                    placeholder="e.g. Critical Lighting Failure in Block A"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="rounded-2xl h-14 bg-[var(--color-background)] border-[var(--color-border)] focus:ring-8 focus:ring-primary/5 px-6 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                    Operational Area
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input
                      placeholder="Location coordinates or room number..."
                      value={form.locationText}
                      onChange={(e) =>
                        setForm({ ...form, locationText: e.target.value })
                      }
                      className="rounded-2xl h-14 bg-[var(--color-background)] border-[var(--color-border)] focus:ring-8 focus:ring-primary/5 pl-14 pr-6 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                    System Classification
                  </label>
                  <select
                    className="w-full h-14 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] px-6 text-sm font-bold outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all appearance-none text-[var(--color-text)] shadow-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                    Urgency Protocol
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 h-14 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                          form.priority === p
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-transparent border-[var(--color-border)] text-[var(--color-muted)] hover:border-slate-400"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="rounded-2xl h-14 px-10 gap-2 shadow-premium font-black uppercase tracking-widest text-[10px]"
              >
                Next Configuration
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-10">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Operational Context
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
                Technical Briefing
              </h2>
              <p className="text-[var(--color-muted)] font-medium">
                Provide a comprehensive analysis of the situation and attach
                visual evidence.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                  Detailed Log
                </label>
                <textarea
                  placeholder="Describe the incident in detail... (Minimum 20 characters)"
                  className="w-full h-48 rounded-3xl bg-[var(--color-background)] border border-[var(--color-border)] p-6 text-sm font-medium outline-none transition-all focus:ring-8 focus:ring-primary/5 focus:border-primary placeholder:text-[var(--color-muted)] shadow-inner"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                  Evidence Processing
                </label>
                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="cursor-pointer group">
                    <div className="h-32 rounded-3xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-2 group-hover:border-primary transition-all bg-[var(--color-background)]/50 group-hover:bg-primary/5">
                      <UploadCloud className="w-8 h-8 text-[var(--color-muted)] group-hover:text-primary transition-all group-hover:scale-110" />
                      <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest group-hover:text-primary">
                        Upload Assets
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFile}
                    />
                  </label>

                  <div className="space-y-2 overflow-y-auto max-h-32 pr-2 scrollbar-thin">
                    {files.length > 0 ? (
                      files.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl animate-fade-in-right"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-[10px] font-bold truncate pr-2 uppercase">
                              {f.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="text-[var(--color-muted)] hover:text-error transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center border border-[var(--color-border)] border-dashed rounded-3xl text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-50">
                        No Assets Attached
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
                  Communication Channel
                </label>
                <Input
                  placeholder="Phone or internal extension..."
                  value={form.preferredContact}
                  onChange={(e) =>
                    setForm({ ...form, preferredContact: e.target.value })
                  }
                  className="rounded-2xl h-14 bg-[var(--color-background)] border-[var(--color-border)] focus:ring-8 focus:ring-primary/5 px-6 font-bold"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error/5 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-[10px] font-black uppercase tracking-widest">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="rounded-2xl h-14 px-10"
              >
                Back
              </Button>
              <Button
                onClick={submit}
                disabled={busy || !isStep2Valid}
                className="rounded-2xl h-14 px-12 gap-3 shadow-premium font-black uppercase tracking-[0.2em] text-[10px]"
              >
                {busy ? "Processing Protocol..." : "Finalize Deployment"}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-20 text-center space-y-10 animate-fade-in-up">
            <div className="w-32 h-32 bg-success/10 rounded-[3rem] border border-success/20 flex items-center justify-center mx-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-success/10 blur-2xl group-hover:blur-xl transition-all" />
              <CheckCircle2 className="w-16 h-16 text-success relative z-10 animate-bounce-in" />
            </div>
            <div className="space-y-4">
              <div className="text-[10px] font-black text-success uppercase tracking-[0.4em]">
                Signal Confirmed
              </div>
              <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)]">
                Deployment Successful
              </h2>
              <p className="text-[var(--color-muted)] font-medium max-w-sm mx-auto">
                Your incident report has been registered in the operations
                queue. A technical specialist will be dispatched shortly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                onClick={() => navigate("/tickets")}
                className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-premium"
              >
                View Queue Board
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setForm({
                    title: "",
                    description: "",
                    category: "EQUIPMENT_ISSUE",
                    priority: "MEDIUM",
                    preferredContact: "",
                    locationText: "",
                  });
                  setFiles([]);
                }}
                className="h-14 px-10 rounded-2xl border-[var(--color-border)] text-[10px] font-black uppercase"
              >
                Report Another
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Help Overlay - SaaS style */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-[2rem] shadow-soft flex items-center gap-8 group">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-sm font-black text-[var(--color-text)] uppercase tracking-widest">
            Protocol Intelligence
          </h4>
          <p className="text-[var(--color-muted)] text-[11px] font-bold mt-1 max-w-lg leading-relaxed uppercase tracking-wider">
            Reports are analyzed for priority automatically. Please ensure
            high-quality visual evidence for faster technical deployment and
            system resolution.
          </p>
        </div>
      </div>
    </div>
  );
}
