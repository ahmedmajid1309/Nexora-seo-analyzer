"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type FilterValues = {
  state: string;
  category: string;
  severity: string;
  effort: string;
  search: string;
  sort: string;
};

type FindingFiltersProps = {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  categories: string[];
  totalCount: number;
  filteredCount: number;
};

export function FindingFilters({
  filters,
  onChange,
  categories,
  totalCount,
  filteredCount,
}: FindingFiltersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reduced = useReducedMotion();

  const activeCount = [
    filters.state !== "all",
    filters.category !== "all",
    filters.severity !== "all",
    filters.effort !== "all",
    filters.search !== "",
  ].filter(Boolean).length;

  function update(key: keyof FilterValues, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({
      state: "all",
      category: "all",
      severity: "all",
      effort: "all",
      search: "",
      sort: "priority",
    });
  }

  const selectClass =
    "rounded-lg border border-zinc-700 bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary";

  const filterSelects = (
    <>
      <select
        value={filters.state}
        onChange={(e) => update("state", e.target.value)}
        className={selectClass}
        aria-label="Filter by state"
      >
        <option value="all">All states</option>
        <option value="failed">Failed</option>
        <option value="warning">Warning</option>
        <option value="passed">Passed</option>
        <option value="not-applicable">N/A</option>
        <option value="unavailable">Unavailable</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        className={selectClass}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.severity}
        onChange={(e) => update("severity", e.target.value)}
        className={selectClass}
        aria-label="Filter by severity"
      >
        <option value="all">All severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.effort}
        onChange={(e) => update("effort", e.target.value)}
        className={selectClass}
        aria-label="Filter by effort"
      >
        <option value="all">All effort</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) => update("sort", e.target.value)}
        className={selectClass}
        aria-label="Sort by"
      >
        <option value="priority">Sort: Priority</option>
        <option value="severity">Sort: Severity</option>
        <option value="impact">Sort: Impact</option>
        <option value="effort">Sort: Effort</option>
        <option value="category">Sort: Category</option>
      </select>
    </>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search findings..."
            aria-label="Search findings"
            className="w-full rounded-lg border border-zinc-700 bg-bg-card py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary"
          />
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="sm:hidden inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-bg-card px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-zinc-500 transition-colors min-h-[36px]"
          aria-label="Open filters"
          aria-expanded={drawerOpen}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-black">
              {activeCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex sm:items-center sm:gap-2">
          {filterSelects}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="rounded-lg px-3 py-2 text-xs text-text-tertiary hover:text-text-primary transition-colors shrink-0"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 sm:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border border-zinc-800 bg-bg-primary p-5 pb-8 shadow-xl sm:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filter findings"
              initial={reduced ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduced ? undefined : { y: "100%" }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-text-primary">Filter findings</p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
                  aria-label="Close filters"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-3">{filterSelects}</div>
              <div className="mt-4 flex gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={() => {
                      clearAll();
                    }}
                    className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    Clear all ({activeCount})
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
                >
                  Apply filters
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-text-tertiary">
                Showing {filteredCount} of {totalCount} findings
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <p className="hidden sm:block text-xs text-text-tertiary">
        Showing {filteredCount} of {totalCount} findings
        {activeCount > 0 && (
          <span>
            {" "}
            &middot; {activeCount} filter{activeCount !== 1 ? "s" : ""} active
          </span>
        )}
      </p>
    </div>
  );
}
