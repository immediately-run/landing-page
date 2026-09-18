// useSheetDialog (R3-611 · interaction_standards R-IX-1; WCAG 2.1.1/2.1.2/2.4.3/4.1.2)
// — the sheet-dialog behaviour for a plain React site: focus moves in on open and
// returns to the invoker on close, Tab and Shift-Tab wrap within the sheet, and
// one document-level Escape listener dismisses it while it is open. This is
// R3-592's decision set (site-main's useHostDialogFocus/useHostDialogDismiss) in
// a site's own spelling — the caller owns the ref and passes it in, exactly as
// site-main's panels do — with no package dependency, because the SDK dialog
// primitive (R3-613) does not exist yet; when it ships and the pin moves past
// it, this file is deleted and both sheets import the SDK hook (the hand-off
// this file's callers name in one edit each).
//
// The dialog ATTRIBUTES (role/aria-modal/aria-label) stay literal at each call
// site: they are one line of markup the site's templates can lint and grep,
// while the BEHAVIOUR is the shared half. The effect keys on `open`, so its
// lifetime is the sheet's — the hook itself is called in an always-mounted
// parent, and the open state is what carries the sheet's lifetime.
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/** Read at keydown time, never cached: a sheet's focusable set changes while it
 * is open (the omnibox's own rows, a revealed group). */
const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The dialog behaviour for one sheet.
 *
 *   const sheetRef = useRef<HTMLDivElement | null>(null);
 *   useSheetDialog({ ref: sheetRef, open, onDismiss: close });
 *   {open && <div className="…" ref={sheetRef} role="dialog" aria-modal="true" aria-label="…">}
 *
 * `onDismiss` is read through a ref, so a new inline lambda per render does not
 * re-register the Escape listener. Focus lands on the first focusable inside the
 * sheet (both sheets' Close button is first in DOM); the invoker is recorded
 * BEFORE focus is stolen and is re-focused on close, guarded — the invoker may
 * itself have unmounted by then.
 */
export function useSheetDialog({
  ref,
  open,
  onDismiss,
}: {
  /** The sheet's root — the caller's own ref, passed in (the useHostDialogFocus shape). */
  ref: RefObject<HTMLDivElement | null>;
  /** The sheet's render state — the effect's lifetime keys on it. */
  open: boolean;
  /** Escape (and only Escape, here) — the caller's own close. */
  onDismiss: () => void;
}): void {
  // Latest-callback: the listener below always calls the CURRENT onDismiss.
  // Assigned in an effect, not during render — the React Compiler's refs rule.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;

    // Record the invoker BEFORE stealing focus — the control that opened the sheet.
    const invoker = document.activeElement as HTMLElement | null;
    const first = node.querySelector<HTMLElement>(FOCUSABLE) ?? node;
    first.focus();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;
      const list = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (list.length === 0) return;
      const active = document.activeElement;
      if (e.shiftKey && active === list[0]) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && active === list[list.length - 1]) {
        e.preventDefault();
        list[0].focus();
      }
    };
    const onEscape = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      // Layered dismissal (R-IX-1, the R3-592 stack-awareness rule): when the
      // Escape target sits inside an EXPANDED combobox — the nav sheet's
      // omnibox row, whose input carries aria-expanded — that combobox's own
      // Escape handling (closing its results) is this press's business, not
      // the sheet's. The sheet closes on the NEXT Escape, once the combobox
      // has collapsed.
      const target = e.target as HTMLElement | null;
      if (target && typeof target.closest === 'function' && target.closest('[aria-expanded="true"]')) {
        return;
      }
      dismissRef.current();
    };
    node.addEventListener('keydown', onKey);
    document.addEventListener('keydown', onEscape);

    return () => {
      node.removeEventListener('keydown', onKey);
      document.removeEventListener('keydown', onEscape);
      // The invoker may itself have unmounted by the time the sheet closes; the
      // optional chain is the whole guard.
      invoker?.focus();
    };
    // `open` is the sheet's lifetime; the ref object is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ref]);
}
