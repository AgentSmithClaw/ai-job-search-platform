/** Top bar title + search placeholder per route prefix (longest match). */
const ROUTES: { prefix: string; title: string; searchPlaceholder: string }[] = [
  { prefix: '/dashboard', title: '控制台', searchPlaceholder: '搜索岗位、公司或技能…' },
  { prefix: '/resume', title: '简历中心', searchPlaceholder: '搜索简历或版本…' },
  { prefix: '/applications', title: '职位追踪', searchPlaceholder: '搜索职位机会…' },
  { prefix: '/interview', title: '面试准备', searchPlaceholder: '搜索面试题或笔记…' },
  { prefix: '/billing', title: '账单与额度', searchPlaceholder: '搜索订单…' },
  { prefix: '/settings', title: '设置', searchPlaceholder: '搜索设置项…' },
  { prefix: '/analyze', title: '岗位分析', searchPlaceholder: '搜索分析记录…' },
  { prefix: '/history', title: '分析记录', searchPlaceholder: '搜索历史报告…' },
  { prefix: '/tasks', title: '学习任务', searchPlaceholder: '搜索任务…' },
];

export function getLayoutMeta(pathname: string): { title: string; searchPlaceholder: string } {
  const hit = [...ROUTES].sort((a, b) => b.prefix.length - a.prefix.length).find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  return hit ?? { title: 'GapPilot', searchPlaceholder: '搜索…' };
}
