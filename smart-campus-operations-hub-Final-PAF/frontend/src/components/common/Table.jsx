import React from 'react';
import clsx from 'clsx';

const TableSpinner = () => (
  <div className="flex flex-col items-center gap-4 py-20">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      <div className="absolute inset-[12px] rounded-full bg-primary/20 animate-pulse" />
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-muted)] animate-pulse">
      Processing Data...
    </span>
  </div>
);

/**
 * Premium Responsive Table Component
 * Usage:
 * <Table 
 *   headers={['Name', 'Status', 'Date']} 
 *   data={items} 
 *   renderRow={(item) => (
 *     <tr key={item.id}>
 *       <td>{item.name}</td>
 *       <td><Badge>{item.status}</Badge></td>
 *       <td>{item.date}</td>
 *     </tr>
 *   )} 
 * />
 */
export function Table({ 
  headers, 
  children, 
  className,
  containerClassName,
  emptyMessage = "No data available",
  isLoading = false,
  ...props 
}) {
  return (
    <div className={clsx("table-container flex flex-col", containerClassName)}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className={clsx("table-premium", className)} {...props}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && children}
            {isLoading && (
              <tr>
                <td colSpan={headers.length} className="text-center">
                  <TableSpinner />
                </td>
              </tr>
            )}
            {!isLoading && React.Children.count(children) === 0 && (
              <tr>
                <td colSpan={headers.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <span className="text-4xl">📂</span>
                    <span className="text-sm font-bold text-[var(--color-muted)] italic">
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Table Action Button - Specific styling for buttons inside table cells
 */
export function TableAction({ icon: Icon, onClick, variant = "secondary", label, color }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90",
        variant === "secondary" && "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] hover:text-primary",
        variant === "danger" && "bg-error/10 text-error hover:bg-error hover:text-white"
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
