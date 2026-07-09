// ──────────────────────────────────────────────
// EVGuard — UI Store (Zustand)
// ──────────────────────────────────────────────

import { create } from "zustand";

const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isPipelineDropdownOpen: false,
  activeSection: null,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  togglePipelineDropdown: () =>
    set((state) => ({
      isPipelineDropdownOpen: !state.isPipelineDropdownOpen,
    })),

  closePipelineDropdown: () => set({ isPipelineDropdownOpen: false }),

  setActiveSection: (section) => set({ activeSection: section }),
}));

export default useUIStore;
