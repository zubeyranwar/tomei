import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Use History',
  description:
    'An undo/redo hook for any state. Consecutive edits to the same field merge into one step, and Ctrl+Z / Ctrl+Shift+Z hotkeys are opt-in so typing in inputs keeps its native undo.',
  categories: ['hooks', 'state'],
  date: '2026-10-29',
})
