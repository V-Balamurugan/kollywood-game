/**
 * Universal cross-browser clipboard copy with rock-solid fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const clean = text.trim();
  if (!clean) return false;

  // 1. Modern Navigator API (Async Clipboard)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(clean);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, attempting execCommand fallback', err);
    }
  }

  // 2. Fallback using invisible textarea and execCommand('copy')
  try {
    const textarea = document.createElement('textarea');
    textarea.value = clean;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
}
