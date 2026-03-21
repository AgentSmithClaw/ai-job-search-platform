import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/Progress';

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
              Learning Progress
            </span>
            <h1 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight mt-1">
              Gap Action Dashboard
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
              Strategically bridge your expertise deficits with curated action items and elite resources.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="md">
              View History
            </Button>
            <Button variant="primary" size="md">
              <AddIcon sx={{ fontSize: 16 }} />
              New Action
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto">
        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Overall Status Card */}
          <div className="col-span-8 bg-[var(--color-surface-container-lowest)] rounded-xl p-8 shadow-[var(--shadow-xs)] border border-[var(--color-border)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-1">
                    Overall Skill Bridge Completion
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You've mastered 4 out of 12 critical gaps this quarter.
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-black text-[var(--color-primary)] tracking-tighter">68%</div>
                    <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Progress</div>
                  </div>
                  <div className="w-[360px]">
                    <ProgressBar value={68} max={100} size="md" color="primary" />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">Current: Intermediate</span>
                      <span className="text-xs font-medium text-[var(--color-primary)]">Target: Senior Lead</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-full border-8 border-[var(--color-surface-container-high)] border-t-[var(--color-primary)]">
                <TrendingUpIcon sx={{ fontSize: 40, color: 'var(--color-primary)' }} />
              </div>
            </div>
          </div>

          {/* Focus Hours Card */}
          <div className="col-span-4 bg-[var(--color-surface-container)] rounded-xl p-8 border border-[var(--color-border)] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
                Focus Hours
              </h3>
              <div className="text-4xl font-black text-[var(--color-text)] tracking-tighter">
                24.5<span className="text-base font-medium ml-1">hrs</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm">
              <TimerIcon sx={{ fontSize: 16, color: 'var(--color-primary)' }} />
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
                <div className="w-2 h-2 rounded-full bg-[var(--color-error)]" />
                <h4 className="font-bold text-[var(--color-text)] tracking-tight">Critical Needs</h4>
              </div>
              <Badge variant="error">2</Badge>
            </div>

            {/* Card: Priority */}
            <div className="bg-[var(--color-surface-container-lowest)] rounded-xl p-6 shadow-[var(--shadow-xs)] border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="error">Priority</Badge>
                <button className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
              <h5 className="font-bold text-[var(--color-text)] mb-2 leading-snug">
                Master Advanced PyTorch Architectures
              </h5>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Essential for the upcoming Senior AI Engineer role gap.
              </p>
              <a
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-border)] hover:bg-[var(--color-surface-container)] transition-colors mb-6 group/link"
                href="#"
              >
                <div className="w-8 h-8 rounded bg-[var(--color-primary-fixed-dim)] flex items-center justify-center">
                  <MenuBookIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight">Resource</p>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate">Deep Learning with PyTorch (V2)</p>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--color-text-secondary)', transition: 'transform 0.15s', '.group-hover/link &': { transform: 'translateX(3px)' } }} />
              </a>
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface-container-highest)] border-2 border-[var(--color-surface-container-low)] flex items-center justify-center text-[10px] font-bold">ML</div>
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface-container-highest)] border-2 border-[var(--color-surface-container-low)] flex items-center justify-center text-[10px] font-bold">AI</div>
                </div>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">ETA: 4 DAYS</span>
              </div>
            </div>

            {/* Card: Strategic */}
            <div className="bg-[var(--color-surface-container-lowest)] rounded-xl p-6 shadow-[var(--shadow-xs)] border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="warning">Strategic</Badge>
                <button className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
              <h5 className="font-bold text-[var(--color-text)] mb-2 leading-snug">
                System Design for Scale
              </h5>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Understanding distributed cache invalidation patterns.
              </p>
              <a
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-border)] hover:bg-[var(--color-surface-container)] transition-colors mb-6"
                href="#"
              >
                <div className="w-8 h-8 rounded bg-[var(--color-primary-fixed-dim)] flex items-center justify-center">
                  <PlayCircleOutlineIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight">Video Course</p>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate">High Scalability Design Masterclass</p>
                </div>
              </a>
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-container)] px-2 py-0.5 rounded">
                  <StarIcon sx={{ fontSize: 12, color: 'var(--color-text-secondary)', fill: 'var(--color-text-secondary)' }} />
                  Core Skill
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">ETA: 12 DAYS</span>
              </div>
            </div>
          </div>

          {/* Active Learning */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <h4 className="font-bold text-[var(--color-text)] tracking-tight">Active Learning</h4>
              </div>
              <Badge variant="primary">1</Badge>
            </div>

            {/* In-Progress Card */}
            <div className="bg-[var(--color-surface-container-lowest)] rounded-xl p-6 shadow-[var(--shadow-md)] border-2 border-[var(--color-primary)]/20 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--color-primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[var(--shadow-sm)]">
                In Progress
              </div>
              <h5 className="font-bold text-[var(--color-text)] mb-2 leading-snug mt-2">
                Kubernetes Cluster Optimization
              </h5>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Focusing on resource limits and horizontal pod autoscaling.
              </p>
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-bold text-[var(--color-primary)]">60%</span>
                </div>
                <ProgressBar value={60} max={100} size="sm" color="primary" showLabel={false} />
              </div>
              <a
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors mb-6"
                href="#"
              >
                <div className="w-8 h-8 rounded bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <LinkIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight">Documentation</p>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate">Official K8s Best Practices</p>
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
                <div className="w-2 h-2 rounded-full bg-[var(--color-outline)]" />
                <h4 className="font-bold text-[var(--color-text)] tracking-tight">Future Roadmap</h4>
              </div>
              <Badge variant="neutral">3</Badge>
            </div>

            {/* Roadmap Item 1 */}
            <div className="bg-[var(--color-surface-container-low)] rounded-xl p-6 border border-[var(--color-border)] opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <h5 className="font-bold text-[var(--color-text)] mb-2 leading-snug">
                Public Cloud FinOps Mastery
              </h5>
              <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
                Unlocks: Budget Ownership Role
              </p>
              <div className="flex items-center gap-2">
                <LockIcon sx={{ fontSize: 14, color: 'var(--color-text-secondary)' }} />
                <span className="text-xs font-medium text-[var(--color-text-secondary)] italic">
                  Waiting for Cloud Architecture completion
                </span>
              </div>
            </div>

            {/* Roadmap Item 2 */}
            <div className="bg-[var(--color-surface-container-low)] rounded-xl p-6 border border-[var(--color-border)] opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <h5 className="font-bold text-[var(--color-text)] mb-2 leading-snug">
                Advanced SQL for Analytics
              </h5>
              <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
                Skill: Data Governance
              </p>
              <div className="flex items-center gap-2">
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'var(--color-text-secondary)' }} />
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Scheduled: Q3 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <section className="mt-16 grid grid-cols-4 gap-6">
          {[
            { icon: <VerifiedUserIcon sx={{ fontSize: 24, color: 'var(--color-primary)' }} />, value: '12', label: 'Skills Validated' },
            { icon: <TimerIcon sx={{ fontSize: 24, color: 'var(--color-primary)' }} />, value: '184h', label: 'Total Learning Time' },
            { icon: <AutoAwesomeIcon sx={{ fontSize: 24, color: 'var(--color-primary)' }} />, value: 'A+', label: 'Consistency Rating' },
            { icon: <EmojiEventsIcon sx={{ fontSize: 24, color: 'var(--color-primary)' }} />, value: '04', label: 'Badges Earned' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface-container-high)] rounded-lg p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="mb-2">{stat.icon}</div>
              <p className="text-2xl font-black text-[var(--color-text)] tracking-tighter">{stat.value}</p>
              <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
