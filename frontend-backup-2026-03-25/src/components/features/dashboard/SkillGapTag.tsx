interface SkillGapTagProps {
  label: string;
}

export function SkillGapTag({ label }: SkillGapTagProps) {
  return (
    <span
      className="px-2 py-1 text-[10px] font-bold rounded border"
      style={{
        background: 'rgba(126,48,0,0.1)',
        color: 'var(--color-tertiary)',
        borderColor: 'rgba(126,48,0,0.2)',
      }}
    >
      {label}
    </span>
  );
}
