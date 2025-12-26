<template>
  <div class="report-search" :style="{ maxWidth: maxWidth }">
    <div class="apple-search-inner" :class="{ 'align-right': align === 'right' }">
      <div class="search-icon-wrapper" aria-hidden="true">
        <i class="bi bi-search"></i>
      </div>

      <input
        ref="inputEl"
        :placeholder="placeholder"
        class="apple-search-input"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.esc="clearAndBlur"
      />

      <button
        v-if="modelValue"
        class="search-clear-btn"
        @click="clear"
        aria-label="ล้างการค้นหา"
        title="ล้าง"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'ค้นหา...' },
  maxWidth: { type: String, default: '520px' },
  align: { type: String, default: 'right' },
});
const emit = defineEmits(['update:modelValue']);

const inputEl = ref(null);

function clear() {
  emit('update:modelValue', '');
  // preserve focus so user can keep typing
  inputEl.value?.focus();
}
function clearAndBlur() {
  emit('update:modelValue', '');
  inputEl.value?.blur();
}

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    inputEl.value?.focus();
  }
  if (e.key === 'Escape' && document.activeElement !== inputEl.value) {
    // clear only if not currently focused on input
    emit('update:modelValue', '');
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
});
</script>

<style scoped>
.report-search { width: 100%; }
.apple-search-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  box-shadow: 0 6px 20px rgba(14,20,30,0.06);
  border: 1px solid rgba(14,20,30,0.06);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.apple-search-inner.align-right { margin-left: auto; }
.apple-search-inner:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(14,20,30,0.10);
}
.search-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  color: #6c757d;
  font-size: 16px;
  flex: 0 0 36px;
}
.apple-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #0b1220;
  padding: 6px 0;
  width: 100%;
}
.apple-search-input::placeholder { color: #9aa0a6; }
.search-clear-btn {
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(11,18,32,0.04);
  color: #6c757d;
  cursor: pointer;
  flex: 0 0 34px;
  transition: background 120ms ease, transform 120ms ease;
}
.search-clear-btn:hover { background: rgba(11,18,32,0.08); transform: translateY(-2px); }
.search-clear-btn:active { transform: translateY(0); }
</style>
