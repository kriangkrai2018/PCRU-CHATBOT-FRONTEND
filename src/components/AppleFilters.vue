<template>
  <div class="apple-filters">
    <!-- Filter Toggle Button (Mobile) -->
    <button 
      class="filter-toggle-btn d-lg-none" 
      @click="isExpanded = !isExpanded"
      :class="{ 'has-active-filters': hasActiveFilters }"
    >
      <i class="bi bi-sliders2"></i>
      <span>ตัวกรอง</span>
      <span v-if="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</span>
      <i class="bi" :class="isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- Filters Container -->
    <div class="filters-container" :class="{ 'expanded': isExpanded }">
      <!-- Sort Dropdown -->
      <div class="filter-group" v-if="showSort">
        <label class="filter-label">
          <i class="bi bi-arrow-down-up"></i>
          เรียงตาม
        </label>
        <div class="filter-dropdown">
          <select v-model="localFilters.sortBy" @change="emitChange" class="filter-select">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <i class="bi bi-chevron-down dropdown-icon"></i>
        </div>
      </div>

      <!-- Sort Order -->
      <div class="filter-group filter-group-order" v-if="showSort">
        <div class="order-toggle">
          <button 
            class="order-btn" 
            :class="{ active: localFilters.sortOrder === 'desc' }"
            @click="setSortOrder('desc')"
            title="ใหม่สุด / มากสุด"
          >
            <i class="bi bi-sort-down"></i>
          </button>
          <button 
            class="order-btn" 
            :class="{ active: localFilters.sortOrder === 'asc' }"
            @click="setSortOrder('asc')"
            title="เก่าสุด / น้อยสุด"
          >
            <i class="bi bi-sort-up"></i>
          </button>
        </div>
      </div>

      <!-- Category/Type Filter -->
      <div class="filter-group" v-if="categories && categories.length > 0">
        <label class="filter-label">
          <i class="bi bi-tag"></i>
          {{ categoryLabel }}
        </label>
        <div class="filter-dropdown">
          <select v-model="localFilters.category" @change="emitChange" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <i class="bi bi-chevron-down dropdown-icon"></i>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-group" v-if="statuses && statuses.length > 0">
        <label class="filter-label">
          <i class="bi bi-flag"></i>
          {{ statusLabel }}
        </label>
        <div class="filter-pills">
          <button 
            class="pill-btn" 
            :class="{ active: localFilters.status === '' }"
            @click="setStatus('')"
          >
            ทั้งหมด
          </button>
          <button 
            v-for="st in statuses" 
            :key="st.value"
            class="pill-btn" 
            :class="{ active: localFilters.status === st.value, [st.color || '']: true }"
            @click="setStatus(st.value)"
          >
            <i v-if="st.icon" :class="st.icon"></i>
            {{ st.label }}
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="filter-group" v-if="showDateRange">
        <label class="filter-label">
          <i class="bi bi-calendar3"></i>
          ช่วงวันที่
        </label>
        <div class="date-range-inputs">
          <div class="date-input-wrap">
            <input 
              type="date" 
              v-model="localFilters.dateFrom" 
              @change="emitChange"
              class="filter-date"
              :max="localFilters.dateTo || undefined"
            />
          </div>
          <span class="date-separator">ถึง</span>
          <div class="date-input-wrap">
            <input 
              type="date" 
              v-model="localFilters.dateTo" 
              @change="emitChange"
              class="filter-date"
              :min="localFilters.dateFrom || undefined"
            />
          </div>
        </div>
      </div>

      <!-- Quick Date Presets -->
      <div class="filter-group" v-if="showDatePresets">
        <label class="filter-label">
          <i class="bi bi-clock-history"></i>
          ช่วงเวลา
        </label>
        <div class="filter-pills">
          <button 
            type="button"
            v-for="preset in datePresets" 
            :key="preset.value"
            class="pill-btn pill-sm" 
            :class="{ active: localFilters.datePreset === preset.value }"
            @click.prevent.stop="setDatePreset(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Number Range (Min/Max) -->
      <div class="filter-group" v-if="showNumberRange">
        <label class="filter-label">
          <i class="bi bi-hash"></i>
          {{ numberRangeLabel }}
        </label>
        <div class="number-range-inputs">
          <input 
            type="number" 
            v-model.number="localFilters.minValue" 
            @input="emitChange"
            class="filter-number"
            :placeholder="minPlaceholder"
            :min="0"
          />
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model.number="localFilters.maxValue" 
            @input="emitChange"
            class="filter-number"
            :placeholder="maxPlaceholder"
            :min="localFilters.minValue || 0"
          />
        </div>
      </div>

      <!-- Custom Slot for Additional Filters -->
      <slot name="custom-filters"></slot>

      <!-- Clear Filters -->
      <div class="filter-group filter-group-actions" v-if="hasActiveFilters">
        <button class="clear-filters-btn" @click="clearFilters">
          <i class="bi bi-x-circle"></i>
          ล้างตัวกรอง
        </button>
      </div>
    </div>

    <!-- Active Filters Summary (Desktop) -->
    <div class="active-filters-summary d-none d-lg-flex" v-if="hasActiveFilters">
      <span class="summary-label">ตัวกรองที่ใช้:</span>
      <div class="active-filter-tags">
        <span 
          v-for="filter in activeFilterTags" 
          :key="filter.key" 
          class="active-tag"
          @click="removeFilter(filter.key)"
        >
          {{ filter.label }}
          <i class="bi bi-x"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  // Sort options
  showSort: { type: Boolean, default: true },
  sortOptions: {
    type: Array,
    default: () => [
      { value: 'date', label: 'วันที่' },
      { value: 'id', label: 'รหัส' },
      { value: 'name', label: 'ชื่อ' }
    ]
  },
  defaultSortBy: { type: String, default: 'date' },
  defaultSortOrder: { type: String, default: 'desc' },

  // Category filter
  categories: { type: Array, default: () => [] },
  categoryLabel: { type: String, default: 'หมวดหมู่' },

  // Status filter
  statuses: { type: Array, default: () => [] },
  statusLabel: { type: String, default: 'สถานะ' },

  // Date range
  showDateRange: { type: Boolean, default: false },
  showDatePresets: { type: Boolean, default: true },
  customDatePresets: { type: Array, default: null }, // Custom date presets array
  datePresetDirection: { type: String, default: 'past' }, // 'past' or 'future'

  // Number range
  showNumberRange: { type: Boolean, default: false },
  numberRangeLabel: { type: String, default: 'จำนวน' },
  minPlaceholder: { type: String, default: 'ต่ำสุด' },
  maxPlaceholder: { type: String, default: 'สูงสุด' },

  // Model value for v-model support
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isExpanded = ref(false);

