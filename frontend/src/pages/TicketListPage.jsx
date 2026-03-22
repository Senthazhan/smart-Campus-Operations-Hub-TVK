import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTickets } from "../api/ticketsApi";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { StatusIndicator } from "../components/common/StatusIndicator";
import {
  Plus,
  Search,
  MessageSquare,
  User,
  Tag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  LifeBuoy,
  Layers,
} from "lucide-react";

const PRIORITY_THEMES = {
  LOW: { badge: "neutral", icon: "bg-slate-400" },
  MEDIUM: { badge: "warning", icon: "bg-amber-400" },
  HIGH: { badge: "danger", icon: "bg-orange-500" },
  URGENT: { badge: "danger", icon: "bg-red-600" },
  CRITICAL: { badge: "danger", icon: "bg-red-700" },
  EMERGENCY: { badge: "danger", icon: "bg-red-800" },
};

const STATUS_INDICATORS = {
  OPEN: "success",
  IN_PROGRESS: "warning",
  RESOLVED: "neutral",
  CLOSED: "neutral",
  REJECTED: "danger",
  APPROVED: "success",
};

export function TicketListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listTickets({ page, size: 10 })
      .then((d) => {
        if (!alive) return;
        setData(d);
      })
      .catch((e) => {
        if (!alive) return;
        setError(
          e?.response?.data?.error?.message ||
            "Failed to initialize support queue",
        );
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SaaS Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Operations Support
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
            Maintenance Queue
          </h2>
          <p className="text-[var(--color-muted)] font-medium mt-1">
            Monitor and resolve campus infrastructure and technical incidents.
          </p>
        </div>
        <Button
          onClick={() => navigate("/tickets/new")}
          className="gap-2 px-8 h-12 rounded-xl shadow-premium font-black uppercase tracking-[0.2em] text-[10px]"
        >
          <Plus className="w-4 h-4" />
          Initialize Report
        </Button>
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-4 flex items-center gap-3">
          <div className="p-2 bg-error text-white rounded-lg shadow-lg shadow-error/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[var(--color-text)]">{error}</p>
        </Card>
      )}

      {/* High-Density Pipeline View */}
      <Card className="p-0 overflow-hidden border-[var(--color-border)] shadow-soft bg-[var(--color-surface)]">
        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search queue..."
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-64"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 rounded-xl px-4 text-[10px] uppercase font-black tracking-widest gap-2 bg-transparent border-[var(--color-border)]"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </Button>
          </div>
          {data?.totalElements > 0 && (
            <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
              System health: <span className="text-success">Optimal</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="w-24 h-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : data?.content?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em]">
                      Incident Context
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em]">
                      Priority & Category
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em] text-center">
                      Protocol Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em] text-right">
                      Technical Assignment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.content.map((t) => (
                    <tr
                      key={t.id}
                      className="group hover:bg-[var(--color-background)]/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-[var(--color-text)] truncate group-hover:text-primary transition-colors pr-4">
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono font-black text-[var(--color-muted)]">
                                #{t.ticketNumber}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-muted)] truncate capitalize">
                                <User className="w-3 h-3" />
                                {t.createdByFullName || (t.createdByEmail ? t.createdByEmail.split("@")[0] : "Unknown")}
                              </div>
                              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                              <span className="text-[10px] font-bold text-[var(--color-muted)]">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">
                            <Tag className="w-3.5 h-3.5 text-primary" />
                            {t.category}
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${PRIORITY_THEMES[t.priority]?.icon || "bg-slate-400"}`}
                            />
                            <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest">
                              {t.priority}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <StatusIndicator
                            status={STATUS_INDICATORS[t.status] || "neutral"}
                          />
                          <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                            {t.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {t.assignedTechnicianEmail ? (
                          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[10px] font-bold text-[var(--color-text)] shadow-sm">
                            <div className="w-4.5 h-4.5 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Layers className="w-3 h-3" />
                            </div>
                            {t.assignedTechnicianEmail.split("@")[0]}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/5 border border-warning/10 rounded-xl text-[10px] font-black text-warning uppercase tracking-widest">
                            <History className="w-3 h-3 animate-pulse" />
                            Unassigned
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SaaS Pagination */}
            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 flex items-center justify-between">
              <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em]">
                Queue Position: {data.number * data.size + 1} —{" "}
                {Math.min((data.number + 1) * data.size, data.totalElements)} /{" "}
                {data.totalElements}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  disabled={data.first}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-10 w-10 p-0 flex items-center justify-center rounded-xl border-[var(--color-border)] hover:bg-[var(--color-background)] group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  variant="secondary"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-10 w-10 p-0 flex items-center justify-center rounded-xl border-[var(--color-border)] hover:bg-[var(--color-background)] group"
                >
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-24 text-center">
            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative border border-primary/10">
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
              <AlertTriangle className="w-10 h-10 text-primary relative z-10" />
            </div>
            <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight">
              Queue Depleted
            </h3>
            <p className="text-[var(--color-muted)] max-w-xs mx-auto mt-2 text-sm font-medium">
              No active maintenance reports found. The campus operations are
              currently nominal.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate("/tickets/new")}
              className="mt-10 h-12 px-10 rounded-xl border-[var(--color-border)] font-black uppercase tracking-widest text-[10px]"
            >
              Initialize Manual Report
            </Button>
          </div>
        )}
      </Card>

      {/* Support KPI Section */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          {
            label: "Avg Resolution",
            value: "4.2h",
            icon: History,
            trend: "-12%",
          },
          {
            label: "Active Tasks",
            value: data?.totalElements || "0",
            icon: Layers,
            trend: "+2",
          },
          {
            label: "Satisfaction",
            value: "98%",
            icon: LifeBuoy,
            trend: "Optimal",
          },
        ].map((kpi, i) => (
          <Card
            key={i}
            className="p-6 border-[var(--color-border)] flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <kpi.icon className="w-6 h-6 text-[var(--color-muted)] group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                  {kpi.label}
                </div>
                <div className="text-xl font-black text-[var(--color-text)] mt-0.5 tracking-tight">
                  {kpi.value}
                </div>
              </div>
            </div>
            <div className="text-[10px] font-black text-success uppercase tracking-widest">
              {kpi.trend}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
