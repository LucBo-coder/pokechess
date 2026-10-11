// =============================================
// ASTRAL PASSIVE MATRIX REGISTRY
// Central registry for Core + 18 Elemental Trees
// =============================================

'use strict';

if (typeof window !== 'undefined') {
  window.TREE_REGISTRY = window.TREE_REGISTRY || {};
} else if (typeof globalThis !== 'undefined') {
  globalThis.TREE_REGISTRY = globalThis.TREE_REGISTRY || {};
}

if (typeof module !== 'undefined') {
  module.exports = (typeof window !== 'undefined' ? window.TREE_REGISTRY : globalThis.TREE_REGISTRY);
}
