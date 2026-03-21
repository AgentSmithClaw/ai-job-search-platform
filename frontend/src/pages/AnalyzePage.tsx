import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { StepIndicator } from '../components/ui/Progress';
import { useDraftStore, useToastStore, useAuthStore } from '../store';
import { uploadResume, analyze } from '../services/analysis';

const steps = [
  { id: 1, label: '上传简历' },
  { id: 2, label: '输入 JD' },
  { id: 3, label: '确认分析' },
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

  // Auto-save draft
  const handleDraftChange = useCallback((updates: Partial<typeof useDraftStore.getState>) => {
    setDraft(updates);
  }, [setDraft]);

  // Upload resume
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

  // Analyze
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
    <PageContainer>
      <PageHeader
        title="新建分析"
        description="上传简历 + 粘贴 JD，AI 自动完成差距分析"
      />

      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Step 0: Upload Resume */}
        {currentStep === 0 && (
          <Card className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-1">上传简历</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">支持 PDF、Word、TXT 格式，或直接粘贴简历文本</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="text-sm font-semibold mb-2 block">📄 上传文件</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`
                    border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${uploadStatus === 'uploading' ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]' : ''}
                    ${uploadStatus === 'success' ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]' : ''}
                    ${uploadStatus === 'error' ? 'border-[var(--color-error)] bg-[var(--color-error-subtle)]' : ''}
                    ${uploadStatus === 'idle' ? 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg-subtle)]' : ''}
                  `}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadStatus === 'uploading' && (
                    <>
                      <Loader size={32} className="mx-auto mb-3 text-[var(--color-primary)] animate-spin" />
                      <p className="text-sm font-medium text-[var(--color-primary)]">正在解析...</p>
                    </>
                  )}
                  {uploadStatus === 'success' && (
                    <>
                      <CheckCircle size={32} className="mx-auto mb-3 text-[var(--color-success)]" />
                      <p className="text-sm font-medium text-[var(--color-success)]">解析成功</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{parsedResume.slice(0, 60)}...</p>
                    </>
                  )}
                  {uploadStatus === 'error' && (
                    <>
                      <AlertCircle size={32} className="mx-auto mb-3 text-[var(--color-error)]" />
                      <p className="text-sm font-medium text-[var(--color-error)]">{uploadError}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">点击重试</p>
                    </>
                  )}
                  {uploadStatus === 'idle' && (
                    <>
                      <Upload size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">拖拽或点击上传</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">PDF / Word / TXT</p>
                    </>
                  )}
                </div>
              </div>

              {/* Text Paste */}
              <div>
                <label className="text-sm font-semibold mb-2 block">📝 或粘贴简历</label>
                <Textarea
                  value={resumeText}
                  onChange={(e) => {
                    setDraft({ resumeText: e.target.value });
                    if (e.target.value.length > 50) setUploadStatus('success');
                  }}
                  placeholder="粘贴简历内容..."
                  className="min-h-[180px]"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={goNext}
                disabled={!canProceedStep0}
                size="lg"
              >
                下一步 <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 1: JD Input */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-1">输入岗位 JD</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">复制目标岗位的 JD 描述，获得精准分析</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="目标岗位"
                  value={targetRole}
                  onChange={(e) => handleDraftChange({ targetRole: e.target.value })}
                  placeholder="例如：前端工程师 / AI 产品经理"
                />
                <Input
                  label="公司名称（可选）"
                  value={company}
                  onChange={(e) => handleDraftChange({ company: e.target.value })}
                  placeholder="例如：字节跳动"
                />
              </div>
              <Textarea
                label="职位描述 JD"
                value={jobDescription}
                onChange={(e) => handleDraftChange({ jobDescription: e.target.value })}
                placeholder="粘贴目标岗位的完整 JD 内容..."
                maxChars={5000}
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={goBack}>← 上一步</Button>
              <Button
                onClick={goNext}
                disabled={!canProceedStep1}
                size="lg"
              >
                下一步 <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Confirm */}
        {currentStep === 2 && (
          <Card className="animate-fade-in">
            <h2 className="text-lg font-semibold mb-1">确认并分析</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">确认信息无误后，点击开始分析</p>

            <div className="space-y-4 mb-6">
              <div className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">{targetRole}</p>
                {company && <p className="text-xs text-[var(--color-text-secondary)]">{company}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-[var(--color-text-secondary)] mb-1">简历内容</p>
                  <p className="text-[var(--color-text-tertiary)]">{resumeText.length} 字符</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-secondary)] mb-1">JD 内容</p>
                  <p className="text-[var(--color-text-tertiary)]">{jobDescription.length} 字符</p>
                </div>
              </div>
            </div>

            {user && user.credits <= 0 && (
              <div className="bg-[var(--color-warning-subtle)] border border-[var(--color-warning)]/20 rounded-[var(--radius-md)] p-4 mb-4">
                <p className="text-sm text-[var(--color-warning)] font-medium">⚠️ 额度不足</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">当前剩余 {user.credits} 次分析额度</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={goBack}>← 上一步</Button>
              <Button
                onClick={handleSubmit}
                isLoading={analyzeMutation.isPending}
                size="lg"
              >
                🚀 开始分析
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
