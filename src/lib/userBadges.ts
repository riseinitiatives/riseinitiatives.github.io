
export type BadgeType = 'dev_verified' | 'collaborator';

export const BADGE_DEFINITIONS: Record<
  BadgeType,
  { label: string; symbol: string; className: string }
> = {
  dev_verified: {
    label: 'RISE Dev Verified',
    symbol: '✓',
    className: 'dev-verified-badge',
  },
  collaborator: {
    label: 'RISE Collaborator',
    symbol: '✦',
    className: 'rise-collaborator-badge',
  },
};

export type UserBadgeMap = Map<string, BadgeType[]>;

/**
 * Load badge assignments for the supplied user IDs.
 * The existing rise_dev_verified table remains the source
 * for developer verification.
 */
export async function loadUserBadges(
  supabase: any,
  userIds: string[],
): Promise<UserBadgeMap> {
  const badges: UserBadgeMap = new Map();

  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return badges;

  const { data, error } = await supabase
    .from('rise_dev_verified')
    .select('user_id')
    .in('user_id', uniqueIds);

  if (error) {
    console.error('Could not load RISE badges:', error);
    return badges;
  }

  for (const entry of data ?? []) {
    const existing = badges.get(entry.user_id) ?? [];
    if (!existing.includes('dev_verified')) {
      badges.set(entry.user_id, [...existing, 'dev_verified']);
    }
  }

  return badges;
}

/** Render the badges for one user as safe, static HTML. */
export function renderUserBadges(
  userId: string,
  badgeMap: UserBadgeMap,
): string {
  const userBadges = badgeMap.get(userId) ?? [];

  return userBadges
    .map((type) => {
      const badge = BADGE_DEFINITIONS[type];
      if (!badge) return '';

      return `
        <span
          class="${badge.className}"
          title="${badge.label}"
          aria-label="${badge.label}"
          role="img"
        >${badge.symbol}</span>
      `;
    })
    .join('');
}
