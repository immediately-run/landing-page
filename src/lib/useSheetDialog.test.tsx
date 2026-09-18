// @vitest-environment jsdom
// R3-611 — the sheet-dialog hook's own contract, on a harness component (the
// item's three named cases, plus the latest-callback rule): the wrap list is
// READ at keydown time so a focusable added after mount is included; an invoker
// that unmounted before the sheet closes does not throw; unmount removes the
// document-level listener; Escape calls the CURRENT onDismiss. Plain expects,
// per this repo's harness.
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSheetDialog } from "./useSheetDialog";

afterEach(cleanup);

/** The harness: one invoker that OPENS the sheet (removable), and a sheet whose
 * focusable set can grow AFTER it opened — the ref-passing shape both real
 * callers use, with literal attributes at the call site. */
const Harness = ({
  onDismiss,
  withLate,
  removeInvoker,
}: {
  onDismiss: () => void;
  withLate?: boolean;
  removeInvoker?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [late, setLate] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  // The caller's onDismiss IS the close (the real shape in both sheets): the
  // harness composes it with its own state change, so Escape genuinely closes.
  useSheetDialog({
    ref: sheetRef,
    open,
    onDismiss: () => {
      setOpen(false);
      onDismiss();
    },
  });
  return (
    <div>
      {!removeInvoker && (
        <button type="button" id="invoker" onClick={() => setOpen(true)}>
          invoker
        </button>
      )}
      {open && (
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Test sheet"
        >
          <button type="button" id="close">
            Close
          </button>
          {withLate && (
            <button type="button" id="add" onClick={() => setLate(true)}>
              add
            </button>
          )}
          {withLate && late && (
            <button type="button" id="late">
              Late
            </button>
          )}
        </div>
      )}
    </div>
  );
};

describe("useSheetDialog (R3-611)", () => {
  it("the wrap includes a focusable added AFTER open — the list is read at keydown time", () => {
    render(<Harness onDismiss={() => {}} withLate />);
    // The invoker opens the sheet (and is focused — the recorded invoker).
    fireEvent.click(screen.getByRole("button", { name: "invoker" }));
    const close = screen.getByRole("button", { name: "Close" });
    expect(document.activeElement).toBe(close);
    // A focusable appears AFTER the sheet's effect ran.
    fireEvent.click(screen.getByRole("button", { name: "add" }));
    const late = screen.getByRole("button", { name: "Late" });
    late.focus();
    fireEvent.keyDown(late, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("an invoker that unmounted first does not throw on close", () => {
    const { rerender, unmount } = render(<Harness onDismiss={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "invoker" }));
    // The invoker leaves the tree while the sheet is still open...
    rerender(<Harness onDismiss={() => {}} removeInvoker />);
    // ...then the harness unmounts: the guard is the optional chain.
    expect(() => unmount()).not.toThrow();
  });

  it("closing the sheet returns focus to the invoker", () => {
    render(<Harness onDismiss={() => {}} />);
    const invoker = screen.getByRole("button", { name: "invoker" });
    // jsdom's synthetic click does not focus the button — the real invoker is
    // focused when it opens the sheet, so the test focuses it first.
    invoker.focus();
    fireEvent.click(invoker);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close" }),
    );
    // Escape closes (the caller's onDismiss — here composed with the state
    // change), and the teardown returns focus to the invoker.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(invoker);
  });

  it("unmount removes the document-level listener", () => {
    const spy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Harness onDismiss={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "invoker" }));
    unmount();
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
    spy.mockRestore();
  });

  it("Escape calls the CURRENT onDismiss, not the one from open", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<Harness onDismiss={first} />);
    fireEvent.click(screen.getByRole("button", { name: "invoker" }));
    // The caller re-renders with a new inline lambda (the near-universal shape).
    rerender(<Harness onDismiss={latest} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });
});
