import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * Modern Animated Shimmer Skeleton for Dashboard Hub
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 sm:p-5 bg-white border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Bookings Table / List Skeleton */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-4 sm:p-6 bg-white border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-lg" />
                <Skeleton className="h-3.5 w-60 rounded-md" />
              </div>
              <Skeleton className="h-8 w-40 rounded-xl" />
            </div>

            {/* Simulated Booking Rows */}
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-[#f8f9ff]/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                      </div>
                      <Skeleton className="h-3 w-40 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Operational Panels Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 sm:p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="space-y-3 pt-1">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="space-y-3 pt-1">
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Bookings Page
 */
export function BookingsTableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
      </div>

      {/* Filter Tabs & Search Ribbon */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </Card>

      {/* Booking List Cards / Table */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-3.5 w-48 rounded-md" />
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-24 rounded-md ml-auto" />
                  <Skeleton className="h-3 w-16 rounded-md ml-auto" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Calendar & Dispatch Schedule
 */
export function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Banner & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl shrink-0" />
      </div>

      {/* 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-slate-200/80 shadow-xs space-y-2">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </Card>
        ))}
      </div>

      {/* Date Navigation Strip */}
      <Card className="p-3 bg-white border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40 rounded-md" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </Card>

      {/* Timeline List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Inventory & Equipment Catalog
 */
export function InventorySkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-lg" />
        ))}
      </div>

      {/* 6 Unit Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-5 w-40 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-full rounded-md" />
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Customer Directory
 */
export function CustomersSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
      </div>

      <Skeleton className="h-10 w-full max-w-md rounded-xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-40 rounded-md" />
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Booking Detail Page
 */
export function BookingDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-44 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Items & Payments */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </Card>
        </div>

        {/* Right: Customer & Financial Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Animated Skeleton for Settings Page
 */
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </div>

      <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </Card>
    </div>
  );
}
