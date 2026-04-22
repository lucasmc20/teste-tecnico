export const safeRedirectPath = (value: string | null | undefined): string => {
  if (!value) return '/';
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//')) return '/';
  return value;
};
