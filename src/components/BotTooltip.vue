<template>
  <!-- Bot Speech Bubble Tooltip Container - positioned inside parent -->
  <div class="bot-tooltip-container" :class="{ 'footer-hidden': !showFooter }" v-if="tooltips.length > 0">
    <transition-group name="bot-tooltip" tag="div">
      <div
        v-for="tooltip in tooltips"
        :key="tooltip.id"
        :class="[
          'bot-tooltip-wrapper',
          `position-${tooltip.position}`,
          { 'is-closing': tooltip.isClosing }
        ]"
      >
        <!-- Bot Avatar with Video -->
        <div class="bot-tooltip-avatar-wrapper">
          <div class="bot-tooltip-avatar">
            <!-- Video Avatar -->
            <video
              :src="botVideoSrc"
              class="bot-avatar-video"
              autoplay
              loop
              muted
              playsinline
            ></video>
          </div>
          <!-- Sleeping zzz animation -->
          <div v-if="tooltip.type === 'warning' || tooltip.type === 'error'" class="bot-sleeping-zzz mini">
            <span class="zzz-bubble zzz-1">z</span>
            <span class="zzz-bubble zzz-2">z</span>
            <span class="zzz-bubble zzz-3">z</span>
          </div>
        </div>
        
        <!-- Speech Bubble -->
        <div :class="['bot-tooltip-bubble', `type-${tooltip.type}`]">
          <!-- Typing Indicator -->
          <div v-if="tooltip.isTyping" class="bot-typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          
          <!-- Message Content -->
          <transition name="message-fade">
            <div v-if="tooltip.showMessage" class="bot-tooltip-message">
              {{ tooltip.message }}
            </div>
          </transition>
          
          <!-- Bubble Tail -->
          <div class="bubble-tail"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getBotTooltips } from '@/composables/useBotTooltip';

// Import bot video
import botVideoSrc from '@/assets/bots/bot2.mp4';

// Props
const props = defineProps({
  showFooter: {
    type: Boolean,
    default: true
  }
});

const tooltips = getBotTooltips();
</script>

<style scoped>
.bot-tooltip-container {
  position: absolute;
  /* Position inside chat-panel, above input-row */
  bottom: 0;
  left: 0;
  right: 0;
  /* Add padding to push tooltip above input row */
  padding: 0 10px 10px 10px;
  z-index: 10000000;
  pointer-events: none;
}

/* When footer is hidden, reduce padding */
.bot-tooltip-container.footer-hidden {
  padding-bottom: 10px;
}

.bot-tooltip-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  pointer-events: auto;
  animation: tooltipEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 8px;
}

/* Avatar Wrapper */
.bot-tooltip-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

/* Avatar */
.bot-tooltip-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bot-avatar-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mini Sleeping zzz */
.bot-sleeping-zzz.mini {
  position: absolute;
  top: -8px;
  right: -4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.bot-sleeping-zzz.mini .zzz-bubble {
  font-size: 8px;
  font-weight: bold;
  color: #667eea;
  opacity: 0;
  animation: zzzFloat 2s infinite;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bot-sleeping-zzz.mini .zzz-1 { animation-delay: 0s; }
.bot-sleeping-zzz.mini .zzz-2 { animation-delay: 0.5s; font-size: 10px; }
.bot-sleeping-zzz.mini .zzz-3 { animation-delay: 1s; font-size: 12px; }

@keyframes zzzFloat {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-12px) scale(1); }
}

/* Speech Bubble */
.bot-tooltip-bubble {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 10px 14px;
  border-radius: 16px 16px 16px 4px;
  max-width: 260px;
  min-width: 50px;
  min-height: 20px;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35);
  font-size: 13px;
  line-height: 1.45;
  font-weight: 500;
}

/* Bubble Types */
.bot-tooltip-bubble.type-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35);
}

.bot-tooltip-bubble.type-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 3px 12px rgba(56, 239, 125, 0.25);
}

.bot-tooltip-bubble.type-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 3px 12px rgba(245, 87, 108, 0.25);
}

.bot-tooltip-bubble.type-error {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  box-shadow: 0 3px 12px rgba(235, 51, 73, 0.35);
}

.bot-tooltip-bubble.type-cute {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%);
  color: #6b4c7a;
  box-shadow: 0 3px 12px rgba(255, 154, 158, 0.35);
}

/* Bubble Tail */
.bubble-tail {
  position: absolute;
  bottom: 6px;
  left: -5px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 10px 0;
  border-color: transparent #667eea transparent transparent;
}

.type-success .bubble-tail {
  border-color: transparent #11998e transparent transparent;
}

.type-warning .bubble-tail {
  border-color: transparent #f093fb transparent transparent;
}

.type-error .bubble-tail {
  border-color: transparent #eb3349 transparent transparent;
}

.type-cute .bubble-tail {
  border-color: transparent #ff9a9e transparent transparent;
}

/* Typing Indicator */
.bot-typing-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 0;
}

.bot-typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.type-cute .bot-typing-indicator .dot {
  background: rgba(107, 76, 122, 0.6);
}

.bot-typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.bot-typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
.bot-typing-indicator .dot:nth-child(3) { animation-delay: 0s; }

/* Message */
.bot-tooltip-message {
  word-break: break-word;
}

/* Animations */
@keyframes tooltipEnter {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transition Group */
.bot-tooltip-enter-active {
  animation: tooltipEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bot-tooltip-leave-active {
  animation: tooltipLeave 0.3s ease-out forwards;
}

@keyframes tooltipLeave {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px) scale(0.9);
  }
}

/* Message Fade */
.message-fade-enter-active {
  animation: messageFadeIn 0.25s ease-out;
}

@keyframes messageFadeIn {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Closing Animation */
.bot-tooltip-wrapper.is-closing {
  animation: tooltipLeave 0.3s ease-out forwards;
}
</style>
