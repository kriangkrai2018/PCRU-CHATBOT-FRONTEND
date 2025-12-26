<template>
  <button v-if="!visible" class="fab-open" @click="$emit('open')" aria-label="open chat">
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="fab-icon" aria-hidden="true" focusable="false">
      <path class="fab-bubble" fill="white" d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z"/>
      <circle class="fab-pulse" cx="8" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle class="fab-pulse" cx="12" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle class="fab-pulse" cx="16" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
      </circle>
    </svg>
  </button>
</template>

<script>
export default {
  name: 'ChatbotFab',
  props: { visible: { type: Boolean, default: false } },
  emits: ['open']
}
</script>
