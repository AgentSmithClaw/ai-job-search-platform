import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';

export default function TasksPage() {
  return (
    <PageContainer>
      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        {/* Overall Status Card */}
        <div
          className="col-span-12 lg:col-span-8 rounded-xl p-8 relative overflow-hidden"
          style={{
            background: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              top: 0,
              right: 0,
              width: 256,
              height: 256,
              background: 'var(--color-primary)',
              opacity: 0.05,
              marginRight: -80,
              marginTop: -80,
            }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  Overall Skill Bridge Completion
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  You've mastered 4 out of 12 critical gaps this quarter.
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black tracking-tighter" style={{ color: 'var(--color-primary)' }}>68%</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Total Progress</div>
                </div>
                <div style={{ width: 360 }}>
                  <ProgressBar value={68} max={100} size="md" color="primary" />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Current: Intermediate</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Target: Senior Lead</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="hidden lg:flex items-center justify-center rounded-full"
              style={{
                width: 128,
                height: 128,
                borderWidth: 8,
                borderStyle: 'solid',
                borderColor: 'var(--color-surface-container-high)',
                borderTopColor: 'var(--color-primary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-primary)' }}>trending_up</span>
            </div>
          </div>
        </div>

        {/* Focus Hours Card */}
        <div
          className="col-span-12 lg:col-span-4 rounded-xl p-8 flex flex-col justify-between"
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Focus Hours
            </h3>
            <div className="text-4xl font-black tracking-tighter" style={{ color: 'var(--color-text)' }}>
              24.5<span className="text-base font-medium ml-1">hrs</span>
            </div>
          </div>
          <div
            className="mt-4 pt-4 flex items-center gap-2 font-bold text-sm"
            style={{ color: 'var(--color-primary)', borderTop: '1px solid var(--color-border)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>timer</span>
            3.2h left for weekly goal
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-8">
        {/* Critical Needs */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-error)' }} />
              <h4 className="font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Critical Needs</h4>
            </div>
            <Badge variant="error">2</Badge>
          </div>

          {/* Priority Card */}
          <div
            className="rounded-xl p-6 hover:shadow-[var(--shadow-md)] transition-shadow group"
            style={{
              background: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <Badge variant="error">Priority</Badge>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
              </button>
            </div>
            <h5 className="font-bold mb-2 leading-snug" style={{ color: 'var(--color-text)' }}>
              Master Advanced PyTorch Architectures
            </h5>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Essential for the upcoming Senior AI Engineer role gap.
            </p>
            <a
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-[var(--color-surface-container)] transition-colors mb-6 group/link"
              href="#"
              style={{
                background: 'var(--color-surface-container-low)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: 'var(--color-primary-fixed-dim)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>menu_book</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>Resource</p>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>Deep Learning with PyTorch (V2)</p>
              </div>
              <span className="material-symbols-outlined transition-transform" style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>arrow_forward</span>
            </a>
            <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex -space-x-2">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: 'var(--color-surface-container-highest)',
                    borderColor: 'var(--color-surface-container-low)',
                  }}
                >
                  ML
                </div>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: 'var(--color-surface-container-highest)',
                    borderColor: 'var(--color-surface-container-low)',
                  }}
                >
                  AI
                </div>
              </div>
              <span className="text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>ETA: 4 DAYS</span>
            </div>
          </div>

          {/* Strategic Card */}
          <div
            className="rounded-xl p-6 hover:shadow-[var(--shadow-md)] transition-shadow group"
            style={{
              background: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <Badge variant="warning">Strategic</Badge>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
              </button>
            </div>
            <h5 className="font-bold mb-2 leading-snug" style={{ color: 'var(--color-text)' }}>
              System Design for Scale
            </h5>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Understanding distributed cache invalidation patterns.
            </p>
            <a
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-[var(--color-surface-container)] transition-colors mb-6"
              href="#"
              style={{
                background: 'var(--color-surface-container-low)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: 'var(--color-primary-fixed-dim)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>play_circle</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>Video Course</p>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>High Scalability Design Masterclass</p>
              </div>
            </a>
            <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span
                className="flex items-center gap-1 text-[11px] font-bold rounded px-2 py-0.5"
                style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-container)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>star</span>
                Core Skill
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>ETA: 12 DAYS</span>
            </div>
          </div>
        </div>

        {/* Active Learning */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
              <h4 className="font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Active Learning</h4>
            </div>
            <Badge variant="primary">1</Badge>
          </div>

          {/* In-Progress Card */}
          <div
            className="rounded-xl p-6 relative"
            style={{
              background: 'var(--color-surface-container-lowest)',
              border: '2px solid rgba(53,37,205,0.2)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              className="absolute rounded-full shadow-sm px-3 py-1 text-[11px] font-black uppercase tracking-widest"
              style={{
                top: -12,
                left: 24,
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              In Progress
            </div>
            <h5 className="font-bold mb-2 leading-snug mt-2" style={{ color: 'var(--color-text)' }}>
              Kubernetes Cluster Optimization
            </h5>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Focusing on resource limits and horizontal pod autoscaling.
            </p>
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>60%</span>
              </div>
              <ProgressBar value={60} max={100} size="sm" color="primary" showLabel={false} />
            </div>
            <a
              className="flex items-center gap-3 p-3 rounded-lg border hover:border-[var(--color-primary)]/30 transition-colors mb-6"
              href="#"
              style={{
                background: 'var(--color-surface-container)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: 'rgba(53,37,205,0.1)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>link</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>Documentation</p>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>Official K8s Best Practices</p>
              </div>
            </a>
            <Button variant="primary" className="w-full">
              Continue Study
            </Button>
          </div>
        </div>

        {/* Future Roadmap */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-outline)' }} />
              <h4 className="font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Future Roadmap</h4>
            </div>
            <Badge variant="neutral">3</Badge>
          </div>

          {/* Roadmap Item 1 */}
          <div
            className="rounded-xl p-6 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h5 className="font-bold mb-2 leading-snug" style={{ color: 'var(--color-text)' }}>
              Public Cloud FinOps Mastery
            </h5>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Unlocks: Budget Ownership Role
            </p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>lock</span>
              <span className="text-xs font-medium italic" style={{ color: 'var(--color-text-secondary)' }}>
                Waiting for Cloud Architecture completion
              </span>
            </div>
          </div>

          {/* Roadmap Item 2 */}
          <div
            className="rounded-xl p-6 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h5 className="font-bold mb-2 leading-snug" style={{ color: 'var(--color-text)' }}>
              Advanced SQL for Analytics
            </h5>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Skill: Data Governance
            </p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>calendar_today</span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Scheduled: Q3 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <section className="mt-16 grid grid-cols-4 gap-6">
        {[
          { icon: 'verified_user', value: '12', label: 'Skills Validated' },
          { icon: 'timer', value: '184h', label: 'Total Learning Time' },
          { icon: 'auto_awesome', value: 'A+', label: 'Consistency Rating' },
          { icon: 'emoji_events', value: '04', label: 'Badges Earned' },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-lg p-6 flex flex-col items-center justify-center text-center"
            style={{ background: 'var(--color-surface-container-high)' }}
          >
            <div className="mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-primary)' }}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-black tracking-tighter" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </section>
    </PageContainer>
  );
}
