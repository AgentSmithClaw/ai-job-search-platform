import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { ProgressBar, StepIndicator } from '../components/ui/Progress';

const WIZARD_STEPS = [
  { id: 1, label: '01. Identity Source', sub: 'Upload Resume' },
  { id: 2, label: '02. Destination Meta', sub: 'Job Description' },
  { id: 3, label: '03. AI Processing', sub: 'Architecture Mapping' },
  { id: 4, label: '04. Gap Output', sub: 'Final Report' },
];

const MOCK_UPLOADED_FILE = 'Resume_ProductDesigner_2024.pdf';
const MOCK_RESUME_TEXT =
  'Senior Product Designer with 6+ years of experience building consumer-facing mobile and web applications. Led design for 3 unicorn-stage startups, shipping features to 5M+ users. Expert in Figma, design systems, and cross-functional collaboration with engineering and product teams.';

const MOCK_JOB_DESCRIPTION = `Senior Product Architect — Fintech Platform

We are looking for a Senior Product Architect to lead the technical vision for our next-generation payments platform. You will work closely with engineering leadership to define system architecture, drive technical decisions, and mentor senior engineers.

Responsibilities:
- Architect scalable, high-availability payment processing systems handling $10B+ annually
- Define and own the technical roadmap in collaboration with Product and Engineering
- Lead design reviews and establish engineering standards across squads
- Partner with cross-functional leaders on strategic product initiatives

Requirements:
- 8+ years of software engineering experience with 3+ years in payment or financial systems
- Deep expertise in distributed systems, event-driven architecture, and microservices
- Strong proficiency in TypeScript, Python, or Go
- Experience with cloud infrastructure (AWS/GCP) and infrastructure-as-code
- Track record of shipping high-scale, production-grade systems`;

