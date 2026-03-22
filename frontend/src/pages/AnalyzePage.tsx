import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/Progress';
import { PageContainer } from '../components/layout/PageContainer';

const WIZARD_STEPS = [
  { id: 1, label: '01. Identity Source', sub: 'Upload Resume' },
  { id: 2, label: '02. Destination Meta', sub: 'Job Description' },
  { id: 3, label: '03. AI Processing', sub: 'Architecture Mapping' },
  { id: 4, label: '04. Gap Output', sub: 'Final Report' },
];

const MOCK_RESUME_TEXT =
  'Senior Product Designer with 6+ years of experience building consumer-facing mobile and web applications. Led design for 3 unicorn-stage startups, shipping features to 5M+ users. Expert in Figma, design systems, and cross-functional collaboration.';

const MOCK_JOB_DESCRIPTION = `Senior Product Architect — Fintech Platform

We are looking for a Senior Product Architect to lead the technical vision for our next-generation payments platform.

Responsibilities:
- Architect scalable, high-availability payment processing systems
- Define and own the technical roadmap in collaboration with Product and Engineering
- Lead design reviews and establish engineering standards across squads

Requirements:
- 8+ years of software engineering experience with 3+ years in payment or financial systems
- Deep expertise in distributed systems and microservices
- Strong proficiency in TypeScript, Python, or Go`;

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

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    let stageIdx = 0;
    setAnalysisStage(ANALYSIS_STAGES[0]);

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
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
    setCurrentStep(2);
    simulateAnalysis();
  };

  const goNext = () => {
    if (currentStep < 2) setCurrentStep(s => s + 1);
  };

  const goBack = () => {
    if (isAnalyzing) return;
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="primary">New Analysis</Badge>
          <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
        </div>
        <h2
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--color-on-surface)' }}
        >
          Create Job Gap Analysis
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Map your profile against a target role to identify gaps and strategic pivots.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className="flex items-center gap-2 flex-1 h-1 rounded-full"
                style={{
                  background: idx <= (isAnalyzing ? 2 : currentStep)
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-container-highest)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {WIZARD_STEPS.map(step => (
            <p
              key={step.id}
              className="text-[10px] font-medium"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {step.sub}
            </p>
          ))}
        </div>
      </div>

      {/* AI Processing Overlay */}
      {isAnalyzing && (
        <Card className="mb-8 p-8 text-center">
          <div className="flex flex-col items-center gap-5">
            {/* Circular progress */}
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--color-surface-container-highest)' }}
              />
              <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - analysisProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {analysisProgress}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-on-surface)' }}>
                AI is analyzing your profile...
              </p>
              <p className="text-xs italic" style={{ color: 'var(--color-on-surface-variant)' }}>
                {analysisStage}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <ProgressBar value={analysisProgress} size="sm" showLabel={false} color="primary" />
            </div>

            <p className="text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>
              Takes approximately 45 seconds
            </p>
          </div>
        </Card>
      )}

      {/* Wizard Content */}
      {!isAnalyzing && (
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left — Resume Upload */}
          <div className="col-span-12 lg:col-span-5">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                  Identity Source
                </h3>
                <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>
                  description
                </span>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-on-surface-variant)' }}>
                Upload your resume in PDF or DOCX format.
              </p>

              {/* Dropzone */}
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                className="rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer mb-5 transition-colors"
                style={{
                  border: '2px dashed var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'var(--color-primary-fixed)' }}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {uploadStatus === 'success' ? 'history' : 'cloud_upload'}
                  </span>
                </div>
                {uploadStatus === 'uploading' && (
                  <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Parsing...</p>
                )}
                {uploadStatus === 'success' && (
                  <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>Parsed</p>
                )}
                {uploadStatus === 'idle' && (
                  <>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface)' }}>
                      Drop resume here
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                      or <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>browse</span>
                    </p>
                  </>
                )}
              </div>

              {/* Paste text fallback */}
              <Textarea
                label="Or paste resume text"
                value={resumeText}
                onChange={e => {
                  setResumeText(e.target.value);
                  if (e.target.value.length > 50) setUploadStatus('success');
                }}
                placeholder="Paste your resume here..."
                className="mb-4 min-h-[100px]"
              />

              {/* File chip */}
              {(fileName || uploadStatus === 'success') && (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--color-surface-container-highest)' }}
                >
                  <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-on-surface-variant)' }}>
                    attach_file
                  </span>
                  <p className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--color-on-surface)' }}>
                    {fileName || 'Resume loaded'}
                  </p>
                  <Badge variant="success">Ready</Badge>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Button variant="primary" size="md" onClick={goNext} disabled={!canProceedStep0}>
                  Next
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right — Job Description */}
          <div className="col-span-12 lg:col-span-7">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                  Destination Meta
                </h3>
                <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-tertiary)' }}>
                  gps_fixed
                </span>
              </div>

              <div className="mb-4">
                <Input
                  label="Job Title / Role"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Architect"
                />
              </div>

              <div className="mb-3">
                <Textarea
                  label="Job Description"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full job listing here..."
                  className="min-h-[180px]"
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <Button variant="ghost" size="sm" icon="content_paste" onClick={handlePasteFromJD}>
                    Paste JD
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex justify-between">
                <Button variant="ghost" size="md" icon="arrow_back" onClick={goBack}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={goNext} disabled={!canProceedStep1}>
                  Next
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Footer Action Bar */}
      <div
        className="mt-8 flex items-center justify-between pt-6"
        style={{ borderTop: '1px solid var(--color-outline-variant)' }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" icon="arrow_back" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <div
            className="w-px h-4"
            style={{ background: 'var(--color-outline-variant)' }}
          />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-on-surface-variant)' }}>
              info
            </span>
            <p className="text-xs italic" style={{ color: 'var(--color-on-surface-variant)' }}>
              Takes approximately 45 seconds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!canProceedStep0 || !canProceedStep1}
            icon="auto_awesome"
          >
            Analyze My Fit
          </Button>
        </div>
      </div>

      {/* Pro Tip */}
      <Card className="mt-5 p-5">
        <div className="flex gap-4 items-start">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary-fixed)' }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>
              lightbulb
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-on-surface)' }}>
              Pro Tip
            </p>
            <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              Include the Responsibilities and Qualifications sections for higher precision. The AI performs best when comparing specific outcomes.
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
