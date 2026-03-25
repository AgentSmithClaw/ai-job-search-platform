import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { createApplication, deleteApplication, getApplications, updateApplicationStatus } from '../services/tracking';
import type { Application, ApplicationCreatePayload } from '../types';
import { formatDate } from '../utils/format';

const STATUS_META: Record<Application['status'], { label: string; badge: 'primary' | 'success' | 'warning' | 'error' | 'secondary' }> = {
  interested: { label: 'Interested', badge: 'secondary' },
  applied: { label: 'Applied', badge: 'primary' },
  interviewing: { label: 'Interviewing', badge: 'warning' },
  offer: { label: 'Offer', badge: 'success' },
  rejected: { label: 'Rejected', badge: 'error' },
  withdrawn: { label: 'Withdrawn', badge: 'secondary' },
};

function ApplicationForm({ onSubmit }: { onSubmit: (payload: ApplicationCreatePayload) => void }) {
  const [form, setForm] = useState<ApplicationCreatePayload>({
    company_name: '',
    target_role: '',
    job_description: '',
    application_url: '',
    salary_range: '',
    notes: '',
    status: 'interested',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Company" value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} />
        <Input label="Role" value={form.target_role} onChange={(event) => setForm({ ...form, target_role: event.target.value })} />
      </div>
      <Textarea label="Job description" value={form.job_description} onChange={(event) => setForm({ ...form, job_description: event.target.value })} className="min-h-[140px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Application URL" value={form.application_url} onChange={(event) => setForm({ ...form, application_url: event.target.value })} />
        <Input label="Salary range" value={form.salary_range} onChange={(event) => setForm({ ...form, salary_range: event.target.value })} />
      </div>
      <Textarea label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-[120px]" />
      <Button className="w-full" disabled={!form.company_name || !form.target_role} onClick={() => onSubmit(form)}>
        Save application
      </Button>
    </div>
  );
}

export default function ApplicationsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setOpen(false);
      addToast({ type: 'success', message: 'Application added.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not add the application.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Application['status'] }) => updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      addToast({ type: 'success', message: 'Application status updated.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not update the status.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      addToast({ type: 'success', message: 'Application removed.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not remove the application.' }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Applications"
        description="Keep your target roles, status changes, and notes in one clean place so the analysis work actually turns into a managed pipeline."
        action={
          <Button icon="add" onClick={() => setOpen(true)}>
            Add application
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading applications...
        </Card>
      ) : applications.length === 0 ? (
        <EmptyState
          icon="assignment"
          title="No applications yet"
          description="Once you find target roles worth pursuing, add them here so you can track progress and keep notes in one place."
          action={{ label: 'Add your first application', icon: 'add', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{application.target_role}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{application.company_name}</p>
                </div>
                <Badge variant={STATUS_META[application.status].badge}>{STATUS_META[application.status].label}</Badge>
              </div>

              {application.job_description && (
                <p className="text-sm line-clamp-3 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {application.job_description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="rounded-[var(--radius-xl)] p-3" style={{ background: 'var(--color-surface-container-low)' }}>
                  <p className="editorial-kicker mb-1">Created</p>
                  <p className="text-sm">{formatDate(application.created_at)}</p>
                </div>
                <div className="rounded-[var(--radius-xl)] p-3" style={{ background: 'var(--color-surface-container-low)' }}>
                  <p className="editorial-kicker mb-1">Salary</p>
                  <p className="text-sm">{application.salary_range || 'Not provided'}</p>
                </div>
              </div>

              {application.notes && (
                <div className="rounded-[var(--radius-xl)] p-3 mb-4" style={{ background: 'var(--color-surface-container-low)' }}>
                  <p className="editorial-kicker mb-1">Notes</p>
                  <p className="text-sm">{application.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={application.status}
                  onChange={(event) => updateMutation.mutate({ id: application.id, status: event.target.value as Application['status'] })}
                  className="h-10 px-3 rounded-[var(--radius-xl)] text-sm"
                  style={{
                    background: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                {application.application_url && (
                  <Button variant="secondary" icon="open_in_new" onClick={() => window.open(application.application_url, '_blank')}>
                    Open link
                  </Button>
                )}
                <Button variant="ghost" icon="delete" onClick={() => deleteMutation.mutate(application.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add application">
        <ApplicationForm onSubmit={(payload) => createMutation.mutate(payload)} />
      </Modal>
    </PageContainer>
  );
}
