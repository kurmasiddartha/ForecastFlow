import React, { useState } from 'react';
import {
  Layers,
  Network,
  Share2,
  Workflow,
  ArrowRight,
  Database,
  Server,
  Monitor,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Box,
  TrendingUp,
  ShoppingCart,
  Zap,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Code2,
  Copy,
  Check,
  Eye,
  Terminal,
  Sparkles,
  Bot,
  ExternalLink,
  FileCode2,
} from 'lucide-react';
import { DIAGRAMS_CODE, MASTER_AI_PROMPT } from './diagramsCode';

export function DiagramsViewer({ initialDiagram = 'object' }) {
  const [activeDiagram, setActiveDiagram] = useState(initialDiagram);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewFormat, setViewFormat] = useState('diagram'); // 'diagram' | 'code'
  const [codeLang, setCodeLang] = useState('plantuml'); // 'plantuml' | 'mermaid' | 'prompt'
  const [promptScope, setPromptScope] = useState('current'); // 'current' | 'master'
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'object', name: '1. Object Diagram', icon: Box, tag: 'Like Sample' },
    { id: 'class', name: '2. Class Diagram', icon: Layers, tag: 'UML 2.5' },
    { id: 'arch', name: '3. System Architecture', icon: Network, tag: '3-Tier' },
    { id: 'usecase', name: '4. Use Case Diagram', icon: Share2, tag: 'Actors' },
    { id: 'activity', name: '5. Activity Diagram', icon: Workflow, tag: 'Flow' },
    { id: 'sequence', name: '6. Sequence Diagram', icon: ArrowRight, tag: 'Lifeline' },
  ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.65));
  const handleResetZoom = () => setZoomLevel(1);

  const currentCodeData = DIAGRAMS_CODE[activeDiagram] || DIAGRAMS_CODE.object;

  const currentDisplayedText =
    codeLang === 'plantuml'
      ? currentCodeData.plantuml
      : codeLang === 'mermaid'
        ? currentCodeData.mermaid
        : promptScope === 'master'
          ? MASTER_AI_PROMPT
          : currentCodeData.prompt;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentDisplayedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white shadow-xl overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'relative'
      }`}
    >
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 bg-slate-50/90 p-3 sm:px-5 gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDiagram === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDiagram(tab.id);
                  setZoomLevel(1);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-normal uppercase ${
                    isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Canvas Controls */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
          {/* Toggle between Visual Diagram & Code/Prompt View */}
          <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setViewFormat('diagram')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewFormat === 'diagram'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('code')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewFormat === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Code &amp; AI Prompt</span>
            </button>
          </div>

          {/* Zoom controls (Only when in visual diagram mode) */}
          {viewFormat === 'diagram' && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-600 px-2 min-w-[50px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content: Either Visual Diagram Canvas OR Code & AI Prompt View */}
      {viewFormat === 'diagram' ? (
        <div className="flex-1 bg-slate-50/60 overflow-auto p-4 sm:p-8 flex items-center justify-center min-h-[580px] max-h-[780px] select-none">
          <div
            className="transition-transform duration-200 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {activeDiagram === 'object' && <ObjectDiagramCanvas />}
            {activeDiagram === 'class' && <ClassDiagramCanvas />}
            {activeDiagram === 'arch' && <ArchitectureDiagramCanvas />}
            {activeDiagram === 'usecase' && <UseCaseDiagramCanvas />}
            {activeDiagram === 'activity' && <ActivityDiagramCanvas />}
            {activeDiagram === 'sequence' && <SequenceDiagramCanvas />}
          </div>
        </div>
      ) : (
        /* CODE & AI PROMPT VIEWER */
        <div className="flex-1 bg-slate-950 p-4 sm:p-8 min-h-[580px] flex flex-col justify-between space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-sm">
                  {codeLang === 'prompt' ? <Bot className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                </span>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {codeLang === 'prompt'
                    ? promptScope === 'master'
                      ? 'Master AI Architecture Prompt — All LLMs'
                      : `${currentCodeData.title} — AI Generation Prompt`
                    : `${currentCodeData.title} — Source Code`}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {codeLang === 'prompt'
                  ? 'Feed this prompt into ChatGPT, Gemini, or Claude to generate or customize complete PlantUML / Mermaid diagrams based on ForecastFlow.'
                  : currentCodeData.summary}
              </p>
            </div>

            {/* Language / Prompt Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Main Selector: PlantUML / Mermaid / AI Prompt */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCodeLang('plantuml')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    codeLang === 'plantuml'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>PlantUML</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('mermaid')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    codeLang === 'mermaid'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Mermaid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('prompt')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    codeLang === 'prompt'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  <span>AI Prompt</span>
                </button>
              </div>

              {/* External Visualizer Links */}
              {codeLang === 'plantuml' && (
                <a
                  href="https://www.planttext.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Test in PlantText online runner"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                  <span>PlantText</span>
                </a>
              )}
              {codeLang === 'mermaid' && (
                <a
                  href="https://mermaid.live"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Test in Mermaid Live Editor"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Mermaid Live</span>
                </a>
              )}

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-indigo-500/20'
                }`}
                title="Copy current content to clipboard"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>
                  {copied
                    ? 'Copied to Clipboard!'
                    : codeLang === 'prompt'
                      ? 'Copy AI Prompt'
                      : `Copy ${codeLang.toUpperCase()}`}
                </span>
              </button>
            </div>
          </div>

          {/* Sub-bar for AI Prompt Scope & LLM Target Badges */}
          {codeLang === 'prompt' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-purple-900/40 rounded-2xl p-3 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300">Prompt Scope:</span>
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPromptScope('current')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      promptScope === 'current'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active Diagram Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptScope('master')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      promptScope === 'master'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Master System Prompt (All-in-One)
                  </button>
                </div>
              </div>

              {/* Supported LLM Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Tuned for:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                  ChatGPT (GPT-4o)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-300 border border-orange-800/60 font-medium">
                  Claude 3.5 Sonnet
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-medium">
                  Google Gemini 1.5 Pro
                </span>
              </div>
            </div>
          )}

          {/* Syntax / Code / Prompt Display Box */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span>
                  content:{' '}
                  <strong className="text-white">
                    {codeLang === 'prompt' ? `prompt (${promptScope})` : codeLang}
                  </strong>
                </span>
              </div>
              <span>
                {currentDisplayedText.split('\n').length} lines &bull; {currentDisplayedText.length} characters
              </span>
            </div>

            <pre className="p-4 sm:p-6 overflow-auto font-mono text-sm text-indigo-100/95 leading-relaxed max-h-[480px] selection:bg-indigo-600 selection:text-white">
              <code>{currentDisplayedText}</code>
            </pre>
          </div>

          {/* Bottom Guidance & Usage Card */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 text-xs text-slate-300 flex items-start gap-3">
            <span className="text-base shrink-0">💡</span>
            <div className="leading-relaxed">
              {codeLang === 'prompt' ? (
                <>
                  <strong className="text-purple-300">How to use this AI Prompt:</strong> Copy and paste this prompt directly into{' '}
                  <strong className="text-white">ChatGPT, Claude, or Google Gemini</strong>. The prompt feeds the model with complete ForecastFlow domain context (Siddu Kirana data, Ridge ML tournament, FastAPI 3-tier architecture, and restocking formulas), directing the LLM to generate precise, production-ready PlantUML code.
                </>
              ) : codeLang === 'plantuml' ? (
                <>
                  <strong className="text-indigo-300">How to use PlantUML code:</strong> Paste into{' '}
                  <a
                    href="https://www.planttext.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline font-semibold hover:text-indigo-300"
                  >
                    PlantText.com
                  </a>
                  , or install the <em>PlantUML extension</em> in VS Code / IntelliJ IDEA. Export as high-resolution SVG or PNG for report documentation and slide decks.
                </>
              ) : (
                <>
                  <strong className="text-indigo-300">How to use Mermaid code:</strong> Embed directly in GitHub Markdown or Notion with{' '}
                  <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px]">
                    ```mermaid ... ```
                  </code>
                  , or visualize and export at{' '}
                  <a
                    href="https://mermaid.live"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline font-semibold hover:text-indigo-300"
                  >
                    mermaid.live
                  </a>
                  .
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Strip */}
      <div className="border-t border-slate-200 bg-white px-5 py-2.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span>
            {activeDiagram === 'object' && 'Real Object Diagram matching the sample project template with live ForecastFlow inventory instances.'}
            {activeDiagram === 'class' && 'Standard 3-compartment UML Class model with typed attributes, methods, and cardinalities.'}
            {activeDiagram === 'arch' && '3-Tier Cloud Architecture mapping client SPA, FastAPI gateway, and MongoDB database.'}
            {activeDiagram === 'usecase' && 'UML Use Case model mapping primary actors to core inventory & ML boundaries.'}
            {activeDiagram === 'activity' && 'UML Activity swimlane tracking sales deduction to automated restock PO issuance.'}
            {activeDiagram === 'sequence' && 'UML Sequence Diagram detailing asynchronous forecast generation and 1-click PO conversion.'}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0">
          CVR College CSE &bull; Report Sec 4.1–4.3
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. OBJECT DIAGRAM (EXACTLY MATCHING THE USER'S PROVIDED SAMPLE)
// -------------------------------------------------------------
function ObjectDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1020px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          UML Object Diagram &mdash; ForecastFlow System Instances
        </h3>
        <p className="text-xs text-slate-500">
          Modeled with real benchmark instances: Siddu Kirana, Aashirvaad Atta, and automated replenishment orders
        </p>
      </div>

      {/* SVG Canvas for Connectors & Labels */}
      <svg className="w-[960px] h-[580px] overflow-visible">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#1e293b" />
          </marker>
        </defs>

        {/* Lines from PurchaseOrder */}
        {/* PurchaseOrder (480, 70) -> Product (480, 220) */}
        <path d="M 480 120 L 480 200" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="445" y="150" width="70" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="480" y="164" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">orders</text>

        {/* PurchaseOrder (580, 70) -> Supplier (780, 200) */}
        <path d="M 590 85 L 750 180" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="640" y="115" width="85" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="682" y="129" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">placed with</text>

        {/* Lines from Product */}
        {/* Product (390, 260) -> Category (200, 360) */}
        <path d="M 400 280 L 250 360" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="290" y="305" width="85" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="332" y="319" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">belongs to</text>

        {/* Product (480, 310) -> StockMovement (480, 360) */}
        <path d="M 480 300 L 480 360" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="435" y="320" width="90" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="480" y="334" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">affected by</text>

        {/* Product (570, 280) -> Order (700, 360) */}
        <path d="M 560 280 L 680 360" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="590" y="305" width="85" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="632" y="319" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">included in</text>

        {/* StockMovement (480, 470) -> Inventory (320, 510) */}
        <path d="M 420 440 L 320 500" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="335" y="455" width="80" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="375" y="469" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">tracked in</text>

        {/* StockMovement (540, 440) -> ForecastModel (540, 500) */}
        <path d="M 520 440 L 520 500" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="485" y="455" width="70" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="520" y="469" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">trains</text>

        {/* Order (700, 460) -> Customer (820, 500) */}
        <path d="M 740 440 L 800 500" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="745" y="455" width="75" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="782" y="469" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">placed by</text>

        {/* Order (680, 440) -> Shipment (680, 500) */}
        <path d="M 680 440 L 680 500" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="640" y="455" width="80" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="680" y="469" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0f172a" fontWeight="bold">shipped via</text>

        {/* ----------------- HTML-LIKE SVG BOXES ----------------- */}

        {/* 1. PurchaseOrder Box (Top Center) */}
        <g transform="translate(370, 10)">
          <rect width="220" height="100" rx="4" fill="white" stroke="#1d4ed8" strokeWidth="2" />
          <rect width="220" height="30" rx="4" fill="#2563eb" />
          <text x="110" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">PurchaseOrder</text>
          <line x1="0" y1="30" x2="220" y2="30" stroke="#1d4ed8" strokeWidth="2" />
          <text x="10" y="48" fontSize="11" fill="#0f172a" fontFamily="monospace">PurchaseOrderID = "PO-0089"</text>
          <line x1="0" y1="54" x2="220" y2="54" stroke="#e2e8f0" />
          <text x="10" y="70" fontSize="11" fill="#0f172a" fontFamily="monospace">OrderDate = "2026-09-24"</text>
          <line x1="0" y1="76" x2="220" y2="76" stroke="#e2e8f0" />
          <text x="10" y="92" fontSize="11" fill="#0f172a" fontFamily="monospace">SupplierID = "SUP-001"</text>
        </g>

        {/* 2. Supplier Box (Top Right) */}
        <g transform="translate(730, 150)">
          <rect width="210" height="100" rx="4" fill="white" stroke="#1d4ed8" strokeWidth="2" />
          <rect width="210" height="30" rx="4" fill="#2563eb" />
          <text x="105" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">Supplier</text>
          <line x1="0" y1="30" x2="210" y2="30" stroke="#1d4ed8" strokeWidth="2" />
          <text x="10" y="48" fontSize="11" fill="#0f172a" fontFamily="monospace">SupplierID = "SUP-001"</text>
          <line x1="0" y1="54" x2="210" y2="54" stroke="#e2e8f0" />
          <text x="10" y="70" fontSize="11" fill="#0f172a" fontFamily="monospace">SupplierName = "Sri Balaji Mandi"</text>
          <line x1="0" y1="76" x2="210" y2="76" stroke="#e2e8f0" />
          <text x="10" y="92" fontSize="11" fill="#0f172a" fontFamily="monospace">LeadTime = "3 Days"</text>
        </g>

        {/* 3. Product Box (Middle Center) */}
        <g transform="translate(370, 200)">
          <rect width="220" height="105" rx="4" fill="white" stroke="#1d4ed8" strokeWidth="2" />
          <rect width="220" height="30" rx="4" fill="#2563eb" />
          <text x="110" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">Product</text>
          <line x1="0" y1="30" x2="220" y2="30" stroke="#1d4ed8" strokeWidth="2" />
          <text x="10" y="47" fontSize="11" fill="#0f172a" fontFamily="monospace">ProductID = "SKU-ATTA-01"</text>
          <line x1="0" y1="52" x2="220" y2="52" stroke="#e2e8f0" />
          <text x="10" y="66" fontSize="11" fill="#0f172a" fontFamily="monospace">Name = "Aashirvaad Atta 10kg"</text>
          <line x1="0" y1="71" x2="220" y2="71" stroke="#e2e8f0" />
          <text x="10" y="85" fontSize="11" fill="#0f172a" fontFamily="monospace">Price = ₹420.00 | Cost = ₹360</text>
          <line x1="0" y1="90" x2="220" y2="90" stroke="#e2e8f0" />
          <text x="10" y="102" fontSize="11" fill="#0f172a" fontFamily="monospace">CurrentStock = 6 (Critical)</text>
        </g>

        {/* 4. Category Box (Middle Left - Green) */}
        <g transform="translate(90, 340)">
          <rect width="210" height="85" rx="4" fill="white" stroke="#059669" strokeWidth="2" />
          <rect width="210" height="30" rx="4" fill="#059669" />
          <text x="105" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">Category</text>
          <line x1="0" y1="30" x2="210" y2="30" stroke="#059669" strokeWidth="2" />
          <text x="10" y="48" fontSize="11" fill="#0f172a" fontFamily="monospace">CategoryID = "CAT-GRAIN-01"</text>
          <line x1="0" y1="54" x2="210" y2="54" stroke="#e2e8f0" />
          <text x="10" y="70" fontSize="11" fill="#0f172a" fontFamily="monospace">Category = "Grains & Flours"</text>
        </g>

        {/* 5. StockMovement Box (Bottom Middle - Green) */}
        <g transform="translate(370, 360)">
          <rect width="220" height="85" rx="4" fill="white" stroke="#059669" strokeWidth="2" />
          <rect width="220" height="30" rx="4" fill="#059669" />
          <text x="110" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">StockMovement</text>
          <line x1="0" y1="30" x2="220" y2="30" stroke="#059669" strokeWidth="2" />
          <text x="10" y="48" fontSize="11" fill="#0f172a" fontFamily="monospace">MovementID = "SM-9042"</text>
          <line x1="0" y1="54" x2="220" y2="54" stroke="#e2e8f0" />
          <text x="10" y="68" fontSize="11" fill="#0f172a" fontFamily="monospace">Date = "2026-09-28"</text>
          <line x1="0" y1="72" x2="220" y2="72" stroke="#e2e8f0" />
          <text x="10" y="82" fontSize="10" fill="#dc2626" fontFamily="monospace">Quantity = -4 (Sale Deduction)</text>
        </g>

        {/* 6. Order (SalesOrder) Box (Bottom Right - Green) */}
        <g transform="translate(640, 360)">
          <rect width="210" height="85" rx="4" fill="white" stroke="#059669" strokeWidth="2" />
          <rect width="210" height="30" rx="4" fill="#059669" />
          <text x="105" y="20" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">Order (SalesOrder)</text>
          <line x1="0" y1="30" x2="210" y2="30" stroke="#059669" strokeWidth="2" />
          <text x="10" y="48" fontSize="11" fill="#0f172a" fontFamily="monospace">OrderID = "SO-2026-114"</text>
          <line x1="0" y1="54" x2="210" y2="54" stroke="#e2e8f0" />
          <text x="10" y="68" fontSize="11" fill="#0f172a" fontFamily="monospace">Total = ₹1,680.00</text>
          <line x1="0" y1="72" x2="210" y2="72" stroke="#e2e8f0" />
          <text x="10" y="82" fontSize="10" fill="#059669" fontFamily="monospace">Status = "Completed / Paid"</text>
        </g>

        {/* 7. Inventory Box (Lowest Left - Solid Green Header) */}
        <g transform="translate(200, 500)">
          <rect width="180" height="65" rx="4" fill="white" stroke="#059669" strokeWidth="2" />
          <rect width="180" height="26" rx="4" fill="#059669" />
          <text x="90" y="18" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Inventory</text>
          <line x1="0" y1="26" x2="180" y2="26" stroke="#059669" strokeWidth="2" />
          <text x="8" y="42" fontSize="10" fill="#0f172a" fontFamily="monospace">Warehouse = "Siddu Godown"</text>
          <text x="8" y="56" fontSize="10" fill="#0f172a" fontFamily="monospace">SafetyStock = 5 | Reorder = 10</text>
        </g>

        {/* 8. ForecastModel (Lowest Middle - Solid Indigo Header) */}
        <g transform="translate(420, 500)">
          <rect width="190" height="65" rx="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
          <rect width="190" height="26" rx="4" fill="#4f46e5" />
          <text x="95" y="18" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">ForecastModel</text>
          <line x1="0" y1="26" x2="190" y2="26" stroke="#4f46e5" strokeWidth="2" />
          <text x="8" y="42" fontSize="10" fill="#0f172a" fontFamily="monospace">Champion = "Ridge L2"</text>
          <text x="8" y="56" fontSize="10" fill="#0f172a" fontFamily="monospace">7-Day Demand = 28 units</text>
        </g>

        {/* 9. Shipment Box (Lowest Center-Right) */}
        <g transform="translate(630, 500)">
          <rect width="140" height="65" rx="4" fill="white" stroke="#2563eb" strokeWidth="2" />
          <rect width="140" height="26" rx="4" fill="#2563eb" />
          <text x="70" y="18" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Shipment</text>
          <line x1="0" y1="26" x2="140" y2="26" stroke="#2563eb" strokeWidth="2" />
          <text x="8" y="42" fontSize="10" fill="#0f172a" fontFamily="monospace">Carrier = "Local Tempo"</text>
          <text x="8" y="56" fontSize="10" fill="#0f172a" fontFamily="monospace">TransitDays = 1</text>
        </g>

        {/* 10. Customer Box (Lowest Far-Right) */}
        <g transform="translate(790, 500)">
          <rect width="150" height="65" rx="4" fill="white" stroke="#2563eb" strokeWidth="2" />
          <rect width="150" height="26" rx="4" fill="#2563eb" />
          <text x="75" y="18" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Customer</text>
          <line x1="0" y1="26" x2="150" y2="26" stroke="#2563eb" strokeWidth="2" />
          <text x="8" y="42" fontSize="10" fill="#0f172a" fontFamily="monospace">Name = "Walk-in Retail"</text>
          <text x="8" y="56" fontSize="10" fill="#0f172a" fontFamily="monospace">Type = "Neighbourhood"</text>
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 2. CLASS DIAGRAM (UML 2.5 THREE-COMPARTMENT SPECIFICATION)
// -------------------------------------------------------------
function ClassDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1080px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          UML Class Diagram &mdash; Domain Entity Model & Methods
        </h3>
        <p className="text-xs text-slate-500">
          Showing attributes, visibility (+ public), return types, operations, and relational cardinalities (1..*, 0..1)
        </p>
      </div>

      <svg className="w-[1020px] h-[640px] overflow-visible">
        <defs>
          <marker id="diamond" viewBox="0 0 16 16" refX="0" refY="8" markerWidth="10" markerHeight="10" orient="auto">
            <polygon points="0 8, 8 0, 16 8, 8 16" fill="#1e293b" />
          </marker>
          <marker id="arrow-class" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#1e293b" />
          </marker>
        </defs>

        {/* Association Lines with Multiplicities */}
        {/* Category -> Product */}
        <line x1="220" y1="120" x2="360" y2="120" stroke="#1e293b" strokeWidth="2" />
        <text x="235" y="112" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="340" y="112" fontSize="11" fontWeight="bold" fill="#475569">0..*</text>

        {/* Supplier -> Product */}
        <line x1="840" y1="120" x2="630" y2="120" stroke="#1e293b" strokeWidth="2" />
        <text x="825" y="112" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="645" y="112" fontSize="11" fontWeight="bold" fill="#475569">1..*</text>

        {/* Product -> StockMovement */}
        <line x1="490" y1="230" x2="490" y2="310" stroke="#1e293b" strokeWidth="2" />
        <text x="475" y="245" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="475" y="300" fontSize="11" fontWeight="bold" fill="#475569">0..*</text>

        {/* Product -> Forecast */}
        <line x1="400" y1="230" x2="250" y2="310" stroke="#1e293b" strokeWidth="2" />
        <text x="380" y="245" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="265" y="300" fontSize="11" fontWeight="bold" fill="#475569">1</text>

        {/* Forecast -> Recommendation */}
        <line x1="190" y1="460" x2="190" y2="500" stroke="#1e293b" strokeWidth="2" />
        <text x="175" y="475" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="175" y="495" fontSize="11" fontWeight="bold" fill="#475569">0..*</text>

        {/* Product -> SaleItem / Sale */}
        <line x1="580" y1="230" x2="720" y2="310" stroke="#1e293b" strokeWidth="2" />
        <text x="590" y="250" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="700" y="300" fontSize="11" fontWeight="bold" fill="#475569">1..*</text>

        {/* Supplier -> PurchaseOrder */}
        <line x1="910" y1="200" x2="910" y2="310" stroke="#1e293b" strokeWidth="2" />
        <text x="895" y="220" fontSize="11" fontWeight="bold" fill="#475569">1</text>
        <text x="895" y="300" fontSize="11" fontWeight="bold" fill="#475569">0..*</text>

        {/* Recommendation -> PurchaseOrder (Dashed Dependency) */}
        <path d="M 300 560 L 800 560 L 800 460" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow-class)" />
        <rect x="510" y="550" width="130" height="20" rx="4" fill="white" stroke="#e2e8f0" />
        <text x="575" y="564" textAnchor="middle" fontSize="10" fontStyle="italic" fill="#4f46e5" fontWeight="bold">&laquo;converts to PO&raquo;</text>

        {/* ---------------- 3-COMPARTMENT CLASS BOXES ---------------- */}

        {/* 1. Category Class */}
        <g transform="translate(40, 40)">
          <rect width="180" height="150" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
          <rect width="180" height="28" rx="4" fill="#f8fafc" />
          <text x="90" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0f172a">Category</text>
          <line x1="0" y1="28" x2="180" y2="28" stroke="#334155" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ name: str</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ description: str</text>
          <line x1="0" y1="84" x2="180" y2="84" stroke="#cbd5e1" />
          <text x="8" y="100" fontSize="10" fill="#047857" fontFamily="monospace">+ get_products(): List</text>
          <text x="8" y="114" fontSize="10" fill="#047857" fontFamily="monospace">+ count_skus(): int</text>
        </g>

        {/* 2. Product Class (Core Entity) */}
        <g transform="translate(360, 20)">
          <rect width="270" height="210" rx="4" fill="white" stroke="#2563eb" strokeWidth="2" />
          <rect width="270" height="28" rx="4" fill="#dbeafe" />
          <text x="135" y="19" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#1e3a8a">Product</text>
          <line x1="0" y1="28" x2="270" y2="28" stroke="#2563eb" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ sku: str</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ name: str</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ category_id: ObjectId</text>
          <text x="8" y="100" fontSize="10" fill="#334155" fontFamily="monospace">+ supplier_id: ObjectId</text>
          <text x="8" y="114" fontSize="10" fill="#334155" fontFamily="monospace">+ unit_cost: float</text>
          <text x="8" y="128" fontSize="10" fill="#334155" fontFamily="monospace">+ selling_price: float</text>
          <text x="8" y="142" fontSize="10" fill="#334155" fontFamily="monospace">+ current_stock: int</text>
          <text x="8" y="156" fontSize="10" fill="#334155" fontFamily="monospace">+ reorder_point: int</text>
          <text x="8" y="170" fontSize="10" fill="#334155" fontFamily="monospace">+ safety_stock: int</text>
          <line x1="0" y1="178" x2="270" y2="178" stroke="#cbd5e1" />
          <text x="8" y="192" fontSize="10" fill="#1d4ed8" fontFamily="monospace">+ adjust_stock(delta: int)</text>
          <text x="8" y="204" fontSize="10" fill="#1d4ed8" fontFamily="monospace">+ is_low_stock(): bool</text>
        </g>

        {/* 3. Supplier Class */}
        <g transform="translate(840, 40)">
          <rect width="160" height="160" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
          <rect width="160" height="28" rx="4" fill="#f8fafc" />
          <text x="80" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0f172a">Supplier</text>
          <line x1="0" y1="28" x2="160" y2="28" stroke="#334155" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ name: str</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ email: str</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ phone: str</text>
          <text x="8" y="100" fontSize="10" fill="#334155" fontFamily="monospace">+ lead_time_days: int</text>
          <line x1="0" y1="110" x2="160" y2="110" stroke="#cbd5e1" />
          <text x="8" y="126" fontSize="10" fill="#047857" fontFamily="monospace">+ create_po(): PO</text>
          <text x="8" y="140" fontSize="10" fill="#047857" fontFamily="monospace">+ get_active_orders()</text>
        </g>

        {/* 4. Forecast Class */}
        <g transform="translate(80, 310)">
          <rect width="220" height="150" rx="4" fill="white" stroke="#7c3aed" strokeWidth="2" />
          <rect width="220" height="28" rx="4" fill="#ede9fe" />
          <text x="110" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#5b21b6">Forecast</text>
          <line x1="0" y1="28" x2="220" y2="28" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ product_id: ObjectId</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ champion_model: str</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ metrics: Dict[str, float]</text>
          <text x="8" y="100" fontSize="10" fill="#334155" fontFamily="monospace">+ predictions: List[float]</text>
          <line x1="0" y1="110" x2="220" y2="110" stroke="#cbd5e1" />
          <text x="8" y="126" fontSize="10" fill="#6d28d9" fontFamily="monospace">+ get_demand(days: int)</text>
          <text x="8" y="140" fontSize="10" fill="#6d28d9" fontFamily="monospace">+ is_cache_valid(): bool</text>
        </g>

        {/* 5. StockMovement Class */}
        <g transform="translate(380, 310)">
          <rect width="220" height="160" rx="4" fill="white" stroke="#059669" strokeWidth="2" />
          <rect width="220" height="28" rx="4" fill="#d1fae5" />
          <text x="110" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#065f46">StockMovement</text>
          <line x1="0" y1="28" x2="220" y2="28" stroke="#059669" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ product_id: ObjectId</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ movement_type: enum</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ quantity: int</text>
          <text x="8" y="100" fontSize="10" fill="#334155" fontFamily="monospace">+ previous_stock: int</text>
          <text x="8" y="114" fontSize="10" fill="#334155" fontFamily="monospace">+ new_stock: int</text>
          <line x1="0" y1="122" x2="220" y2="122" stroke="#cbd5e1" />
          <text x="8" y="138" fontSize="10" fill="#047857" fontFamily="monospace">+ log_audit_entry()</text>
          <text x="8" y="152" fontSize="10" fill="#047857" fontFamily="monospace">+ validate_non_negative()</text>
        </g>

        {/* 6. Sale (Order) Class */}
        <g transform="translate(680, 310)">
          <rect width="180" height="150" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
          <rect width="180" height="28" rx="4" fill="#f8fafc" />
          <text x="90" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0f172a">Sale (Order)</text>
          <line x1="0" y1="28" x2="180" y2="28" stroke="#334155" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ sale_number: str</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ items: List[SaleItem]</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ total_amount: float</text>
          <line x1="0" y1="98" x2="180" y2="98" stroke="#cbd5e1" />
          <text x="8" y="114" fontSize="10" fill="#047857" fontFamily="monospace">+ deduct_atomic()</text>
          <text x="8" y="128" fontSize="10" fill="#047857" fontFamily="monospace">+ print_invoice()</text>
        </g>

        {/* 7. PurchaseOrder Class */}
        <g transform="translate(880, 310)">
          <rect width="180" height="150" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
          <rect width="180" height="28" rx="4" fill="#f8fafc" />
          <text x="90" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0f172a">PurchaseOrder</text>
          <line x1="0" y1="28" x2="180" y2="28" stroke="#334155" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ _id: PyObjectId</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ po_number: str</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ supplier_id: ObjectId</text>
          <text x="8" y="86" fontSize="10" fill="#334155" fontFamily="monospace">+ status: enum</text>
          <line x1="0" y1="98" x2="180" y2="98" stroke="#cbd5e1" />
          <text x="8" y="114" fontSize="10" fill="#047857" fontFamily="monospace">+ receive_and_restock()</text>
          <text x="8" y="128" fontSize="10" fill="#047857" fontFamily="monospace">+ mark_delivered()</text>
        </g>

        {/* 8. RestockRecommendation Class */}
        <g transform="translate(80, 500)">
          <rect width="220" height="120" rx="4" fill="white" stroke="#dc2626" strokeWidth="2" />
          <rect width="220" height="28" rx="4" fill="#fee2e2" />
          <text x="110" y="19" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#991b1b">Recommendation</text>
          <line x1="0" y1="28" x2="220" y2="28" stroke="#dc2626" strokeWidth="1.5" />
          <text x="8" y="44" fontSize="10" fill="#334155" fontFamily="monospace">+ recommended_qty: int</text>
          <text x="8" y="58" fontSize="10" fill="#334155" fontFamily="monospace">+ urgency: enum (Critical)</text>
          <text x="8" y="72" fontSize="10" fill="#334155" fontFamily="monospace">+ is_converted: bool</text>
          <line x1="0" y1="80" x2="220" y2="80" stroke="#cbd5e1" />
          <text x="8" y="96" fontSize="10" fill="#b91c1c" fontFamily="monospace">+ convert_to_po(): PO</text>
          <text x="8" y="110" fontSize="10" fill="#b91c1c" fontFamily="monospace">+ compute_urgency()</text>
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 3. SYSTEM ARCHITECTURE DIAGRAM (3-TIER CLOUD GRAPH)
// -------------------------------------------------------------
function ArchitectureDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1040px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          Proposed 3-Tier Cloud System Architecture
        </h3>
        <p className="text-xs text-slate-500">
          Client Presentation Tier &bull; FastAPI REST Gateway Tier &bull; Business Logic & ML Tier &bull; MongoDB Ledger
        </p>
      </div>

      <svg className="w-[980px] h-[580px] overflow-visible">
        <defs>
          <marker id="net-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* TIER 1: CLIENT PRESENTATION */}
        <g transform="translate(40, 20)">
          <rect width="200" height="520" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" />
          <rect width="200" height="34" rx="8" fill="#0284c7" />
          <text x="100" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Tier 1: Client Browser</text>

          {/* Sub components */}
          <g transform="translate(15, 60)">
            <rect width="170" height="75" rx="6" fill="white" stroke="#0284c7" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">React 18 SPA</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Vite 5 Bundler</text>
            <text x="10" y="58" fontSize="10" fill="#64748b">Context API State</text>
          </g>

          <g transform="translate(15, 160)">
            <rect width="170" height="75" rx="6" fill="white" stroke="#0284c7" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Tailwind CSS 3.4</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Mobile Bottom Nav</text>
            <text x="10" y="58" fontSize="10" fill="#64748b">Responsive Drawer</text>
          </g>

          <g transform="translate(15, 260)">
            <rect width="170" height="75" rx="6" fill="white" stroke="#0284c7" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Recharts 3.10</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Time-Series Charts</text>
            <text x="10" y="58" fontSize="10" fill="#64748b">Interactive SVG</text>
          </g>

          <g transform="translate(15, 360)">
            <rect width="170" height="75" rx="6" fill="white" stroke="#0284c7" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">API Client Wrapper</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Bearer Token Injection</text>
            <text x="10" y="58" fontSize="10" fill="#64748b">Fetch with Auto-Logout</text>
          </g>
        </g>

        {/* NET CONNECTOR 1 -> 2 */}
        <path d="M 240 260 L 320 260" stroke="#2563eb" strokeWidth="3" markerEnd="url(#net-arrow)" />
        <rect x="245" y="235" width="70" height="18" rx="4" fill="#e0e7ff" />
        <text x="280" y="248" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3730a3">HTTPS / JWT</text>

        {/* TIER 2: API GATEWAY */}
        <g transform="translate(320, 20)">
          <rect width="200" height="520" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" />
          <rect width="200" height="34" rx="8" fill="#4f46e5" />
          <text x="100" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Tier 2: FastAPI Gateway</text>

          <g transform="translate(15, 60)">
            <rect width="170" height="85" rx="6" fill="white" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Uvicorn ASGI</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Python 3.12 Runtime</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Non-Blocking Coroutines</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">CORS Middleware</text>
          </g>

          <g transform="translate(15, 170)">
            <rect width="170" height="85" rx="6" fill="white" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Security Layer</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">HS256 Bearer Tokens</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Bcrypt (12 Rounds)</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">Role-Based Access</text>
          </g>

          <g transform="translate(15, 280)">
            <rect width="170" height="85" rx="6" fill="white" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Pydantic v2 Models</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Strict Type Coercion</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Request Validation</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">Auto OpenAPI Docs</text>
          </g>

          <g transform="translate(15, 390)">
            <rect width="170" height="85" rx="6" fill="white" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">REST API Routers</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">/products, /inventory</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">/sales, /purchases</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">/forecasting, /restock</text>
          </g>
        </g>

        {/* NET CONNECTOR 2 -> 3 */}
        <path d="M 520 260 L 600 260" stroke="#2563eb" strokeWidth="3" markerEnd="url(#net-arrow)" />
        <rect x="525" y="235" width="70" height="18" rx="4" fill="#e0e7ff" />
        <text x="560" y="248" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3730a3">Service Call</text>

        {/* TIER 3: LOGIC & ML PIPELINE */}
        <g transform="translate(600, 20)">
          <rect width="200" height="520" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" />
          <rect width="200" height="34" rx="8" fill="#d97706" />
          <text x="100" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Tier 3: Logic & ML Engine</text>

          <g transform="translate(15, 60)">
            <rect width="170" height="95" rx="6" fill="white" stroke="#d97706" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Business Services</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Atomic Inventory Ledger</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Sales Order Checkout</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">PO Receiving Replenish</text>
            <text x="10" y="84" fontSize="10" fill="#64748b">Lead Time Verification</text>
          </g>

          <g transform="translate(15, 180)">
            <rect width="170" height="110" rx="6" fill="white" stroke="#d97706" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">ML Forecasting Engine</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Missing Date Imputer</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Rolling & Lag Features</text>
            <text x="10" y="70" fontSize="10" fill="#b45309" fontWeight="bold">Ridge L2 + SES + MA</text>
            <text x="10" y="84" fontSize="10" fill="#64748b">Holdout MAE Selection</text>
            <text x="10" y="98" fontSize="10" fill="#64748b">Champion Promotion</text>
          </g>

          <g transform="translate(15, 310)">
            <rect width="170" height="95" rx="6" fill="white" stroke="#d97706" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Restock Optimizer</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Demand + Safety Stock</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Minus On-Hand & POs</text>
            <text x="10" y="70" fontSize="10" fill="#64748b">Urgency Classification</text>
            <text x="10" y="84" fontSize="10" fill="#64748b">1-Click PO Conversion</text>
          </g>

          <g transform="translate(15, 425)">
            <rect width="170" height="75" rx="6" fill="white" stroke="#d97706" strokeWidth="1.5" />
            <text x="85" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">Capital Intelligence</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">Dead-Stock Detection</text>
            <text x="10" y="56" fontSize="10" fill="#64748b">Locked Rupees Audit</text>
          </g>
        </g>

        {/* NET CONNECTOR 3 -> 4 */}
        <path d="M 800 260 L 870 260" stroke="#2563eb" strokeWidth="3" markerEnd="url(#net-arrow)" />
        <rect x="805" y="235" width="60" height="18" rx="4" fill="#e0e7ff" />
        <text x="835" y="248" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3730a3">Motor Async</text>

        {/* TIER 4: DATABASE & STORAGE */}
        <g transform="translate(870, 20)">
          <rect width="170" height="520" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" />
          <rect width="170" height="34" rx="8" fill="#059669" />
          <text x="85" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Tier 4: MongoDB Atlas</text>

          <g transform="translate(12, 60)">
            <rect width="146" height="55" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">users</text>
            <text x="10" y="42" fontSize="10" fill="#64748b">JWT credentials</text>
          </g>

          <g transform="translate(12, 130)">
            <rect width="146" height="65" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">products</text>
            <text x="10" y="40" fontSize="10" fill="#64748b">SKU, stock, safety</text>
            <text x="10" y="54" fontSize="10" fill="#64748b">Compound indexes</text>
          </g>

          <g transform="translate(12, 210)">
            <rect width="146" height="65" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">stock_movements</text>
            <text x="10" y="40" fontSize="10" fill="#64748b">Immutable audit log</text>
            <text x="10" y="54" fontSize="10" fill="#64748b">Atomic transactions</text>
          </g>

          <g transform="translate(12, 290)">
            <rect width="146" height="65" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">sales & purchases</text>
            <text x="10" y="40" fontSize="10" fill="#64748b">Orders & supplier POs</text>
            <text x="10" y="54" fontSize="10" fill="#64748b">Status transitions</text>
          </g>

          <g transform="translate(12, 370)">
            <rect width="146" height="65" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">forecasts</text>
            <text x="10" y="40" fontSize="10" fill="#64748b">Champion metrics</text>
            <text x="10" y="54" fontSize="10" fill="#64748b">TTL Cached Projections</text>
          </g>

          <g transform="translate(12, 450)">
            <rect width="146" height="50" rx="6" fill="white" stroke="#059669" strokeWidth="1.5" />
            <text x="73" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0f172a">recommendations</text>
            <text x="10" y="40" fontSize="10" fill="#64748b">Restock PO alerts</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 4. USE CASE DIAGRAM (ACTORS & SYSTEM BOUNDARY)
// -------------------------------------------------------------
function UseCaseDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1040px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          UML Use Case Diagram &mdash; Actors & Operational Interactions
        </h3>
        <p className="text-xs text-slate-500">
          Showing Primary Actors (Store Owner, Cashier) and Secondary Actors (Supplier, ML Cron) mapped to System Boundaries
        </p>
      </div>

      <svg className="w-[980px] h-[600px] overflow-visible">
        {/* System Boundary Box */}
        <rect x="220" y="20" width="540" height="560" rx="12" fill="#fafafa" stroke="#475569" strokeWidth="2" strokeDasharray="8,4" />
        <text x="490" y="46" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#1e293b" letterSpacing="1">
          FORECASTFLOW SYSTEM BOUNDARY
        </text>

        {/* Lines from Store Owner (Left Top: 110, 160) */}
        <line x1="110" y1="160" x2="350" y2="80" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="160" x2="350" y2="140" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="160" x2="350" y2="200" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="160" x2="350" y2="260" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="160" x2="350" y2="380" stroke="#334155" strokeWidth="1.5" />

        {/* Lines from Cashier (Left Bottom: 110, 440) */}
        <line x1="110" y1="440" x2="350" y2="80" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="440" x2="350" y2="320" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="440" x2="350" y2="440" stroke="#334155" strokeWidth="1.5" />
        <line x1="110" y1="440" x2="350" y2="500" stroke="#334155" strokeWidth="1.5" />

        {/* Lines to ML Background Cron (Right Top: 870, 180) */}
        <line x1="630" y1="140" x2="870" y2="180" stroke="#334155" strokeWidth="1.5" />
        <line x1="630" y1="200" x2="870" y2="180" stroke="#334155" strokeWidth="1.5" />
        <line x1="630" y1="260" x2="870" y2="180" stroke="#334155" strokeWidth="1.5" />

        {/* Lines to Wholesale Supplier (Right Bottom: 870, 440) */}
        <line x1="630" y1="380" x2="870" y2="440" stroke="#334155" strokeWidth="1.5" />
        <line x1="630" y1="500" x2="870" y2="440" stroke="#334155" strokeWidth="1.5" />

        {/* <<include>> between UC3 (POS Sale) and UC4 (Stock Decrement) */}
        <path d="M 490 340 L 490 420" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4,4" />
        <text x="500" y="380" fontSize="9" fontStyle="italic" fill="#4f46e5">&laquo;include&raquo;</text>

        {/* <<include>> between UC6 (Restock) and UC7 (1-Click PO) */}
        <path d="M 630 380 L 630 280" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4,4" />
        <text x="640" y="330" fontSize="9" fontStyle="italic" fill="#4f46e5">&laquo;extend&raquo;</text>

        {/* ----------------- USE CASE OVALS ----------------- */}
        {/* UC 1 */}
        <g transform="translate(350, 60)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#2563eb" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">UC-01: User Login & JWT Auth</text>
        </g>

        {/* UC 2 */}
        <g transform="translate(350, 120)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#2563eb" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">UC-02: Manage Catalog & Thresholds</text>
        </g>

        {/* UC 3 */}
        <g transform="translate(350, 180)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5b21b6">UC-03: Execute ML Forecast Tournament</text>
        </g>

        {/* UC 4 */}
        <g transform="translate(350, 240)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5b21b6">UC-04: View Dead Stock & Runway Risk</text>
        </g>

        {/* UC 5 */}
        <g transform="translate(350, 300)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#059669" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">UC-05: Record POS Counter Sale</text>
        </g>

        {/* UC 6 */}
        <g transform="translate(350, 360)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#dc2626" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#991b1b">UC-06: 1-Click Convert Restock to PO</text>
        </g>

        {/* UC 7 */}
        <g transform="translate(350, 420)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#059669" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">UC-07: Atomic Stock Decrement Ledger</text>
        </g>

        {/* UC 8 */}
        <g transform="translate(350, 480)">
          <ellipse cx="140" cy="20" rx="120" ry="20" fill="white" stroke="#059669" strokeWidth="1.5" />
          <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">UC-08: Inbound Receiving & Restock</text>
        </g>

        {/* ----------------- STICK FIGURE ACTORS ----------------- */}
        {/* Actor 1: Store Owner (Left Top) */}
        <g transform="translate(70, 110)">
          <circle cx="40" cy="20" r="14" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="40" y1="34" x2="40" y2="70" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="20" y1="48" x2="60" y2="48" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="40" y1="70" x2="25" y2="100" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="40" y1="70" x2="55" y2="100" stroke="#1d4ed8" strokeWidth="2" />
          <text x="40" y="118" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e3a8a">Store Owner</text>
          <text x="40" y="130" textAnchor="middle" fontSize="9" fill="#64748b">(Admin)</text>
        </g>

        {/* Actor 2: Cashier / Clerk (Left Bottom) */}
        <g transform="translate(70, 390)">
          <circle cx="40" cy="20" r="14" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
          <line x1="40" y1="34" x2="40" y2="70" stroke="#059669" strokeWidth="2" />
          <line x1="20" y1="48" x2="60" y2="48" stroke="#059669" strokeWidth="2" />
          <line x1="40" y1="70" x2="25" y2="100" stroke="#059669" strokeWidth="2" />
          <line x1="40" y1="70" x2="55" y2="100" stroke="#059669" strokeWidth="2" />
          <text x="40" y="118" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">Store Clerk</text>
          <text x="40" y="130" textAnchor="middle" fontSize="9" fill="#64748b">(POS Cashier)</text>
        </g>

        {/* Actor 3: ML Engine Scheduler (Right Top) */}
        <g transform="translate(830, 130)">
          <rect x="25" y="6" width="30" height="28" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <line x1="40" y1="34" x2="40" y2="70" stroke="#7c3aed" strokeWidth="2" />
          <line x1="20" y1="48" x2="60" y2="48" stroke="#7c3aed" strokeWidth="2" />
          <line x1="40" y1="70" x2="25" y2="100" stroke="#7c3aed" strokeWidth="2" />
          <line x1="40" y1="70" x2="55" y2="100" stroke="#7c3aed" strokeWidth="2" />
          <text x="40" y="118" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5b21b6">ML Cron Engine</text>
          <text x="40" y="130" textAnchor="middle" fontSize="9" fill="#64748b">(Background Worker)</text>
        </g>

        {/* Actor 4: Wholesale Supplier (Right Bottom) */}
        <g transform="translate(830, 390)">
          <circle cx="40" cy="20" r="14" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
          <line x1="40" y1="34" x2="40" y2="70" stroke="#d97706" strokeWidth="2" />
          <line x1="20" y1="48" x2="60" y2="48" stroke="#d97706" strokeWidth="2" />
          <line x1="40" y1="70" x2="25" y2="100" stroke="#d97706" strokeWidth="2" />
          <line x1="40" y1="70" x2="55" y2="100" stroke="#d97706" strokeWidth="2" />
          <text x="40" y="118" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">Wholesale Vendor</text>
          <text x="40" y="130" textAnchor="middle" fontSize="9" fill="#64748b">(Distributor)</text>
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 5. ACTIVITY DIAGRAM (SWIMLANES & DECISION DIAMONDS)
// -------------------------------------------------------------
function ActivityDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1040px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          UML Activity Diagram &mdash; End-to-End Inventory & Reorder Lifecycle
        </h3>
        <p className="text-xs text-slate-500">
          Tracking cashier point-of-sale checkout, atomic stock updates, threshold logic, and automated PO fulfillment
        </p>
      </div>

      <svg className="w-[980px] h-[580px] overflow-visible">
        <defs>
          <marker id="act-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#1e293b" />
          </marker>
        </defs>

        {/* 3 Swimlane Columns */}
        {/* Lane 1: Store Cashier (POS) */}
        <rect x="40" y="20" width="300" height="540" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="40" y="20" width="300" height="30" fill="#0284c7" />
        <text x="190" y="40" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Store Cashier / POS</text>

        {/* Lane 2: ForecastFlow Core & ML */}
        <rect x="340" y="20" width="340" height="540" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="340" y="20" width="340" height="30" fill="#4f46e5" />
        <text x="510" y="40" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">ForecastFlow Engine & Logic</text>

        {/* Lane 3: Supplier / Store Owner */}
        <rect x="680" y="20" width="260" height="540" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="680" y="20" width="260" height="30" fill="#059669" />
        <text x="810" y="40" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Store Owner & Supplier</text>

        {/* ---------------- FLOW NODES & CONNECTORS ---------------- */}

        {/* Initial Node (Start) */}
        <circle cx="190" cy="80" r="10" fill="#0f172a" />
        <line x1="190" y1="90" x2="190" y2="120" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Action 1: Cashier scans item */}
        <rect x="100" y="120" width="180" height="40" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <text x="190" y="145" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0369a1">Scan Customer SKUs</text>
        <line x1="190" y1="160" x2="190" y2="200" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Decision 1: Sufficient Stock? */}
        <polygon points="190,200 240,225 190,250 140,225" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="190" y="229" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#854d0e">Stock &gt; 0?</text>

        {/* Decision Branch: No -> Alert */}
        <line x1="140" y1="225" x2="70" y2="225" stroke="#dc2626" strokeWidth="2" />
        <line x1="70" y1="225" x2="70" y2="140" stroke="#dc2626" strokeWidth="2" />
        <line x1="70" y1="140" x2="100" y2="140" stroke="#dc2626" strokeWidth="2" markerEnd="url(#act-arrow)" />
        <text x="85" y="215" fontSize="9" fontWeight="bold" fill="#dc2626">[No: Alert]</text>

        {/* Decision Branch: Yes -> Go to System Lane */}
        <line x1="240" y1="225" x2="380" y2="225" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />
        <text x="270" y="215" fontSize="9" fontWeight="bold" fill="#15803d">[Yes: Checkout]</text>

        {/* Action 2: Atomic Stock Decrement */}
        <rect x="380" y="205" width="220" height="40" rx="8" fill="#ede9fe" stroke="#4f46e5" strokeWidth="1.5" />
        <text x="490" y="230" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4338ca">Atomic Stock Decrement ($inc)</text>
        <line x1="490" y1="245" x2="490" y2="280" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Decision 2: Stock <= Reorder Point? */}
        <polygon points="490,280 550,305 490,330 430,305" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="490" y="309" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#854d0e">Stock &le; Reorder?</text>

        {/* Decision Branch: No -> Print Bill & Finish */}
        <line x1="430" y1="305" x2="250" y2="305" stroke="#1e293b" strokeWidth="2" />
        <line x1="250" y1="305" x2="250" y2="400" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />
        <text x="310" y="295" fontSize="9" fontWeight="bold" fill="#64748b">[No: Safe Level]</text>

        {/* Decision Branch: Yes -> Trigger Forecast & Formula */}
        <line x1="550" y1="305" x2="610" y2="305" stroke="#dc2626" strokeWidth="2" />
        <line x1="610" y1="305" x2="610" y2="360" stroke="#dc2626" strokeWidth="2" markerEnd="url(#act-arrow)" />
        <text x="560" y="295" fontSize="9" fontWeight="bold" fill="#dc2626">[Yes: Trigger]</text>

        {/* Action 3: ML Forecast & Restock Formula */}
        <rect x="420" y="360" width="230" height="45" rx="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
        <text x="535" y="380" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#991b1b">Retrieve ML Forecast &</text>
        <text x="535" y="395" textAnchor="middle" fontSize="10" fill="#991b1b">Compute Reorder Formula</text>
        <line x1="650" y1="382" x2="730" y2="382" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Action 4: Store Owner 1-Click PO Approval */}
        <rect x="730" y="360" width="180" height="45" rx="8" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
        <text x="820" y="380" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">Owner Clicks "1-Click PO"</text>
        <text x="820" y="395" textAnchor="middle" fontSize="9" fill="#065f46">Dispatches PO to Vendor</text>
        <line x1="820" y1="405" x2="820" y2="450" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Action 5: Vendor Delivery & Goods Receipt */}
        <rect x="730" y="450" width="180" height="45" rx="8" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
        <text x="820" y="470" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">Supplier Delivers Stock</text>
        <text x="820" y="485" textAnchor="middle" fontSize="9" fill="#065f46">Click "Receive" (+Stock)</text>

        {/* Action 6: Cashier Bill Print */}
        <rect x="160" y="400" width="180" height="40" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <text x="250" y="425" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0369a1">Print Customer Bill</text>

        {/* Synchronization Bar (Fork / Join) */}
        <line x1="250" y1="440" x2="250" y2="520" stroke="#1e293b" strokeWidth="2" />
        <line x1="820" y1="495" x2="820" y2="520" stroke="#1e293b" strokeWidth="2" />
        <rect x="220" y="520" width="630" height="6" rx="2" fill="#0f172a" />
        <line x1="535" y1="526" x2="535" y2="550" stroke="#1e293b" strokeWidth="2" markerEnd="url(#act-arrow)" />

        {/* Final State (Bullseye) */}
        <circle cx="535" cy="558" r="10" fill="white" stroke="#0f172a" strokeWidth="2" />
        <circle cx="535" cy="558" r="6" fill="#0f172a" />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 6. SEQUENCE DIAGRAM (CHRONOLOGICAL MESSAGE FLOW)
