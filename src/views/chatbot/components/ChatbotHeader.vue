<template>
  <div>
    <!-- Snowflakes -->
    <div v-if="isWinterSeason && snowEnabled" class="snowflakes" aria-hidden="true">
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
    </div>
    <div class="panel-top">
      <button class="close-circle" @click="$emit('close')" aria-label="close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="close-icon">
          <path class="close-line-1" d="M6 6L18 18" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="close-line-2" d="M6 18L18 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button v-if="hasMessages" class="clear-chat-btn" @click="$emit('clear')" aria-label="clear chat" title="ล้างประวัติการสนทนา">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="trash-icon">
          <path class="trash-lid" d="M3 6h18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="trash-body" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="trash-handle" d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatbotHeader',
  props: {
    isWinterSeason: { type: Boolean, default: false },
    snowEnabled: { type: Boolean, default: true },
    hasMessages: { type: Boolean, default: false }
  },
  emits: ['close', 'clear']
}
</script>
