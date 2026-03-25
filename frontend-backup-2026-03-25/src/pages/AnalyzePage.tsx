import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyze, getPricing, mockPurchase, uploadResume } from '../services/analysis';
import { useAuthStore, useDraftStore, useToastStore } from '../store';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';
import { deriveSessionFromAnalysis } from '../utils/analysis';

const STEP_LABELS = [
  { title: '01 Resume Input', subtitle: 'Resume text' },
  { title: '02 Target Role', subtitle: 'Job description' },
  { title: '03 AI Analysis', subtitle: 'Strategic mapping' },
  { title: '04 Final Report', subtitle: 'Action plan' },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { targetRole, resumeText, jobDescription, setDraft, clearDraft } = useDraftStore();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadName, setUploadName] = useState('');

  const { data: pricing = [] } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      setDraft({ resumeText: data.extracted_text });
      setUploadName(data.file_name);
      addToast({ type: 'success', message: `Resume parsed: ${data.char_count} chars` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Resume upload failed' }),
  });

  const analyzeMutation = useMutation({
    mutationFn: () =>
      analyze({
        target_role: targetRole,
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, credits: data.credits_remaining });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      const adapted = deriveSessionFromAnalysis(data, resumeText, jobDescription);
      queryClient.setQueryData(['session', data.session_id], adapted);
      clearDraft();
      addToast({ type: 'success', message: 'Analysis complete. Opening report...' });
      navigate(`/analyze/${data.session_id}`);
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Analysis failed. Please retry.' }),
  });

  const purchaseMutation = useMutation({
    mutationFn: (packageCode: string) => mockPurchase(packageCode),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, credits: data.credits_total });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: `Purchased ${data.package_name}. Credits: ${data.credits_total}` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Purchase failed' }),
  });

  const canAnalyze = targetRole.trim().length >= 2 && resumeText.trim().length >= 20 && jobDescription.trim().length >= 20;
  const credits = user?.credits ?? 0;
  const currentStep = analyzeMutation.isPending ? 2 : canAnalyze ? 1 : resumeText.trim() ? 1 : 0;

  const handleFile = (file?: File) => {
    if (!file) return;
    setUploadName(file.name);
    uploadMutation.mutate(file);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create a Role-Fit Analysis"
        description="Use a real resume and a real job description to generate a professional report with match score, risks, skill gaps, and next-step actions."
      />

      <section className="mb-8 grid grid-cols-1 xl:grid-cols-4 gap-4">
        {STEP_LABELS.map((step, index) => {
          const active = index <= currentStep;
          return (
            <div key={step.title}>
              <div className="h-1 rounded-full mb-3" style={{ background: active ? 'var(--color-primary)' : 'var(--color-surface-container-highest)' }} />
              <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                {step.title}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step.subtitle}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <Card className="xl:col-span-5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="editorial-kicker mb-2">Resume Intake</p>
              <h3 className="text-xl font-bold tracking-tight">Resume input</h3>
            </div>
            <Badge variant="secondary">{uploadMutation.isPending ? 'Parsing...' : 'PDF / DOCX / TXT'}</Badge>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="rounded-[var(--radius-xl)] p-8 text-center transition-all"
            style={{
              background: isDragging ? 'var(--color-primary-subtle)' : 'var(--color-surface-container-low)',
              border: '1px dashed color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') fileInputRef.current?.click();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-primary-fixed)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>
                {uploadMutation.isPending ? 'sync' : 'upload_file'}
              </span>
            </div>
            <p className="text-base font-semibold mb-1">{uploadName || 'Drop resume here or click to upload'}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The parser extracts the text needed for real role-fit analysis.
            </p>
          </div>

          <div className="mt-5">
            <Textarea
              label="Or paste resume text"
              value={resumeText}
              onChange={(event) => setDraft({ resumeText: event.target.value })}
              className="min-h-[240px]"
              hint="Include work history, skills, and impact whenever possible."
            />
          </div>
        </Card>

        <Card className="xl:col-span-7 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="editorial-kicker mb-2">Target Role</p>
              <h3 className="text-xl font-bold tracking-tight">Job information</h3>
            </div>
            <Badge variant={credits > 0 ? 'primary' : 'warning'}>{credits} credits</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Target role"
              value={targetRole}
              onChange={(event) => setDraft({ targetRole: event.target.value })}
              placeholder="Example: Senior Python Backend Engineer"
            />
            <Textarea
              label="Job description"
              value={jobDescription}
              onChange={(event) => setDraft({ jobDescription: event.target.value })}
              className="min-h-[320px]"
              hint="The more complete the responsibilities and requirements are, the better the analysis will be."
            />
          </div>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Each analysis uses 1 credit and generates a match score, risk summary, skill gaps, and recommended next steps.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={clearDraft}>
                Clear Draft
              </Button>
              <Button loading={analyzeMutation.isPending} disabled={!canAnalyze || credits < 1} icon="auto_awesome" onClick={() => analyzeMutation.mutate()}>
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center" style={{ background: 'var(--color-primary-fixed)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>lightbulb</span>
            </div>
            <div>
              <p className="font-semibold mb-1">How to get a stronger report</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Use your latest resume and paste the full JD, including responsibilities, requirements, stack, and business context.
                The result page will turn that into a strategic report instead of a wall of generic text.
              </p>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="editorial-kicker mb-2">Quota</p>
              <h3 className="text-xl font-bold tracking-tight">Top up credits</h3>
            </div>
            {credits < 1 && <Badge variant="warning">Cannot analyze</Badge>}
          </div>

          <div className="space-y-3">
            {pricing.slice(0, 3).map((item) => (
              <div key={item.code} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{item.name}</p>
                  <span className="text-sm font-bold">CNY {item.price_cny}</span>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.description}
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={purchaseMutation.isPending}
                  onClick={() => purchaseMutation.mutate(item.code)}
                >
                  Buy {item.credits} credits
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
