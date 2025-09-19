export function parseCollectionSlug(slug: string | null | undefined) {
  const VIRTUAL_CATEGORIES = ['nyheter'];

  if (!slug) {
    return {
      actualCategory: null,
      isNewOnly: false,
    };
  }

  const isVirtual = VIRTUAL_CATEGORIES.includes(slug);

  const filterParams = {
    actualCategory: isVirtual ? null : slug,
    isNewOnly: false,
  };

  if (slug === 'nyheter') {
    filterParams.isNewOnly = true;
  }

  return filterParams;
}
