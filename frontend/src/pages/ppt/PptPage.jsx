import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Grid,
  FileText,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Cpu,
  Database,
  Server,
  Monitor,
  Share2,
  Workflow,
  HelpCircle,
  Copy,
  Check,
  Building,
  Calendar,
  User,
  Award,
  ShieldCheck,
  TrendingUp,
  Box,
  Truck,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { SLIDES_DATA, PROJECT_METADATA } from './slidesData';
import { DiagramsViewer } from './DiagramsViewer';

export function PptPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation' | 'document' | 'diagrams' | 'circular'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const slideContainerRef = useRef(null);
  const totalSlides = SLIDES_DATA.length;
  const currentSlide = SLIDES_DATA[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'presentation') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, viewMode, isFullscreen]);

  // Slideshow timer
  useEffect(() => {
    let timer;
    if (isPlaying && viewMode === 'presentation') {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, viewMode, totalSlides]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const jumpToSlide = (index) => {
    setCurrentSlideIndex(index);
    setShowGridModal(false);
    setViewMode('presentation');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (slideContainerRef.current?.requestFullscreen) {
        slideContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCopySummary = () => {
    const summaryText = `Project: ${PROJECT_METADATA.projectTitle}\nInstitution: ${PROJECT_METADATA.institution} - ${PROJECT_METADATA.department}\nReview: ${PROJECT_METADATA.reviewType}\nLead: ${PROJECT_METADATA.team[0].name} (${PROJECT_METADATA.team[0].rollNo})\nURL: /ppt\nStatus: Stage-I Ready (95% Implementation, 90% Documentation)`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handlePrint = () => {
    setViewMode('document');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-indigo-400" />
                CVR CSE &bull; Review-II
              </span>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Eval Date: 03-10-2026
              </span>
              <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                R22 Regulation (2023 Batch)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Major Project Stage-I Review-II Presentation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Academic evaluation deck & technical specifications for{' '}
              <strong className="text-indigo-300">ForecastFlow</strong>. Aligned with CVR College CSE Circular dated 21-09-2026 and standard 16-slide evaluation template.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Link
              to="/demo"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Live Demo</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Store Dashboard</span>
            </Link>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              title="Copy review summary to clipboard"
            >
              {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSummary ? 'Copied!' : 'Copy Info'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              title="Print or export as PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('presentation')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'presentation'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Presentation className="h-4 w-4" />
              <span>Slide Deck Mode</span>
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'document'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Full Document View (16 Slides)</span>
            </button>
            <button
              onClick={() => setViewMode('diagrams')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'diagrams'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Workflow className="h-4 w-4" />
              <span>Diagrams Studio</span>
            </button>
            <button
              onClick={() => setViewMode('circular')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'circular'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Circular & CO2 Mapping</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">&larr;</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">&rarr;</kbd> arrow keys to navigate slides
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: PRESENTATION SLIDE DECK */}
      {viewMode === 'presentation' && (
        <div ref={slideContainerRef} className="space-y-4">
          {/* Main Slide Card Container */}
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-xl min-h-[580px] flex flex-col justify-between transition-all">
            {/* Slide Header Ribbon */}
            <div className="border-b border-slate-100 pb-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-black text-sm shadow-xs">
                    {currentSlide.slideNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                        {currentSlide.category}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                        {currentSlide.badge}
                      </span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {currentSlide.coTag}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentSlide.title}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500">
                    Slide {currentSlide.slideNumber} of {totalSlides}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    CVR CSE IV-I Major Project Review-II
                  </p>
                </div>
              </div>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Body Content */}
            <div className="flex-1 my-2">
              <SlideRenderer slide={currentSlide} />
            </div>

            {/* Slide Academic Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{PROJECT_METADATA.department} &bull; {PROJECT_METADATA.institution}</span>
              <span className="font-mono">
                {PROJECT_METADATA.circularRef.split('|')[1]?.trim() || 'Date: 03-10-2026'}
              </span>
            </div>
          </div>

          {/* Interactive Slide Control Bar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Previous / Next & Counter */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={prevSlide}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-black text-slate-700 font-mono">
                {currentSlide.slideNumber} / {totalSlides}
              </div>
              <button
                type="button"
                onClick={nextSlide}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Center: Slide Progress Dots / Bar */}
            <div className="flex-1 max-w-md w-full px-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
                />
              </div>
            </div>

            {/* Right: Tools & Grid Jump */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title={isPlaying ? 'Pause slideshow' : 'Auto-play slideshow (8s per slide)'}
              >
                {isPlaying ? <Pause className="h-4 w-4 text-amber-700" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setShowGridModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Grid className="h-4 w-4 text-slate-600" />
                <span>Jump to Slide</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL DOCUMENT REPORT VIEW */}
      {viewMode === 'document' && (
        <div className="space-y-8 bg-slate-50 p-2 sm:p-6 rounded-3xl border border-slate-200">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Complete Project Work Stage-I Report & Review Deck
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All 16 slides expanded sequentially in continuous document format per CVR CSE college guidelines.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print All Slides to PDF</span>
            </button>
          </div>

          <div className="space-y-8">
            {SLIDES_DATA.map((slide) => (
              <div
                key={slide.slideNumber}
                id={`doc-slide-${slide.slideNumber}`}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">
                      {slide.slideNumber}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{slide.title}</h3>
                      <p className="text-xs text-slate-500">{slide.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {slide.category}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {slide.coTag}
                    </span>
                  </div>
                </div>

                <SlideRenderer slide={slide} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: DIAGRAMS STUDIO */}
      {viewMode === 'diagrams' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              Interactive System Design & UML Diagrams Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fulfilling Section 4 of the Review-II Project Report (Architecture, Class, Use Case, Activity, Sequence models).
            </p>
          </div>
          <DiagramsViewer initialDiagram="object" />
        </div>
      )}

      {/* VIEW MODE 4: CIRCULAR & CO2 COMPLIANCE MATRIX */}
      {viewMode === 'circular' && (
        <div className="space-y-6">
          <CircularComplianceMatrix />
        </div>
      )}

      {/* SLIDE GRID JUMP MODAL */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Jump to Slide</h3>
                <p className="text-xs text-slate-500">Select any of the 16 slides in the evaluation template</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGridModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SLIDES_DATA.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  onClick={() => jumpToSlide(idx)}
                  className={`text-left rounded-2xl border p-3.5 transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">
                      {s.slideNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{s.category}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs line-clamp-1">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{s.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SLIDE RENDERER COMPONENT: Renders each slide based on content type
// -------------------------------------------------------------
function SlideRenderer({ slide }) {
  const { content } = slide;

  switch (content.type) {
    case 'title':
      return (
        <div className="space-y-6 text-center max-w-4xl mx-auto py-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-xl font-black text-indigo-900 tracking-wide uppercase">
              {content.institution}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {content.subInstitution}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              {content.department}
            </p>
          </div>

          <div className="inline-block rounded-2xl bg-indigo-50 border border-indigo-200/80 px-4 py-2 shadow-xs">
            <p className="text-xs sm:text-sm font-bold text-indigo-700">
              {content.reviewType}
            </p>
          </div>

          <div className="py-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {content.projectTitle}
            </h2>
          </div>

          {/* Student Team & Guide Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-indigo-600" />
                Project Group Members:
              </p>
              <div className="space-y-1.5">
                {content.team.map((member, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{member.name}</span>
                    <span className="font-mono text-slate-500">{member.rollNo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-indigo-600" />
                Under Guidance Of:
              </p>
              <p className="text-sm font-bold text-slate-900">{content.supervisor.name}</p>
              <p className="text-xs text-slate-600">{content.supervisor.designation}</p>
              <p className="text-xs text-slate-500">{content.supervisor.institution}</p>
            </div>
          </div>

          {/* Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {content.stats.map((st, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{st.label}</p>
                <p className="text-xs sm:text-sm font-black text-indigo-700 mt-0.5">{st.value}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'agenda':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.items.map((item) => (
            <div
              key={item.num}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs">
                {item.num < 10 ? `0${item.num}` : item.num}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'abstract':
      return (
        <div className="space-y-5">
          <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
            {content.paragraphs.map((p, idx) => (
              <p key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {p}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {content.highlights.map((h, i) => (
              <div key={i} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                <span className="text-[10px] font-black uppercase text-indigo-700 block mb-1">
                  {h.label}
                </span>
                <span className="text-xs font-bold text-slate-900">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'motivation':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.points.map((pt, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 space-y-3 shadow-xs hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-600">{pt.metric}</span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {pt.metricLabel}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{pt.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
            </div>
          ))}
        </div>
      );

    case 'literature_table':
      return (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-12">S.No</th>
                  <th className="py-3 px-4 w-48">Author(s)</th>
                  <th className="py-3 px-4 w-60">Title of Paper & Venue</th>
                  <th className="py-3 px-4">Observations / Findings</th>
                  <th className="py-3 px-4">Limitations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {content.papers.map((paper) => (
                  <tr key={paper.sno} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{paper.sno}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{paper.authors}</td>
                    <td className="py-3 px-4 italic text-slate-700">{paper.title}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{paper.findings}</td>
                    <td className="py-3 px-4 text-rose-700 leading-relaxed font-medium bg-rose-50/30">
                      {paper.limitations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-bold text-slate-500 italic text-right">
            {content.note}
          </p>
        </div>
      );

    case 'gaps':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.gaps.map((gap, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 text-indigo-900">
                {gap.title}
              </h4>
              <div className="rounded-xl bg-rose-50/70 border border-rose-200/60 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                  State-of-the-Art Vulnerability:
                </span>
                <p className="text-xs text-rose-900 leading-relaxed">{gap.existing}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  ForecastFlow Resolution:
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {gap.forecastFlowEdge}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'problem_statement':
      return (
        <div className="space-y-6 max-w-4xl mx-auto py-2">
          <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 p-6 sm:p-8 shadow-sm">
            <span className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Single Formal Statement
            </span>
            <blockquote className="mt-4 text-base sm:text-lg font-bold text-slate-900 leading-relaxed italic border-l-4 border-indigo-600 pl-4">
              "{content.statement}"
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.coreObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {obj.label}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">{obj.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'pipeline':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {content.steps.map((st) => (
            <div
              key={st.step}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs">
                  {st.step}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">ML Stage</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{st.detail}</p>
            </div>
          ))}
        </div>
      );

    case 'requirements':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {content.stakeholders.map((s, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-xs font-bold text-indigo-900 block">{s.role}</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.needs}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2.5 bg-white">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">
                Key Functional Requirements (CO2)
              </h4>
              <div className="space-y-2">
                {content.functionalRequirements.map((fr) => (
                  <div key={fr.id} className="text-xs rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <span className="font-bold text-indigo-600 font-mono mr-1.5">{fr.id}:</span>
                    <strong className="text-slate-900">{fr.name}</strong> &mdash;{' '}
                    <span className="text-slate-600">{fr.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2.5 bg-white">
              <h4 className="text-xs font-black uppercase tracking-wider text-sky-700">
                Key Non-Functional Requirements & Design Impact
              </h4>
              <div className="space-y-2">
                {content.nonFunctionalRequirements.map((nfr) => (
                  <div key={nfr.id} className="text-xs rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <span className="font-bold text-sky-600 font-mono mr-1.5">{nfr.id}:</span>
                    <strong className="text-slate-900">{nfr.name}</strong> &mdash;{' '}
                    <span className="text-slate-600">{nfr.spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'tech_stack':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {content.layers.map((layer, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {layer.tier}
              </span>
              <h4 className="text-sm font-bold text-slate-900 font-mono">{layer.tech}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{layer.rationale}</p>
            </div>
          ))}
        </div>
      );

    case 'hardware':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {content.environments.map((env, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-indigo-900">{env.target}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{env.purpose}</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">CPU:</span>
                  <span className="font-medium text-slate-800">{env.cpu}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Memory:</span>
                  <span className="font-medium text-slate-800">{env.ram}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Storage:</span>
                  <span className="font-medium text-slate-800">{env.storage}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">OS / Host:</span>
                  <span className="font-medium text-slate-800">{env.os}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'dataset':
      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {content.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {content.attributes.map((attr, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block truncate">{attr.name}</span>
                <span className="text-xs font-black text-indigo-600 block">{attr.value}</span>
                <span className="text-[10px] text-slate-500 block truncate">{attr.desc}</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Product Name (SKU)</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Reorder Threshold</th>
                  <th className="py-2.5 px-3">Safety Stock</th>
                  <th className="py-2.5 px-3">Lead Time</th>
                  <th className="py-2.5 px-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {content.sampleProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{p.stock}</td>
                    <td className="py-2 px-3 font-mono text-amber-700">{p.reorder}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{p.safety}</td>
                    <td className="py-2 px-3 font-medium text-indigo-600">{p.leadTime}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'diagrams_overview':
      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Click through the interactive tabbed studio below to inspect each of the 6 UML and system models.
          </p>
          <DiagramsViewer initialDiagram="object" />
        </div>
      );

    case 'innovations':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.innovations.map((inv) => (
            <div key={inv.num} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-black text-xs">
                  {inv.num}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{inv.description}</p>
              {inv.formula && (
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-amber-300 border border-slate-800 overflow-x-auto">
                  {inv.formula}
                </div>
              )}
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Impact: {inv.impact}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'plan_of_action':
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {content.overallStatus.map((item, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.item}</span>
                  <span className="text-xs font-black text-indigo-600">{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{item.status}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Module Implementation Breakdown (95% Partial Demo Ready)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {content.modulesBreakdown.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800 truncate pr-2">{m.module}</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold shrink-0">
                    {m.progress}% &bull; {m.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              College Circular Milestone Deadlines (R22 Batch)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {content.circularMilestones.map((cm, i) => (
                <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-indigo-600 block">{cm.date}</span>
                  <span className="font-bold text-slate-800 text-[11px] block mt-0.5">{cm.event}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{cm.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'references':
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
              Scopus / IEEE Conference Paper Communication
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
              "{content.publicationProof.paperTitle}"
            </h4>
            <p className="text-xs text-indigo-800">Target Venue: {content.publicationProof.targetVenue}</p>
            <p className="text-xs font-semibold text-emerald-700">Status: {content.publicationProof.status}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Standard IEEE Bibliographic References
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              {content.citations.map((c) => (
                <div key={c.num} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="font-mono font-bold text-indigo-600 shrink-0">[{c.num}]</span>
                  <span className="leading-relaxed">{c.citation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <div>Slide content renderer not found.</div>;
  }
}

// -------------------------------------------------------------
// CIRCULAR & CO2 COMPLIANCE MATRIX VIEW
// -------------------------------------------------------------
function CircularComplianceMatrix() {
  const parameters = [
    {
      code: 'Param 1',
      title: 'Requirement Analysis, Feasibility and Justification (CO2)',
      slideRef: 'Slide 4, 7, 9',
      status: 'Fully Addressed',
      description: 'Economic working capital justification for Kirana retail, single problem statement, and stakeholder requirement specifications.'
    },
    {
      code: 'Param 2',
      title: 'Hardware and Software Analysis (CO2)',
      slideRef: 'Slide 10, 11',
      status: 'Fully Addressed',
      description: 'Complete 6-tier software stack breakdown (FastAPI, React, Vite, MongoDB) and 4-tier hardware matrix for workstation, cloud server, and client.'
    },
    {
      code: 'Param 3',
      title: 'Dataset selection and description, Project planning milestones (CO2)',
      slideRef: 'Slide 12, 15',
      status: 'Fully Addressed',
      description: 'Siddu Kirana 26-SKU benchmark catalog, 35 days sales history, and official percentage completion table (Modules 95%, Docs 90%, Paper 80%).'
    },
    {
      code: 'Param 4',
      title: 'Individual analysis of key functional and non-functional requirements & design impact (CO2)',
      slideRef: 'Slide 9, 13',
      status: 'Fully Addressed',
      description: 'Itemized FR-01 to FR-05 and NFR-01 to NFR-04 specifications showing direct architectural decisions in MongoDB atomic transactions & caching.'
    },
    {
      code: 'Param 5',
      title: 'Individual student contribution: Hardware and software analysis (CO2)',
      slideRef: 'Slide 1, 10, 11, 15',
      status: 'Fully Addressed',
      description: 'Clear delineation of team roles across ML pipeline, full-stack architecture, database optimization, and system modeling.'
    },
    {
      code: 'Doc B.1',
      title: 'Project Report Content (Sections 1 to 4.4)',
      slideRef: 'Slide 3, 5, 8, 10, 12, 13',
      status: 'Draft Ready',
      description: 'Covers Introduction, Literature Review, Requirement Analysis, Proposed Architecture (4.1), Methods/Algorithms (4.2), Class/Use Case/Activity/Sequence Diagrams (4.3), Datasets & Tech Stack (4.4).'
    },
    {
      code: 'Doc B.2',
      title: 'Research Paper Submission Proof (Scopus / IEEE Conference)',
      slideRef: 'Slide 16',
      status: 'Paper Drafted',
      description: 'Manuscript drafted for Scopus-indexed IEEE conference titled "ForecastFlow: An Ensemble Machine Learning Framework for Lead-Time-Aware Inventory Replenishment".'
    },
    {
      code: 'Doc B.3',
      title: 'Project Progress Report & ERP Portal Communication',
      slideRef: 'Slide 15',
      status: 'In Progress',
      description: 'Regular milestone logs logged on the college ERP portal under supervisor supervision.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              Circular Compliance Checklist
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              CVR College CSE Review-II Evaluation Parameters (CO2)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-verifying all requirements from the official departmental circular dated 21-09-2026.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            All 8 Criteria Covered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parameters.map((p, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {p.code}
              </span>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                {p.status}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
            <div className="text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Corresponding Presentation Slides:</span>
              <span className="text-indigo-600 font-mono">{p.slideRef}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