// Simulated AI analysis progress stages
const ANALYSIS_STAGES = [
  'Parsing resume structure...',
  'Extracting skills and experience...',
  'Mapping job requirements...',
  'Computing gap vectors...',
  'Generating strategic recommendations...',
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');

  const canProceedStep0 = uploadStatus === 'success' || resumeText.trim().length > 50;
  const canProceedStep1 = jobTitle.trim().length > 0 && jobDescription.trim().length > 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadStatus('uploading');
    // Simulate upload parsing
    setTimeout(() => {
      setUploadStatus('success');
      setResumeText(MOCK_RESUME_TEXT);
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setUploadStatus('uploading');
      setTimeout(() => {
        setUploadStatus('success');
        setResumeText(MOCK_RESUME_TEXT);
      }, 1800);
    }
  };

  const handlePasteFromJD = () => {
    setJobDescription(MOCK_JOB_DESCRIPTION);
    setJobTitle('Senior Product Architect');
  };

  const simulateAIAanalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    let stageIdx = 0;
    setAnalysisStage(ANALYSIS_STAGES[0]);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 12) + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/history'), 800);
          return 100;
        }
        const newStageIdx = Math.floor((next / 100) * ANALYSIS_STAGES.length);
        if (newStageIdx > stageIdx && newStageIdx < ANALYSIS_STAGES.length) {
          stageIdx = newStageIdx;
          setAnalysisStage(ANALYSIS_STAGES[stageIdx]);
        }
        return Math.min(next, 99);
      });
    }, 300);
  };

  const handleSubmit = () => {
    setCurrentStep(2); // jump to AI Processing step
    simulateAIAanalysis();
  };

  const goNext = () => {
    if (currentStep < 2) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isAnalyzing) return;
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-surface-container-highest)] flex flex-col py-6 z-50 overflow-y-auto">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-[var(--color-text-on-surface)] tracking-tighter">Precision Curator</h1>
          <p className="text-[10px] font-medium text-[var(--color-text-on-surface-variant)] uppercase tracking-widest mt-1">Elite Analysis</p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {[
            { icon: 'dashboard', label: 'Dashboard', href: '/' },
            { icon: 'analytics', label: 'Analysis', href: '/analyze', active: true },
            { icon: 'assignment', label: 'Applications', href: '/applications' },
            { icon: 'school', label: 'Learning', href: '/tasks' },
            { icon: 'interpreter_mode', label: 'Interviews', href: '/interview' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-tight rounded-lg transition-all
                ${item.active
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-primary-container)]'
                  : 'text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-container)] mx-2'}
              `}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)]" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-[var(--color-text-on-surface)]">Alex Sterling</p>
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
              <Badge variant="primary">New Analysis</Badge>
              <div className="h-px flex-1 bg-[var(--color-outline-variant)]/10" />
            </div>
            <h2 className="text-[2.75rem] font-extrabold text-[var(--color-text-on-surface)] tracking-tight leading-tight mb-4">
              Create Job Gap Analysis
            </h2>
            <p className="text-lg text-[var(--color-text-on-surface-variant)] max-w-2xl leading-relaxed">
              Our AI Digital Architect will map your career DNA against the target role to identify architectural gaps and strategic pivots.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-12">
            <StepIndicator steps={WIZARD_STEPS} currentStep={isAnalyzing ? 2 : currentStep} />
          </div>

          {/* AI Processing Overlay */}
          {isAnalyzing && (
            <Card className="mb-8 p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--color-surface-container-highest)]" />
                  <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - analysisProgress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[var(--color-primary)]">{analysisProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-on-surface)] mb-1">AI is analyzing your profile...</p>
                  <p className="text-sm text-[var(--color-text-on-surface-variant)] italic">{analysisStage}</p>
                </div>
                <ProgressBar value={analysisProgress} size="md" showLabel={false} color="primary" />
                <p className="text-xs text-[var(--color-text-on-surface-variant)]">This usually takes about 45 seconds</p>
              </div>
            </Card>
          )}

          {/* Wizard Content */}
          {!isAnalyzing && (
            <div className="grid grid-cols-12 gap-8 items-start">

              {/* Left Column: Resume Upload */}
              <div className="col-span-12 lg:col-span-5">
                <Card className="p-8 hover:border-[var(--color-primary-container)]/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-on-surface)]">Identity Source</h3>
                    <Description sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
                  </div>
                  <p className="text-sm text-[var(--color-text-on-surface-variant)] mb-6 leading-relaxed">
                    Upload your latest resume in PDF or DOCX format. We'll extract your skills, tenure, and project impact.
                  </p>

                  {/* Dropzone */}
                  <div
                    role="button"
                    tabIndex={0}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    className="relative group border-2 border-dashed border-[var(--color-outline-variant)]/30 rounded-xl p-10 flex flex-col items-center justify-center bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer mb-6"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform
                      ${uploadStatus === 'uploading' ? 'bg-[var(--color-primary-fixed-dim)] animate-pulse' :
                        uploadStatus === 'success' ? 'bg-[var(--color-success-subtle)]' :
                        'bg-[var(--color-primary-fixed-dim)]'}
                    `}>
                      {uploadStatus === 'success' ? (
                        <History sx={{ fontSize: 32, color: 'var(--color-success)' }} />
                      ) : (
                        <CloudUpload sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                      )}
                    </div>
                    {uploadStatus === 'uploading' && (
                      <>
                        <p className="font-medium text-sm mb-1 text-[var(--color-primary)]">Parsing Resume...</p>
                        <p className="text-xs text-[var(--color-text-on-surface-variant)]">Extracting skills and experience</p>
                      </>
                    )}
                    {uploadStatus === 'success' && (
                      <p className="font-medium text-sm text-[var(--color-success)]">Resume Parsed Successfully</p>
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

                  {/* Or paste text */}
                  <Textarea
                    label="Or paste resume text"
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      if (e.target.value.length > 50) setUploadStatus('success');
                    }}
                    placeholder="Paste your resume content here..."
                    className="mb-4 min-h-[100px]"
                  />

                  {/* Uploaded file chip */}
                  {(fileName || uploadStatus === 'success') && (
                    <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-container-highest)]/50 rounded-lg">
                      <History sx={{ fontSize: 16, color: 'var(--color-text-on-surface-variant)' }} />
                      <p className="text-xs font-medium truncate text-[var(--color-text-on-surface)] flex-1">
                        {fileName || MOCK_UPLOADED_FILE}
                      </p>
                      <Badge variant="success">Ready</Badge>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={goNext}
                      disabled={!canProceedStep0}
                    >
                      Next Step →
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Column: Job Description */}
              <div className="col-span-12 lg:col-span-7">
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-on-surface)]">Destination Meta</h3>
                    <GpsFixed sx={{ color: 'var(--color-tertiary)', fontSize: 20 }} />
                  </div>

                  <div className="mb-4">
                    <Input
                      label="Job Title / Role"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Product Architect"
                    />
                  </div>

                  <div className="mb-4">
                    <Textarea
                      label="Job Description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job listing here — include Responsibilities and Qualifications for best results..."
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={handlePasteFromJD}>
                        <ContentPaste sx={{ fontSize: 14 }} />
                        Paste JD
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AutoFixHigh sx={{ fontSize: 14 }} />
                        Enhance
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="ghost" size="md" onClick={goBack}>
                      <ArrowBack sx={{ fontSize: 16 }} />
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={goNext}
                      disabled={!canProceedStep1}
                    >
                      Next →
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="mt-16 flex items-center justify-between py-8 border-t border-[var(--color-outline-variant)]/10">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="md" onClick={() => navigate('/')}>
                <ArrowBack sx={{ fontSize: 16 }} />
                Cancel
              </Button>
              <div className="h-4 w-px bg-[var(--color-outline-variant)]/20" />
              <div className="flex items-center gap-2 text-[var(--color-text-on-surface-variant)]/60 italic text-xs">
                <Info sx={{ fontSize: 16 }} />
                AI will take approx. 45 seconds to curate your gap analysis.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="md">
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={!canProceedStep0 || !canProceedStep1}
              >
                Analyze My Fit
                <Bolt sx={{ fontSize: 18 }} />
              </Button>
            </div>
          </div>

          {/* Pro Tip Card */}
          <Card className="mt-6 p-6 bg-[var(--color-surface-container-low)]/40 backdrop-blur-xl border border-white/40">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--color-primary-fixed)] flex items-center justify-center">
                <Lightbulb sx={{ color: 'var(--color-primary)', fontSize: 22 }} />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 tracking-tight text-[var(--color-text-on-surface)]">Pro Curator Tip</h4>
                <p className="text-sm text-[var(--color-text-on-surface-variant)] leading-relaxed">
                  For higher precision, ensure the job description includes the &quot;Responsibilities&quot; and &quot;Qualifications&quot; sections. The AI performs best when it can compare specific outcomes rather than generic keywords.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
