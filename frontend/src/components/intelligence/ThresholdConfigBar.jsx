import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Check, ChevronDown } from 'lucide-react';

const DEFAULT_CONFIG = {
  analysisWindowDays: 30,
  deadStockDays: 60,
  fastMovingVelocity: 2.0,
  slowMovingVelocity: 0.5,
  stockoutDays: 7.0,
  overstockDays: 90.0,
};

export function ThresholdConfigBar({ config, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Configurable Intelligence Rules & Thresholds
            </h4>
            <p className="text-[11px] text-slate-500">
              Velocity window: <strong>{config.analysisWindowDays}d</strong> • Dead stock:{' '}
              <strong>{config.deadStockDays}d</strong> • Stockout trigger:{' '}
              <strong>{config.stockoutDays}d</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Reset thresholds to standard business defaults"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span>{isOpen ? 'Hide Rules' : 'Customize Rules'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Analysis Window */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Sales Velocity Analysis Window
            </label>
            <select
              value={config.analysisWindowDays}
              onChange={(e) => onChange('analysisWindowDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={14}>Last 14 Days (Short-term)</option>
              <option value={30}>Last 30 Days (Standard)</option>
              <option value={60}>Last 60 Days (Medium-term)</option>
              <option value={90}>Last 90 Days (Quarterly)</option>
            </select>
          </div>

          {/* Dead Stock Definition */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Dead Stock Threshold (Zero Sales)
            </label>
            <select
              value={config.deadStockDays}
              onChange={(e) => onChange('deadStockDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={30}>30+ Days without sales</option>
              <option value={60}>60+ Days without sales (Standard)</option>
              <option value={90}>90+ Days without sales</option>
              <option value={180}>180+ Days without sales (Extended)</option>
            </select>
          </div>

          {/* Stockout Risk Runway */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Stockout Risk Runway Horizon
            </label>
            <select
              value={config.stockoutDays}
              onChange={(e) => onChange('stockoutDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={3.0}>3 Days Runway (Critical)</option>
              <option value={7.0}>7 Days Runway (1 Week Standard)</option>
              <option value={14.0}>14 Days Runway (2 Weeks Buffer)</option>
              <option value={21.0}>21 Days Runway (Long Lead Time)</option>
            </select>
          </div>

          {/* Fast Moving Velocity Threshold */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Fast-Moving Velocity Cutoff
            </label>
            <select
              value={config.fastMovingVelocity}
              onChange={(e) => onChange('fastMovingVelocity', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={1.0}>≥ 1.0 units/day</option>
              <option value={2.0}>≥ 2.0 units/day (Standard)</option>
              <option value={3.0}>≥ 3.0 units/day</option>
              <option value={5.0}>≥ 5.0 units/day (High Volume)</option>
            </select>
          </div>

          {/* Overstock Days */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Overstock Runway Threshold
            </label>
            <select
              value={config.overstockDays}
              onChange={(e) => onChange('overstockDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={60.0}>&gt; 60 Days Supply</option>
              <option value={90.0}>&gt; 90 Days Supply (Standard)</option>
              <option value={120.0}>&gt; 120 Days Supply</option>
              <option value={180.0}>&gt; 180 Days Supply</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