const defaultDatePresets = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: '7 วัน' },
  { value: 'month', label: '30 วัน' },
  { value: 'quarter', label: '3 เดือน' },
  { value: 'year', label: '1 ปี' }
];

const datePresets = computed(() => props.customDatePresets || defaultDatePresets);

const localFilters = ref({
  sortBy: props.defaultSortBy,
  sortOrder: props.defaultSortOrder,
  category: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  datePreset: 'all',
  minValue: null,
  maxValue: null,
  ...props.modelValue
});

// Sync with parent's modelValue
watch(() => props.modelValue, (newVal) => {
  localFilters.value = { ...localFilters.value, ...newVal };
}, { deep: true });

const hasActiveFilters = computed(() => {
  const f = localFilters.value;
  return (
    f.category !== '' ||
    f.status !== '' ||
    f.dateFrom !== '' ||
    f.dateTo !== '' ||
    f.datePreset !== 'all' ||
    f.minValue !== null ||
    f.maxValue !== null
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  const f = localFilters.value;
  if (f.category) count++;
  if (f.status) count++;
  if (f.dateFrom || f.dateTo) count++;
  if (f.datePreset && f.datePreset !== 'all') count++;
  if (f.minValue !== null || f.maxValue !== null) count++;
  return count;
});

const activeFilterTags = computed(() => {
  const tags = [];
  const f = localFilters.value;

  if (f.category) {
    const cat = props.categories.find(c => c.value === f.category);
    tags.push({ key: 'category', label: cat?.label || f.category });
  }

  if (f.status) {
    const st = props.statuses.find(s => s.value === f.status);
    tags.push({ key: 'status', label: st?.label || f.status });
  }

  if (f.datePreset && f.datePreset !== 'all') {
    const preset = datePresets.value.find(p => p.value === f.datePreset);
    tags.push({ key: 'datePreset', label: preset?.label || f.datePreset });
  }

  if (f.dateFrom || f.dateTo) {
    const label = f.dateFrom && f.dateTo 
      ? `${f.dateFrom} - ${f.dateTo}`
      : f.dateFrom ? `ตั้งแต่ ${f.dateFrom}` : `ถึง ${f.dateTo}`;
    tags.push({ key: 'dateRange', label });
  }

  if (f.minValue !== null || f.maxValue !== null) {
    const label = f.minValue !== null && f.maxValue !== null
      ? `${f.minValue} - ${f.maxValue}`
      : f.minValue !== null ? `≥ ${f.minValue}` : `≤ ${f.maxValue}`;
    tags.push({ key: 'numberRange', label });
  }

  return tags;
});

function emitChange() {
  emit('update:modelValue', { ...localFilters.value });
  emit('change', { ...localFilters.value });
}

function setSortOrder(order) {
  localFilters.value.sortOrder = order;
  emitChange();
}

function setStatus(status) {
  localFilters.value.status = status;
  emitChange();
}

function setDatePreset(preset) {
  console.log('🔹 setDatePreset called with:', preset);
  localFilters.value.datePreset = preset;
  
  // Calculate actual date range based on preset
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  let from = '';
  let to = '';

  if (preset === 'all') {
    from = '';
    to = '';
  } else {
    if (props.datePresetDirection === 'future') {
      // Future: from Today to Future Date
      from = todayStr;
      const d = new Date(now);
      
      if (preset === 'today') {
        to = todayStr;
      } else if (preset === 'week') {
        d.setDate(d.getDate() + 7);
        to = d.toISOString().split('T')[0];
      } else if (preset === 'month') {
        d.setDate(d.getDate() + 30);
        to = d.toISOString().split('T')[0];
      } else if (preset === 'quarter') {
        d.setMonth(d.getMonth() + 3);
        to = d.toISOString().split('T')[0];
      } else if (preset === 'year') {
        d.setFullYear(d.getFullYear() + 1);
        to = d.toISOString().split('T')[0];
      }
    } else {
      // Past: from Past Date to Today (Default)
      to = todayStr;
      const d = new Date(now);

      if (preset === 'today') {
        from = todayStr;
      } else if (preset === 'week') {
        d.setDate(d.getDate() - 7);
        from = d.toISOString().split('T')[0];
      } else if (preset === 'month') {
        d.setDate(d.getDate() - 30);
        from = d.toISOString().split('T')[0];
      } else if (preset === 'quarter') {
        d.setMonth(d.getMonth() - 3);
        from = d.toISOString().split('T')[0];
      } else if (preset === 'year') {
        d.setFullYear(d.getFullYear() - 1);
        from = d.toISOString().split('T')[0];
      }
    }
  }

  localFilters.value.dateFrom = from;
  localFilters.value.dateTo = to;
  emitChange();
}

function removeFilter(key) {
  if (key === 'category') {
    localFilters.value.category = '';
  } else if (key === 'status') {
    localFilters.value.status = '';
  } else if (key === 'datePreset') {
    localFilters.value.datePreset = 'all';
    localFilters.value.dateFrom = '';
    localFilters.value.dateTo = '';
  } else if (key === 'dateRange') {
    localFilters.value.dateFrom = '';
    localFilters.value.dateTo = '';
    localFilters.value.datePreset = 'all';
  } else if (key === 'numberRange') {
    localFilters.value.minValue = null;
    localFilters.value.maxValue = null;
  }
  emitChange();
}

function clearFilters() {
  localFilters.value = {
    sortBy: props.defaultSortBy,
    sortOrder: props.defaultSortOrder,
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    datePreset: 'all',
    minValue: null,
    maxValue: null
  };
  emitChange();
}

// Expose methods for parent component
defineExpose({
  clearFilters,
  setDatePreset,
  localFilters
});
</script>

<style scoped>
.apple-filters {
  --filter-radius: 10px;
  --filter-bg: #f5f5f7;
  --filter-border: rgba(0, 0, 0, 0.06);
  --filter-active: #007aff;
  --filter-active-bg: rgba(0, 122, 255, 0.1);
  --filter-text: #1d1d1f;
  --filter-text-muted: #86868b;
  margin-bottom: 20px;
}

/* Filter Toggle (Mobile) */
.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid var(--filter-border);
  border-radius: var(--filter-radius);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--filter-text);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.filter-toggle-btn:hover {
  background: var(--filter-bg);
}

