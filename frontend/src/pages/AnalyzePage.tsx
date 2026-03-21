import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CloudUpload,
  ArrowBack,
  Info,
  Bolt,
  Lightbulb,
  Description,
  GpsFixed,
  ContentPaste,
  AutoFixHigh,
  History,
} from '@mui/icons-material';
import { useDraftStore, useToastStore, useAuthStore } from '../store';
import { uploadResume, analyze } from '../services/analysis';

const steps = [
  { id: 1, label: '01. Identity Source', sub: 'Upload Resume' },
  { id: 2, label: '02. Destination Meta', sub: 'Job Description' },
  { id: 3, label: '03. AI Processing', sub: 'Architecture Mapping' },
  { id: 4, label: '04. Gap Output', sub: 'Final Report' },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const { targetRole, company, resumeText, jobDescription, setDraft, clearDraft } = useDraftStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [parsedResume, setParsedResume] = useState('');

  const handleDraftChange = useCallback((updates: Partial<typeof useDraftStore.getState>) => {
    setDraft(updates);
  }, [setDraft]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: (data) => {
      setUploadStatus('success');
      setParsedResume(data.extracted_text);
      handleDraftChange({ resumeText: data.extracted_text });
      addToast({ type: 'success', message: '简历解析成功' });
    },
    onError: (err: Error) => {
      setUploadStatus('error');
      setUploadError(err.message || '解析失败');
      addToast({ type: 'error', message: err.message || '简历解析失败' });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: (payload: { target_role: string; company?: string; resume_text: string; job_description: string }) =>
      analyze(payload),
    onSuccess: (data) => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/analyze/${data.session_id}`);
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message || '分析失败，请重试' });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('uploading');
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadStatus('uploading');
      uploadMutation.mutate(file);
    }
  };

  const canProceedStep0 = uploadStatus === 'success' || resumeText.length > 50;
  const canProceedStep1 = targetRole.trim().length > 0 && jobDescription.trim().length > 100;

  const goNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!user) {
      addToast({ type: 'error', message: '请先登录' });
      navigate('/auth');
      return;
    }
    analyzeMutation.mutate({
      target_role: targetRole,
      company: company || undefined,
      resume_text: resumeText,
      job_description: jobDescription,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar (fixed, 64px offset) */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-container-highest)] flex flex-col py-6 z-50 overflow-y-auto">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-[var(--color-text-on-surface)] tracking-tighter">Precision Curator</h1>
          <p className="text-[10px] font-medium text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mt-1">Elite Analysis</p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <a className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors font-medium text-sm tracking-tight rounded-lg" href="/">
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[var(--color-primary-container)] bg-[var(--color-bg-surface)] rounded-lg mx-2 transition-all font-medium text-sm tracking-tight" href="/analyze">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            Analysis
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors font-medium text-sm tracking-tight rounded-lg" href="/applications">
            <span className="material-symbols-outlined text-lg">assignment</span>
            Applications
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors font-medium text-sm tracking-tight rounded-lg" href="/tasks">
            <span className="material-symbols-outlined text-lg">school</span>
            Learning
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors font-medium text-sm tracking-tight rounded-lg" href="/interview">
            <span className="material-symbols-outlined text-lg">interpreter_mode</span>
            Interviews
          </a>
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)]" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-[var(--color-text-on-surface)]">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-[var(--color-text-on-surface-variant)] truncate">Premium Curator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Topbar */}
      <header className="fixed top-0 right-0 left-56 h-16 z-40 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/20 flex justify-between items-center px-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-on-surface-variant)] text-sm">search</span>
            <input
              className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--color-primary-container)] transition-all placeholder:text-[var(--color-text-on-surface-variant)]/50"
              placeholder="Search analyses..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="h-8 w-px bg-[var(--color-outline-variant)]/20" />
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-fixed-dim)]" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-56 pt-16 min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-12 py-16">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed-variant)] text-[10px] font-bold tracking-widest uppercase rounded">
                New Analysis
              </span>
              <div className="h-px flex-1 bg-[var(--color-outline-variant)]/10" />
            </div>
            <h2 className="text-[2.75rem] font-extrabold text-[var(--color-text-on-surface)] tracking-tight leading-tight mb-4">
              Create Job Gap Analysis
            </h2>
            <p className="text-lg text-[var(--color-text-on-surface-variant)] max-w-2xl leading-relaxed">
              Our AI Digital Architect will map your career DNA against the target role to identify architectural gaps and strategic pivots.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-16 grid grid-cols-4 gap-4">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const isPending = idx > currentStep;
              return (
                <div key={step.id} className="group relative">
                  <div
                    className={`h-1 rounded-full mb-3 transition-all ${
                      isActive ? 'bg-[var(--color-primary)]' :
                      isCompleted ? 'bg-[var(--color-primary)]' :
                      'bg-[var(--color-surface-container-highest)]'
                    }`}
                  />
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${
                    isPending ? 'text-[var(--color-text-on-surface-variant)] opacity-40' : 'text-[var(--color-primary)]'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-on-surface-variant)]">{step.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Wizard Content (Asymmetric Layout) */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Column 1: Upload Resume (Left, Slightly Narrower) */}
            <div className="col-span-12 lg:col-span-5">
              <div className="bg-[var(--color-surface-container)] rounded-xl p-8 border border-transparent hover:border-[var(--color-primary-container)]/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-on-surface)]">Identity Source</h3>
                  <Description sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
                </div>
                <p className="text-sm text-[var(--color-text-on-surface-variant)] mb-8 leading-relaxed">
                  Upload your latest resume in PDF or DOCX format. We'll extract your skills, tenure, and project impact.
                </p>

                {/* Dropzone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                  className="relative group border-2 border-dashed border-[var(--color-outline-variant)]/30 rounded-xl p-10 flex flex-col items-center justify-center bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer"
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    uploadStatus === 'uploading' ? 'bg-[var(--color-primary-fixed-dim)]' :
                    uploadStatus === 'success' ? 'bg-[var(--color-success-subtle)]' :
                    uploadStatus === 'error' ? 'bg-[var(--color-error-subtle)]' :
                    'bg-[var(--color-primary-fixed-dim)]'
                  }`}>
                    <CloudUpload sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                  </div>
                  {uploadStatus === 'uploading' && (
                    <p className="text-sm font-medium text-[var(--color-primary)] animate-pulse">正在解析...</p>
                  )}
                  {uploadStatus === 'success' && (
                    <p className="text-sm font-medium text-[var(--color-success)]">解析成功</p>
                  )}
                  {uploadStatus === 'error' && (
                    <p className="text-sm font-medium text-[var(--color-error)]">{uploadError}</p>
                  )}
                  {uploadStatus === 'idle' && (
                    <>
                      <p className="font-medium text-sm mb-1 text-[var(--color-text-on-surface)]">Drop Resume Here</p>
                      <p className="text-xs text-[var(--color-text-on-surface-variant)]">
                        or <span className="text-[var(--color-primary)] font-semibold">browse files</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Resume text paste alternative */}
                <div className="mt-6">
                  <label className="block text-[11px] font-bold text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mb-2">
                    Or paste resume text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setDraft({ resumeText: e.target.value });
                      if (e.target.value.length > 50) setUploadStatus('success');
                    }}
                    placeholder="Paste resume content here..."
                    className="w-full h-32 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-text-on-surface-variant)]/40"
                  />
                </div>

                {/* Uploaded file history */}
                {parsedResume && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-container-highest)]/50 rounded-lg">
                      <History sx={{ fontSize: 16, color: 'var(--color-text-on-surface-variant)' }} />
                      <p className="text-xs font-medium truncate text-[var(--color-text-on-surface)]">
                        {parsedResume.slice(0, 50)}...
                      </p>
                      <span className="ml-auto text-[10px] text-[var(--color-primary)] font-bold uppercase">Ready</span>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={goNext}
                    disabled={!canProceedStep0}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      canProceedStep0
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)] hover:opacity-90'
                        : 'bg-[var(--color-surface-container-highest)] text-[var(--color-text-on-surface-variant)] cursor-not-allowed'
                    }`}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Job Description (Right, Wider) */}
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-[var(--color-surface-container-low)] rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-on-surface)]">Destination Meta</h3>
                  <GpsFixed sx={{ color: 'var(--color-tertiary)', fontSize: 20 }} />
                </div>

                <div className="mb-6">
                  <label className="block text-[11px] font-bold text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mb-2">
                    Job Title / Role
                  </label>
                  <input
                    value={targetRole}
                    onChange={(e) => handleDraftChange({ targetRole: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/20 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-text-on-surface-variant)]/40"
                    placeholder="e.g. Senior Product Architect"
                    type="text"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mb-2">
                    Company (Optional)
                  </label>
                  <input
                    value={company}
                    onChange={(e) => handleDraftChange({ company: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/20 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-text-on-surface-variant)]/40"
                    placeholder="e.g. Stripe, Google"
                    type="text"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mb-2">
                    Job Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => handleDraftChange({ jobDescription: e.target.value })}
                      className="w-full h-80 bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/20 rounded-xl p-6 text-sm leading-relaxed resize-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-text-on-surface-variant)]/40"
                      placeholder="Paste the full job listing here..."
                      spellCheck={false}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] bg-[var(--color-surface-container)] rounded-lg transition-colors">
                        <ContentPaste sx={{ fontSize: 18 }} />
                      </button>
                      <button className="p-2 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] bg-[var(--color-surface-container)] rounded-lg transition-colors">
                        <AutoFixHigh sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] font-medium transition-colors text-sm"
                  >
                    <ArrowBack sx={{ fontSize: 16 }} />
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canProceedStep1}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      canProceedStep1
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary)] hover:opacity-90'
                        : 'bg-[var(--color-surface-container-highest)] text-[var(--color-text-on-surface-variant)] cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="mt-16 flex items-center justify-between py-8 border-t border-[var(--color-outline-variant)]/10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] font-medium transition-colors text-sm"
              >
                <ArrowBack sx={{ fontSize: 16 }} />
                Cancel
              </button>
              <div className="h-4 w-px bg-[var(--color-outline-variant)]/20" />
              <div className="flex items-center gap-2 text-[var(--color-text-on-surface-variant)]/60 italic text-xs">
                <Info sx={{ fontSize: 16 }} />
                AI will take approx. 45 seconds to curate your gap analysis.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-all text-sm">
                Save as Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={analyzeMutation.isPending}
                className="px-8 py-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary)] font-bold rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Analyze My Fit
                <Bolt sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* Contextual Tip Card (Glassmorphism) */}
          <div className="mt-12 p-6 rounded-2xl bg-[var(--color-surface-container-lowest)]/40 backdrop-blur-xl border border-white/40 flex gap-6 items-start">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--color-primary-fixed)] flex items-center justify-center">
              <Lightbulb sx={{ color: 'var(--color-primary)', fontSize: 22 }} />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1 tracking-tight text-[var(--color-text-on-surface)]">Pro Curator Tip</h4>
              <p className="text-sm text-[var(--color-text-on-surface-variant)] leading-relaxed">
                For higher precision, ensure the job description includes the "Responsibilities" and "Qualifications" sections. The AI performs best when it can compare specific outcomes rather than generic keywords.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
