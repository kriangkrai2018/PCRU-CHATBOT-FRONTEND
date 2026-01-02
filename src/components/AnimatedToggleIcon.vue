<template>
  <svg
    class="animated-toggle-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Hamburger menu lines (show when closed) -->
    <line
      class="line line-menu-1"
      :class="{ 'open': isOpen }"
      x1="3"
      y1="6"
      x2="21"
      y2="6"
    />
    <line
      class="line line-menu-2"
      :class="{ 'open': isOpen }"
      x1="3"
      y1="12"
      x2="21"
      y2="12"
    />
    <line
      class="line line-menu-3"
      :class="{ 'open': isOpen }"
      x1="3"
      y1="18"
      x2="21"
      y2="18"
    />
    <!-- X lines (show when open) -->
    <line
      class="line line-x-1"
      :class="{ 'open': isOpen }"
      x1="5"
      y1="5"
      x2="19"
      y2="19"
    />
    <line
      class="line line-x-2"
      :class="{ 'open': isOpen }"
      x1="5"
      y1="19"
      x2="19"
      y2="5"
    />
  </svg>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  size: {
    type: [String, Number],
    default: 24
  }
});
</script>

<style scoped>
.animated-toggle-icon {
  display: inline-block;
  vertical-align: middle;
}

.line {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hamburger menu lines - visible when closed */
.line-menu-1,
.line-menu-2,
.line-menu-3 {
  opacity: 1;
}

.line-menu-1.open,
.line-menu-2.open,
.line-menu-3.open {
  opacity: 0;
}

/* X lines - hidden when closed */
.line-x-1,
.line-x-2 {
  opacity: 0;
}

.line-x-1.open,
.line-x-2.open {
  opacity: 1;
}
</style>