.filter-toggle-btn.has-active-filters {
  border-color: var(--filter-active);
  color: var(--filter-active);
}

.filter-count {
  background: var(--filter-active);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* Filters Container */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  padding: 16px 0;
}

@media (max-width: 991.98px) {
  .filters-container {
    display: none;
    flex-direction: column;
    align-items: stretch;
    background: white;
    border: 1px solid var(--filter-border);
    border-radius: var(--filter-radius);
    padding: 16px;
    margin-top: 12px;
  }

  .filters-container.expanded {
    display: flex;
  }
}

/* Filter Group */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}

.filter-group-order {
  min-width: auto;
}

.filter-group-actions {
  margin-left: auto;
  justify-content: flex-end;
}

@media (max-width: 991.98px) {
  .filter-group {
    width: 100%;
  }

  .filter-group-actions {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* Filter Label */
.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--filter-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-label i {
  font-size: 0.8rem;
}

/* Filter Dropdown */
.filter-dropdown {
  position: relative;
}

.filter-select {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 10px 36px 10px 14px;
  background: white;
  border: 1px solid var(--filter-border);
  border-radius: var(--filter-radius);
  font-size: 0.9rem;
  color: var(--filter-text);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: rgba(0, 0, 0, 0.15);
}

.filter-select:focus {
  outline: none;
  border-color: var(--filter-active);
  box-shadow: 0 0 0 3px var(--filter-active-bg);
}

.dropdown-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--filter-text-muted);
  pointer-events: none;
  font-size: 0.8rem;
}