// -------------------------------------------------------------
function SequenceDiagramCanvas() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 w-[1040px] relative">
      <div className="text-center pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
          UML Sequence Diagram &mdash; ML Forecast & 1-Click PO Execution Trace
        </h3>
        <p className="text-xs text-slate-500">
          Time-ordered asynchronous message trace across Store Owner, React UI, FastAPI Gateway, ML Pipeline, and MongoDB
        </p>
      </div>

      <svg className="w-[980px] h-[580px] overflow-visible">
        <defs>
          <marker id="seq-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#1e293b" />
          </marker>
          <marker id="dash-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
          </marker>
        </defs>

        {/* Lifeline Headers */}
        {/* 1. Store Owner */}
        <g transform="translate(40, 20)">
          <rect width="120" height="35" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
          <text x="60" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#0369a1">:StoreOwner</text>
          <line x1="60" y1="35" x2="60" y2="540" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        </g>

        {/* 2. Frontend React SPA */}
        <g transform="translate(220, 20)">
          <rect width="130" height="35" rx="6" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
          <text x="65" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#3730a3">:FrontendUI</text>
          <line x1="65" y1="35" x2="65" y2="540" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        </g>

        {/* 3. FastAPI Gateway */}
        <g transform="translate(410, 20)">
          <rect width="140" height="35" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <text x="70" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#5b21b6">:FastAPIGateway</text>
          <line x1="70" y1="35" x2="70" y2="540" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        </g>

        {/* 4. ML Forecaster */}
        <g transform="translate(610, 20)">
          <rect width="140" height="35" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
          <text x="70" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#92400e">:MLForecaster</text>
          <line x1="70" y1="35" x2="70" y2="540" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        </g>

        {/* 5. MongoDB Atlas */}
        <g transform="translate(810, 20)">
          <rect width="130" height="35" rx="6" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
          <text x="65" y="22" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#065f46">:MongoDBAtlas</text>
          <line x1="65" y1="35" x2="65" y2="540" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        </g>

        {/* ACTIVATION BOXES & MESSAGE CALLS */}

        {/* Message 1: Owner clicks "Generate Forecast" */}
        <line x1="100" y1="80" x2="285" y2="80" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="190" y="74" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">1. Click "Run Forecast"</text>

        {/* Message 2: Frontend sends POST /forecasting/generate */}
        <line x1="285" y1="110" x2="480" y2="110" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="382" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">2. POST /forecasting/generate</text>

        {/* Activation Box on FastAPI */}
        <rect x="475" y="110" width="10" height="280" fill="#ddd6fe" stroke="#7c3aed" />

        {/* Message 3: Query sales history from MongoDB */}
        <line x1="485" y1="135" x2="875" y2="135" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="680" y="129" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">3. find(&#123;product_id, date: &#123;$gte: 35d&#125;&#125;)</text>

        {/* Message 4: Return 35-day historical records */}
        <line x1="875" y1="165" x2="485" y2="165" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#dash-arrow)" />
        <text x="680" y="159" textAnchor="middle" fontSize="10" fill="#64748b">4. Return sales & stock series</text>

        {/* Message 5: Trigger ML Ensemble Training */}
        <line x1="485" y1="195" x2="680" y2="195" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="582" y="189" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">5. train_and_evaluate_holdout()</text>

        {/* Activation on ML Forecaster */}
        <rect x="675" y="195" width="10" height="90" fill="#fef08a" stroke="#d97706" />

        {/* Self Call on ML: Ridge L2 vs SES vs MA tournament */}
        <path d="M 685 215 L 725 215 L 725 240 L 685 240" stroke="#d97706" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="735" y="230" fontSize="9" fontStyle="italic" fill="#b45309">Champion = Ridge (MAE 1.14)</text>

        {/* Message 6: Return Champion Forecast & Predictions */}
        <line x1="675" y1="285" x2="485" y2="285" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#dash-arrow)" />
        <text x="580" y="279" textAnchor="middle" fontSize="10" fill="#64748b">6. Return 7-day projection array</text>

        {/* Message 7: Cache forecast to MongoDB */}
        <line x1="485" y1="315" x2="875" y2="315" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="680" y="309" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">7. upsert_forecast_cache()</text>

        {/* Message 8: Calculate Restock Formula: max(0, ceil(Fcast + Safety - Stock)) */}
        <path d="M 485 340 L 525 340 L 525 365 L 485 365" stroke="#7c3aed" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="535" y="356" fontSize="9" fontStyle="italic" fill="#5b21b6">Formula: Need 25 units (Critical)</text>

        {/* Message 9: Return JSON Recommendation to UI */}
        <line x1="475" y1="390" x2="285" y2="390" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#dash-arrow)" />
        <text x="380" y="384" textAnchor="middle" fontSize="10" fill="#64748b">9. Display Restock Alert (Urgency: Critical)</text>

        {/* Message 10: Store Owner approves 1-Click PO */}
        <line x1="100" y1="430" x2="285" y2="430" stroke="#dc2626" strokeWidth="2" markerEnd="url(#seq-arrow)" />
        <text x="190" y="424" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">10. Click "1-Click Convert to PO"</text>

        {/* Message 11: POST /recommendations/{id}/convert */}
        <line x1="285" y1="460" x2="480" y2="460" stroke="#dc2626" strokeWidth="2" markerEnd="url(#seq-arrow)" />
        <text x="382" y="454" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">11. POST /convert-to-purchase</text>

        {/* Message 12: Insert Purchase Order into MongoDB */}
        <line x1="480" y1="490" x2="875" y2="490" stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#seq-arrow)" />
        <text x="680" y="484" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">12. purchases.insert_one(&#123;status: "ordered"&#125;)</text>

        {/* Message 13: 201 Created & PO dispatched */}
        <line x1="875" y1="520" x2="100" y2="520" stroke="#059669" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#dash-arrow)" />
        <text x="490" y="514" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#059669">13. PO Created & Inbound Delivery Scheduled (LeadTime: 3d)</text>
      </svg>
    </div>
  );
}
