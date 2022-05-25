export const getUserInteractionSpanName = (
  eventType: keyof HTMLElementEventMap,
  element: HTMLElement,
): string | undefined => {
  let id = '';
  let scanElement: HTMLElement | null = element;
  while (scanElement && !id) {
    id =
      scanElement.getAttribute('aria-label') ||
      scanElement.id ||
      scanElement.textContent ||
      '';
    id = id.trim();
    scanElement = scanElement.parentElement;
  }
  if (id) {
    if (id.length > 20) {
      id = `${id.slice(0, 17)}...`;
    }
    return `${eventType} on '${id}'`;
  }
};

export const tryNumber = (input?: string | number): number | undefined => {
  if (typeof input === 'number') {
    return input;
  }
  return input != null && Number.isFinite(+input) ? +input : undefined;
};