/* Order Toggle */
.order-toggle {
  display: flex;
  background: var(--filter-bg);
  border-radius: var(--filter-radius);
  padding: 2px;
}

.order-btn {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--filter-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.order-btn:hover {
  color: var(--filter-text);
}

.order-btn.active {
  background: white;
  color: var(--filter-active);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Filter Pills */
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill-btn {
  padding: 8px 14px;
  background: var(--filter-bg);
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--filter-text);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pill-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.pill-btn.active {
  background: var(--filter-active);
  color: white;
}

.pill-btn.pill-sm {
  padding: 6px 10px;
  font-size: 0.8rem;
}

/* Status colors */
.pill-btn.success.active { background: #34c759; }
.pill-btn.warning.active { background: #ff9500; }
.pill-btn.danger.active { background: #ff3b30; }
.pill-btn.info.active { background: #5ac8fa; }

/* Date Range */
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input-wrap {
  flex: 1;
}

.filter-date {
  width: 100%;
  padding: 10px 12px;
  background: white;
  border: 1px solid var(--filter-border);
  border-radius: var(--filter-radius);
  font-size: 0.85rem;
  color: var(--filter-text);
  transition: all 0.2s;
}

.filter-date:focus {
  outline: none;
  border-color: var(--filter-active);
  box-shadow: 0 0 0 3px var(--filter-active-bg);
}

.date-separator {
  color: var(--filter-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

/* Number Range */
.number-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-number {
  width: 80px;
  padding: 10px 12px;
  background: white;
  border: 1px solid var(--filter-border);
  border-radius: var(--filter-radius);
  font-size: 0.9rem;
  color: var(--filter-text);
  transition: all 0.2s;
  text-align: center;
}

.filter-number:focus {
  outline: none;
  border-color: var(--filter-active);
  box-shadow: 0 0 0 3px var(--filter-active-bg);
}

.filter-number::-webkit-inner-spin-button,
.filter-number::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.range-separator {
  color: var(--filter-text-muted);
  font-size: 0.9rem;
}

/* Clear Filters */
.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--filter-border);
  border-radius: var(--filter-radius);
  font-size: 0.85rem;
  font-weight: 500;
  color: #ff3b30;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(255, 59, 48, 0.08);
  border-color: rgba(255, 59, 48, 0.3);
}

/* Active Filters Summary */
.active-filters-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  flex-wrap: wrap;
}

.summary-label {
  font-size: 0.8rem;
  color: var(--filter-text-muted);
  white-space: nowrap;
}

.active-filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--filter-active-bg);
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--filter-active);
  cursor: pointer;
  transition: all 0.2s;
}

.active-tag:hover {
  background: rgba(0, 122, 255, 0.2);
}

.active-tag i {
  font-size: 0.7rem;
}
</style>
