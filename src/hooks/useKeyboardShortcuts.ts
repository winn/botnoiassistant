import { useEffect, useCallback } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type ShortcutMap = Record<string, KeyHandler>;

interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  disabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: ShortcutOptions = {}
) {
  const { preventDefault = true, stopPropagation = true, disabled = false } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;

    const key = [
      e.ctrlKey ? 'Ctrl' : '',
      e.altKey ? 'Alt' : '',
      e.shiftKey ? 'Shift' : '',
      e.key
    ]
      .filter(Boolean)
      .join('+');

    const handler = shortcuts[key];
    if (handler) {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      handler(e);
    }
  }, [shortcuts, disabled, preventDefault, stopPropagation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}