interface SkillGapTagProps {
  label: string;
}

export function SkillGapTag({ label }: SkillGapTagProps) {
  return (
    <span
      className="px-2 py-1 text-[10px] font-bold rounded border"
      style={{
        background: 'color-mix(in srgb, var(--color-tertiary) 10%, transparent)',
        color: 'var(--color-tertiary)',
        borderColor: 'color-mix(in srgb, var(--color-tertiary) 20%, transparent)',
      }}
    >
      {label}
    </span>
  );
}
