<template>
  <div class="chat-root" data-bs-no-js="true">
    <!-- Theme transition circle overlay -->
    <div 
      v-if="showThemeTransition" 
      class="theme-transition-circle"
      :style="{ width: themeTransitionSize + 'px', height: themeTransitionSize + 'px' }"
    ></div>

    <!-- overlay + drawer container -->
    <transition name="fade" @enter="animateOpen" @leave="animateClose">
      <div v-if="visible" class="chat-overlay" role="dialog" aria-label="Chat drawer">
        <div class="overlay-backdrop" @click="visible = false"></div>
        
        <!-- Snowflakes - positioned to match chat-panel bounds -->
        <div v-if="isWinterSeason && snowEnabled" class="snowflakes-container" :style="{ width: drawerWidth, height: viewportHeight }" aria-hidden="true">
          <div 
            v-for="(flake, i) in snowflakeStyles" 
            :key="i" 
            class="snowflake"
            :class="{ 'snowflake-dragging': draggedSnowflakeIndex === i }"
            :style="getSnowflakeStyle(flake, i)"
            @mousedown.stop.prevent="onSnowflakeMouseDown($event, i)"
            @touchstart.stop.prevent="onSnowflakeTouchStart($event, i)"
            v-show="!isSnowflakeFloating(i)"
          >
            {{ flake.symbol }}
          </div>
        </div>
        
        <!-- Dragged/Falling snowflakes rendered OUTSIDE container to avoid overflow:hidden clipping -->
        <template v-if="isWinterSeason && snowEnabled">
          <div 
            v-for="(flake, i) in snowflakeStyles"
            :key="'float-' + i"
            v-show="isSnowflakeFloating(i)"
            class="snowflake snowflake-floating"
            :class="{ 'snowflake-dragging': draggedSnowflakeIndex === i }"
            :style="getFloatingSnowflakeStyle(flake, i)"
          >
            {{ flake.symbol }}
          </div>
        </template>
        
        <aside class="chat-panel" :style="{ width: drawerWidth, height: viewportHeight }">
          <div class="panel-top">
            <button class="close-circle" @click="visible = false" aria-label="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="close-icon">
                <!-- Line 1 with bold animations -->
                <path class="close-line-1" d="M6 6L18 18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
                  <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" fill="freeze"/>
                  <animate attributeName="stroke-width" values="3;4;3" dur="0.6s" repeatCount="indefinite" begin="0.3s"/>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                </path>
                <!-- Line 2 with bold animations -->
                <path class="close-line-2" d="M6 18L18 6" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
                  <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.15s" fill="freeze"/>
                  <animate attributeName="stroke-width" values="3;4;3" dur="0.6s" repeatCount="indefinite" begin="0.3s"/>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                </path>
              </svg>
            </button>
            <button v-if="showClearBtn" class="clear-chat-btn" @click="clearChatHistory" aria-label="clear chat" title="ล้างประวัติการสนทนา">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="trash-icon">
                <path class="trash-lid" d="M3 6h18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
                  <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" fill="freeze"/>
                </path>
                <path class="trash-body" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" stroke-dashoffset="60">
                  <animate attributeName="stroke-dashoffset" to="0" dur="0.4s" begin="0.2s" fill="freeze"/>
                </path>
                <path class="trash-handle" d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="30" stroke-dashoffset="30">
                  <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.1s" fill="freeze"/>
                </path>
              </svg>
            </button>

            <!-- Theme toggle button -->
            <button class="theme-toggle-btn" :class="{ expanded: isExpanded }" @click.stop="toggleTheme" :title="getThemeButtonTitle()" :aria-pressed="theme === 'dark'">
              <div class="icon-wrapper">
                <!-- Sun when dark (toggle to auto) -->
                <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="sun-icon">
                  <circle cx="12" cy="12" r="4" fill="#FFD54F">
                    <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <g stroke="#FFD54F" stroke-width="1.6" stroke-linecap="round">
                    <path d="M12 2v2">
                      <animate attributeName="d" values="M12 2v2;M12 1.5v3;M12 2v2" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M12 20v2">
                      <animate attributeName="d" values="M12 20v2;M12 19.5v3;M12 20v2" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M2 12h2">
                      <animate attributeName="d" values="M2 12h2;M1.5 12h3;M2 12h2" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M20 12h2">
                      <animate attributeName="d" values="M20 12h2;M19.5 12h3;M20 12h2" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M4.9 4.9l1.4 1.4" />
                    <path d="M17.7 17.7l1.4 1.4" />
                    <path d="M4.9 19.1l1.4-1.4" />
                    <path d="M17.7 6.3l1.4-1.4" />
                  </g>
                </svg>
                <!-- Moon when light (toggle to dark) -->
                <svg v-else-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="moon-icon">
                  <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" fill="#000000">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite"/>
                  </path>
                  <circle cx="15" cy="8" r="0.8" fill="#FFD54F" opacity="0.6">
                    <animate attributeName="cy" values="8;7;8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <!-- Auto icon when auto (toggle to light) -->
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="auto-icon">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none">
                    <animate attributeName="r" values="9;10;9" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="stroke-width" values="1.5;1;1.5" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="12" cy="12" r="2" fill="currentColor">
                    <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <animate attributeName="stroke-width" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </div>
              <span class="theme-label">{{ themeDisplayOnly }}</span>
            </button>
            

            <div class="overlay-backdrop-2"></div>
          </div>

          <div class="panel-body" :class="{ 'anchor-bottom': anchorBottom }" @scroll="handleScroll" ref="panelBody">
            <!-- Scroll to Top Button -->
            <transition name="fade-scale">
              <button v-if="showScrollTop" class="scroll-to-top-btn" @click="scrollToTop" aria-label="scroll to top">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="scroll-icon">
                  <path class="scroll-arrow" d="M12 19V5M5 12l7-7 7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" stroke-dashoffset="40">
                    <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
                  </path>
                </svg>
              </button>
            </transition>
            


            <!-- Chat Messages Area (always rendered so welcome content can show on first open) -->
            <div class="chat-messages" ref="messagesContainer">
              <!-- Welcome Bot Message with Categories -->
              <div class="welcome-message">
                <!-- Top welcome typing placeholder removed — use a temporary bottom typing message inside `messages` instead -->
                
                <div v-if="showTopCategories" class="message-wrapper bot">
                  <div class="bot-avatar-wrapper">
                    <div class="bot-avatar" role="button" tabindex="0" @click="openAiIntro" title="เปิด AI เต็มจอ">
                      <img :src="botAvatar" alt="Bot" class="bot-avatar-img" />
                      <!-- 💤 Sleeping zzz - show only if no messages (last avatar) -->
                      <transition name="zzz-fade">
                        <div v-if="isBotSleeping && messages.length === 0" class="bot-sleeping-zzz">
                          <span class="zzz-bubble zzz-1">z</span>
                          <span class="zzz-bubble zzz-2">z</span>
                          <span class="zzz-bubble zzz-3">z</span>
                        </div>
                      </transition>
                      <!-- ✨ Wake up animation - show only if no messages (last avatar) -->
                      <transition name="wake-up-fade">
                        <div v-if="isBotWakingUp && messages.length === 0" class="bot-wake-up">
                          <span class="sparkle sparkle-1">✨</span>
                          <span class="sparkle sparkle-2">✨</span>
                          <span class="sparkle sparkle-3">✨</span>
                        </div>
                      </transition>
                    </div>
                  </div>
                  <div class="message-bubble bot bot-with-categories" style="margin-top: 3rem !important;">
                    <div class="ai-greeting">
                      <div class="ai-greet-img-wrapper" role="button" tabindex="0" @click.stop="openAiIntro" @keydown.enter.stop="openAiIntro" @keydown.space.prevent.stop="openAiIntro" title="เปิด AI: ดูรายละเอียดและวิธีใช้งาน" aria-label="เปิด AI">
                        <img :src="botAvatar" alt="PCRU AI" class="ai-greet-img" />
                        <!-- Floating speech bubble on avatar -->
                        <transition name="bubble-fade">
                          <div v-if="showThaiNotice" class="ai-speech-bubble">
                            <div class="bubble-content">
                              <div>{{ timeGreetingText }}</div>
                            </div>
                            <div class="bubble-tail"></div>
                          </div>
                        </transition>
                      </div>
                      <div class="ai-greet-title text-center" v-html="welcomeTitle"></div>
                      <div class="ai-greet-sub" v-html="welcomeSub"></div>

                      <!-- Direct help button: opens help modal without opening AI Intro -->
                      <div class="ai-help-link-wrapper text-center">
                        <button v-if="!miniHelpDismissed" ref="miniHelpBtn" class="ai-help-link apple-help-mini" @click.stop="triggerMiniHelp" @keydown.enter.prevent.stop="triggerMiniHelp" @keydown.space.prevent.stop="triggerMiniHelp" aria-label="ดูวิธีใช้งาน Bot">
                          <div class="help-btn-ripple"></div>
                          <svg class="help-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                            <circle class="help-circle" cx="12" cy="12" r="9" />
                            <path class="help-question" d="M9.5 9.2a2.5 2.5 0 1 1 4 1.8c0 2-2 2.6-2 2.6" />
                            <line class="help-dot" x1="12" y1="16" x2="12" y2="16" />
                          </svg>
                          <span class="help-btn-text">ดูวิธีใช้งาน</span>
                          <!-- interactive close badge placed inside button so it moves with it; handlers stop propagation -->
                          <span
                            class="mini-help-close"
                            role="button"
                            tabindex="0"
                            aria-label="ปิดปุ่มดูวิธีใช้งาน"
                            @click.stop="dismissMiniHelp"
                            @keydown.enter.prevent.stop="dismissMiniHelp"
                            @keydown.space.prevent.stop="dismissMiniHelp"
                          >
                            ×
                          </span>
                        </button>
                      </div>
                    </div>
                    <div class="message-text text-center" style="margin-bottom: 1.5rem" v-html="welcomeInstruction"></div>
                    
                    <!-- Categories inside bot message -->
                    <div class="category-section">
                      <div class="category-title no-underline">หมวดหมู่</div>

                      <div v-if="loading" class="py-5 text-center">
                        <div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Loading...</span></div>
                      </div>

                      <div v-else-if="loadError" class="py-4 text-center text-danger">{{ loadError }}</div>

                      <div v-else>
                        <div v-if="!displayedCategories || displayedCategories.length === 0" class="py-4 text-center text-muted">
                          ไม่พบหมวดหมู่
                        </div>
                        <div v-else-if="displayedCategories.every(c => !c.items || c.items.length === 0)" class="py-4 text-center text-muted">
                          กำลังโหลดหมวดหมู่...
                        </div>
                        <transition name="cat-pop" v-for="(cat, idx) in (displayedCategories || [])" :key="idx">
                          <div class="cat-item">
                          <button
                            class="cat-toggle"
                            @click="cat.items && cat.items.length > 0 ? toggle(idx, $event) : selectCategoryItem(cat.title, idx, null, $event)"
                            :aria-expanded="cat.items && cat.items.length > 0 ? openIndexes.includes(idx) : false"
                          >
                            <span class="cat-text no-underline">{{ cat.title }}</span>
                            <svg
                              v-if="cat.items && cat.items.length"
                              class="chev"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 9l6 6 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </button>

                          <transition name="collapse">
                            <ul v-show="openIndexes.includes(idx)" class="cat-list">
                              <li v-for="(item,j) in cat.items" :key="j" class="cat-sub">
                                <button
                                  type="button"
                                  class="cat-sub-btn"
                                  :class="{ disabled: (typeof item === 'object' && item._disabled) }"
                                  :disabled="typeof item === 'object' && item._disabled"
                                  @click="selectCategoryItem(item, idx, j, $event)"
                                  :aria-label="`เลือก ${ typeof item === 'string' ? item : (item.label || item.text || '') }`"
                                >
                                  <span class="cat-sub-text no-underline">{{ j+1 }}. {{ typeof item === 'string' ? item : (item.label || item.text || '') }}</span>
                                  <!-- small chevron to indicate clickability -->
                                  <svg class="cat-sub-icon" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                    <path d="M8 5l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                </button>
                              </li>
                            </ul>
                          </transition>
                        </div>
                      </transition>
                        
                        <!-- Read More Button -->
                        <transition name="expandButton">
                          <button
                            v-if="!showAllCategories && categories && categories.length > 3"
                            class="read-more-btn"
                            @click="showAllCategories = true"
                          >
                            <span class="read-more-text">ดูเพิ่มเติม</span>
                            <svg class="read-more-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </button>
                        </transition>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <transition-group name="message-pop" tag="div" class="message-list">
                <div v-for="(msg, idx) in messages" :key="msg.id || idx" class="message-wrapper" :class="[msg.type, { typing: !!msg.typing }]">
                <div v-if="msg.type === 'bot'" class="bot-avatar-wrapper">
                  <div class="bot-avatar" role="button" tabindex="0" @click="openAiIntro" title="เปิด AI เต็มจอ">
                    <img :src="botAvatar" alt="Bot" class="bot-avatar-img" />
                    <!-- 💤 Sleeping zzz animation -->
                    <transition name="zzz-fade">
                      <div v-if="isBotSleeping && idx === lastBotMessageIndex" class="bot-sleeping-zzz">
                        <span class="zzz-bubble zzz-1">z</span>
                        <span class="zzz-bubble zzz-2">z</span>
                        <span class="zzz-bubble zzz-3">z</span>
                      </div>
                    </transition>
                    <!-- ✨ Wake up animation -->
                    <transition name="wake-up-fade">
                      <div v-if="isBotWakingUp && idx === lastBotMessageIndex" class="bot-wake-up">
                        <span class="sparkle sparkle-1">✨</span>
                        <span class="sparkle sparkle-2">✨</span>
                        <span class="sparkle sparkle-3">✨</span>
                      </div>
                    </transition>
                  </div>
                  <!-- 💬 Unlike Tooltip - แสดงเมื่อผู้ใช้กด unlike -->
                  <transition name="unlike-tooltip-fade">
                    <div v-if="showUnlikeTooltip && idx === lastBotMessageIndex" class="unlike-tooltip">
                      <div class="unlike-tooltip-content">{{ unlikeTooltipText }}</div>
                      <div class="unlike-tooltip-tail"></div>
                    </div>
                  </transition>
                  <!-- 💖 Like Tooltip - แสดงเมื่อเปลี่ยนจาก unlike เป็น like -->
                  <transition name="like-tooltip-fade">
                    <div v-if="showLikeTooltip && idx === lastBotMessageIndex" class="like-tooltip">
                      <div class="like-tooltip-content">{{ likeTooltipText }}</div>
                      <div class="like-tooltip-tail"></div>
                    </div>
                  </transition>

                  <!-- ⌨️ User Typing Tooltip (hint to type "เมนู") -->

                </div>
                <div class="message-bubble" :class="[msg.type, { 'has-contacts': msg.showContacts || (msg.visibleContacts && msg.visibleContacts.length > 0) }]">
                  <div v-if="!(msg.multipleResults && msg.text && msg.text.trim().startsWith('พบหลายคำถาม'))" class="message-text" v-html="linkifyText(msg.text)"></div>
                  <div v-if="msg.showCategories" class="category-section" style="margin-top: 15px;">
                    <div class="category-title no-underline">หมวดหมู่</div>
                    
                    <div v-if="loading" class="py-3 text-center">
                      <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
                    </div>
                    <div v-else>
                      <div v-if="!displayedCategories || displayedCategories.length === 0" class="py-2 text-center text-muted">
                        ไม่พบหมวดหมู่
                      </div>
                      
                      <transition name="cat-pop" v-for="(cat, catIdx) in (displayedCategories || [])" :key="catIdx">
                        <div class="cat-item">
                          <button
                            class="cat-toggle"
                            @click="cat.items && cat.items.length > 0 ? toggle(catIdx, $event, msg) : selectCategoryItem(cat.title, catIdx, null, $event)"
                            :aria-expanded="cat.items && cat.items.length > 0 ? (msg.openIndexes && msg.openIndexes.includes(catIdx)) : false"
                          >
                            <span class="cat-text no-underline">{{ cat.title }}</span>
                            <svg v-if="cat.items && cat.items.length" class="chev" width="14" height="14" viewBox="0 0 24 24">
                              <path d="M6 9l6 6 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </button>

                            <transition name="collapse">
                            <ul v-show="msg.openIndexes && msg.openIndexes.includes(catIdx)" class="cat-list">
                              <li v-for="(item, subIdx) in cat.items" :key="subIdx" class="cat-sub">
                                <button
                                  type="button"
                                  class="cat-sub-btn"
                                  :class="{ disabled: (typeof item === 'object' && item._disabled) }"
                                  :disabled="typeof item === 'object' && item._disabled"
                                  @click="selectCategoryItem(item, catIdx, subIdx, $event)"
                                >
                                  <span class="cat-sub-text no-underline">{{ subIdx+1 }}. {{ typeof item === 'string' ? item : (item.label || item.text || '') }}</span>
                                  <svg class="cat-sub-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l8 7-8 7" /></svg>
                                </button>
                              </li>
                            </ul>
                          </transition>
                        </div>
                      </transition>

                      <transition name="expandButton">
                        <button
                          v-if="!showAllCategories && categories && categories.length > 3"
                          class="read-more-btn"
                          @click="showAllCategories = true"
                        >
                          <span class="read-more-text">ดูเพิ่มเติม</span>
                          <svg class="read-more-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </transition>
                    </div>
                  </div>
                  <div v-if="msg.pdf" class="pdf-attachment">
                    <a :href="msg.pdf" target="_blank" rel="noopener" class="pdf-link" @click.prevent="openPdf(msg, msg.pdf)">
                      <svg class="pdf-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class="pdf-doc" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="pdf-fold" d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="pdf-arrow" d="M12 11v6m0 0l-2-2m2 2l2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="pdf-text">ดาวน์โหลดเอกสาร PDF</span>
                    </a>
                  </div>
                    
                  
                  <!-- 🛡️ Low Confidence Warning Badge -->
                  <div v-if="msg.lowConfidence" class="low-confidence-badge">
                    <svg class="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>ความมั่นใจต่ำ {{ msg.confidenceLevel ? `(${msg.confidenceLevel})` : '' }}</span>
                  </div>
                  
                  <!-- 🛡️ Needs Clarification Message -->
                  <div v-if="msg.needsClarification" class="clarification-notice">
                    <span class="clarification-icon">🤔</span>
                    <span>กรุณาให้รายละเอียดเพิ่มเติม</span>
                  </div>
                  
                  <!-- 🛡️ Clarification Suggestions -->
                  <div v-if="msg.suggestions && msg.suggestions.length" class="clarification-suggestions">
                    <div class="suggestion-label">คุณอาจต้องการถามเกี่ยวกับ:</div>
                    <ul class="suggestions-list clarification-list">
                      <li v-for="(s, si) in msg.suggestions" :key="s.id || si" class="suggestion-item">
                        <button
                          class="suggestion-btn clarification-btn"
                          type="button"
                          @click="selectClarificationSuggestion(s)"
                        >
                          {{ s.title || s }}
                        </button>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- 💬 Feedback Actions (Like/Unlike) -->
                  <div class="feedback-actions" v-if="msg.type === 'bot' && !msg.typing && (msg.text || msg.results) && msg.found === true && !msg.multipleResults && msg === getLatestBotMessage()">
                    <button
                      class="feedback-btn"
                      :class="[{ active: msg.feedback === 'like' }, { anim: msg._anim === 'like' }, { disabled: feedbackButtonsDisabled }]"
                      @click.stop="handleLikeClick(msg)"
                      :disabled="feedbackButtonsDisabled"
                      :title="feedbackButtonsDisabled ? 'รออีกสักครู่นะคะ' : 'ถูกใจ'"
                    >
                      <svg class="feedback-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class="thumb-outline" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="sr-only">ถูกใจ</span>
                    </button>
                    <!-- Unlike button with inline dropdown -->
                    <div class="feedback-unlike-wrapper">
                      <button
                        class="feedback-btn"
                        :class="[{ active: msg.feedback === 'dislike' }, { anim: msg._anim === 'dislike' }, { disabled: feedbackButtonsDisabled }]"
                        @click="toggleFeedbackDropdown(idx)"
                        :disabled="feedbackButtonsDisabled"
                        :title="feedbackButtonsDisabled ? 'รออีกสักครู่นะคะ' : 'ไม่ถูกใจ'"
                      >
                        <svg class="feedback-icon thumbs-down" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path class="thumb-outline" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="sr-only">ไม่ถูกใจ</span>
                      </button>
                      <!-- Inline dropdown for unlike reasons (rendered without Vue <transition> to avoid global enter-class animations) -->
                      <div 
                        v-if="openFeedbackDropdownIndex === idx" 
                        class="feedback-reason-dropdown feedback-reason-dropdown-inline"
                        @click.stop
                      >
                        <div class="feedback-dropdown-header">
                          <span>เลือกเหตุผล</span>
                          <button class="feedback-dropdown-close" @click="closeFeedbackDropdown" aria-label="ปิด">
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </button>
                        </div>
                        <ul class="feedback-reason-list" v-if="!showFeedbackCommentBox">
                          <li 
                            v-for="option in feedbackReasonOptions" 
                            :key="option.value"
                            class="feedback-reason-item"
                            :class="{ active: msg.selectedReason === option.value }"
                            @click.stop.prevent="handleReasonSelect(msg, option.value)"
                            @touchend.stop.prevent="handleReasonSelect(msg, option.value)"
                          >
                            {{ option.label }}
                          </li>
                        </ul>
                        <div v-else class="feedback-comment-box">
                          <textarea 
                            v-model="feedbackCommentText"
                              class="feedback-comment-input"
                              placeholder="กรุณาระบุเหตุผล..."
                              rows="3"
                              autofocus
                              @keydown.enter.prevent="submitFeedbackComment"
                            ></textarea>
                            <div class="feedback-comment-actions">
                              <button class="feedback-comment-btn cancel" @click="cancelFeedbackComment">ยกเลิก</button>
                              <button class="feedback-comment-btn submit" @click="submitFeedbackComment" :disabled="!feedbackCommentText.trim()">ส่ง</button>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                  <!-- Backend suggestions list -->
                  <div v-if="msg.results && msg.results.length" class="suggestions">
                    <transition-group name="suggestion-fade" tag="ul" class="suggestions-list">
                      <li v-for="(r,i) in getVisibleSuggestions(msg)" :key="r.id || i" class="suggestion-item">
                        <button
                          class="suggestion-btn"
                          :class="{ disabled: r._disabled, selected: r._selected }"
                          :disabled="r._disabled"
                          type="button"
                          @click="selectSuggestion(msg, r, i)"
                          :aria-disabled="r._disabled ? 'true' : 'false'"
                        >
                          {{ r.title || r }}
                        </button>
                      </li>
                    </transition-group>
                    <transition name="readmore-fade">
                      <button 
                        v-if="msg.results.length > getVisibleCount(msg)"
                        class="read-more-btn"
                        @click="loadMoreSuggestions(msg)"
                        type="button"
                      >
                        <span class="read-more-text">Read More</span>
                        <svg class="read-more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="read-more-count">เหลืออีก {{ msg.results.length - getVisibleCount(msg) }} คำถาม</span>
                      </button>
                    </transition>

                  </div>

                  <!-- Contact list: show when backend returned contacts OR when we provided fallback universityContacts -->
                    <div v-if="msg.showContacts || (msg.visibleContacts && msg.visibleContacts.length > 0)" class="contact-list">
                      <hr class="contact-divider" />
                      <div class="contact-notice">
                        <div class="contact-notice-sub">&nbsp;&nbsp;&nbsp;หากต้องการความช่วยเหลือเพิ่มเติม โปรดติดต่อเจ้าหน้าที่ตามข้อมูลด้านล่าง</div>
                        <div class="org-cards" style="margin-top: 1rem;">
                        <div
                          v-for="(group, gi) in getVisibleContactGroups(msg)"
                          :key="gi"
                          class="org-card"
                          role="group"
                          aria-label="contact-organization"
                        >
                          <div class="org-card-inner">
                            <div class="org-card-title">{{ group.organization }}</div>

                            <div v-for="(cat, k) in group.categories" :key="k">
                              <!-- Categories hidden in contact display per user request -->
                              <div v-if="cat.contact" class="org-card-phone contact-detail">
                                <div v-for="(part,pi) in parseContactParts(cat.contact)" :key="pi">
                                  <div v-if="/^(https?:|www\.|facebook\.|ลิงค์)/i.test(part)">
                                    <span v-if="!/^ลิงค์/i.test(part)">ลิงค์ : </span>
                                    <span v-html="linkifyText(part)"></span>
                                  </div>
                                  <div v-else-if="hasContact(part)">
                                    <span>ติดต่อ: </span><span v-html="linkifyText(part)"></span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        <transition name="readmore-fade">
                          <button
                            v-if="((msg.groupedContacts && msg.groupedContacts.length) ? msg.groupedContacts.length : (universityContacts || []).length) > getContactVisibleCount(msg)"
                            class="read-more-btn"
                            @click="toggleLoadMoreContacts(msg)"
                            type="button"
                          >
                            <span v-if="getContactVisibleCount(msg) < ((msg.groupedContacts && msg.groupedContacts.length) ? msg.groupedContacts.length : (universityContacts || []).length)" class="read-more-text">ดูเพิ่มเติม</span>
                            <span v-else class="read-more-text">ย่อ</span>
                            <svg class="read-more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="read-more-count">เหลืออีก {{ ((msg.groupedContacts && msg.groupedContacts.length) ? msg.groupedContacts.length : (universityContacts || []).length) - getContactVisibleCount(msg) }} หน่วยงาน</span>
                          </button>
                        </transition>

                      </div>
                      </div>
                    </div>

                  <div v-if="msg.type === 'bot' && msg.typing" class="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
              </transition-group>
            </div>

              <!-- AI Intro Fullscreen Overlay -->
              <transition name="ai-fade">
                <div v-if="showAiIntro" class="ai-intro-overlay" @click.self="closeAiIntro" @keydown.esc="closeAiIntro" tabindex="-1" aria-modal="true" role="dialog">
                  <button class="ai-close" @click="closeAiIntro" aria-label="ปิด">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                  <div class="ai-intro-content" @mousemove="onAiMouseMove" @mouseleave="onAiMouseLeave">
                    <div class="ai-hero">
                      <img :src="botAvatar" alt="PCRU AI" class="ai-hero-img" :style="aiTiltTransform" />
                      <div class="ai-hero-glow"></div>
                    </div>
                    <div class="ai-hero-text">
                      <div class="ai-hero-title">PCRU AI Assistant</div>
                      <div class="ai-hero-sub">ช่วยคุณค้นหาทุน การเรียน การบริการ และอีกมากมาย</div>
                    </div>
                    <button class="ai-help-btn apple-help-button" @click="openHelpModal">
                      <div class="help-btn-ripple"></div>
                      <svg class="help-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle class="help-circle" cx="12" cy="12" r="10"/>
                        <path class="help-question" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line class="help-dot" x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span class="help-btn-text">วิธีใช้งาน Bot</span>
                    </button>
                  </div>
                </div>
              </transition>
          </div>

          <div class="panel-footer" :class="{ focused: panelFocused }" ref="panelFooter">
            
            <!-- Particles canvas for power mode effect -->
            <canvas ref="particleCanvas" class="particle-canvas"></canvas>
            
            <!-- Flying text animation -->
            <transition name="fly-to-message" @before-enter="beforeFlyEnter" @enter="flyEnter">
              <div v-if="showFlyingText" class="flying-text" :style="flyingTextStyle" ref="flyingText">{{ flyingText }}</div>
            </transition>
            
            <!-- Bottom-anchored typing indicator (shown when clearing chat) -->
            <div v-if="tempTyping" class="bottom-typing message-wrapper bot">
              <div class="bot-avatar-wrapper">
                <div class="bot-avatar" role="button" tabindex="0" @click="openAiIntro" title="เปิด AI เต็มจอ">
                  <img :src="botAvatar" alt="Bot" class="bot-avatar-img" />
                </div>
              </div>
              <div class="message-bubble bot">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>

            <div class="input-row">
              <div class="input-container">
                <!-- Typing tooltip is rendered on the bot avatar (avatar-anchored). Removed input-anchored tooltip so pointer correctly targets the avatar -->

                <!-- 👻 Ghost overlay showing only the suggested suffix -->
                <div class="ghost-input" aria-hidden="true">
                  <span class="ghost-typed">{{ query }}</span>
                  <span class="ghost-suffix" v-if="suggestionText && suggestionText.length > (query || '').length">{{ suggestionText.slice((query || '').length) }}</span>
                </div>
                <!-- ⌨️ Real Input -->
                <input
                  v-model="query"
                  class="input-pill real-input"
                  :class="{ 'shake': isTyping }"
                  :style="typingStyle"
                  :placeholder="placeholderText"
                  @keydown.enter.prevent="onEnterKey"
                  @keydown.tab.prevent="acceptSuggestion"
                  @keydown.arrow-right.prevent="checkAcceptSuggestion"
                  @compositionstart="onCompositionStart"
                  @compositionend="onCompositionEnd"
                  @input="onTyping"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                  ref="inputBox"
                  autocomplete="off"
                />
              </div>
              <button class="btn-send" @click="onSend" aria-label="send" ref="sendBtn" :style="sendBtnFixedStyle"
                @mouseenter="onSendBtnMouseEnter" @mouseleave="onSendBtnMouseLeave" @focus="onSendBtnMouseEnter" @blur="onSendBtnMouseLeave">
                <!-- Animated chat bubble icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="send-icon" aria-hidden="true" focusable="false">
                  <path class="send-bubble" fill="white" d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z">
                    <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze"/>
                  </path>
                  <circle class="send-dot" cx="12" cy="10" r="0" fill="rgba(107,44,145,0.6)">
                    <animate attributeName="r" values="0;2;0" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Feedback Dropdown moved inline with unlike button above -->
        </aside>

        <!-- Global avatar-anchored typing tooltip (rendered once, positioned with fixed coords to avoid clipping) -->
        <transition name="typing-tooltip-fade">
          <div v-if="showUserTypingTooltip" class="typing-tooltip" :style="userTypingTooltipStyle">
            <div class="typing-tooltip-content">{{ userTypingTooltipText }}</div>
            <div class="typing-tooltip-tail"></div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Floating re-open button when hidden -->
    <button v-if="!visible" class="fab-open" @click="visible = true" aria-label="open chat">
      <!-- Animated chat bubble with pulse -->
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="fab-icon" aria-hidden="true" focusable="false">
        <path class="fab-bubble" fill="white" d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z" stroke-dasharray="80" stroke-dashoffset="80">
          <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" fill="freeze"/>
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
        </path>
        <circle class="fab-pulse" cx="8" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle class="fab-pulse" cx="12" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
          <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
        </circle>
        <circle class="fab-pulse" cx="16" cy="10" r="1.5" fill="rgba(107,44,145,0.5)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
          <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </button>

    <!-- ChatbotHelpView Component -->
    <ChatbotHelpView :visible="showHelpModal" @close="closeHelpModal" />
  </div>
</template>

<script>
import { getBotAvatar } from '@/config/botConfig'
import { getCategoryIcon as getIconSvg } from '@/config/categoryIcons'
import { getRandomMutterByHour, replacePronoun } from '@/config/botMutterQuotes'
import ChatbotHelpView from './ChatbotHelpView.vue'
import { universityContacts } from '@/config/contacts.js';

export default {
  name: 'ChatbotView',
  components: {
    ChatbotHelpView
  },
  data() {
    return {
      messageIdCounter: 0,
      visible: false,
      // allow multiple sections open at once
      openIndexes: [],
      showAllCategories: false,
      drawerWidth: '400px',
      loading: false,
      loadError: '',
      query: '',
      placeholderText: 'ขอทุน, ปฏิทินวิชาการ, สวัสดิการ',
      // embedding removed — external site not used in this deployment
      messages: [],
      welcomeTyping: false,
      welcomeTypingTimer: null,
      botTypingTimers: [],
      // Flag to show a bottom-anchored temporary typing indicator
      tempTyping: false,
      // track whether we've already shown the welcome typing (session)
      welcomeTypingShown: false,
      isWinterSeason: false,
      showScrollTop: false,
      lastScrollTop: 0,
      anchorBottom: true,
      botAvatar: null,
      userType: '',
      botName: 'ปลายฟ้า',
      botPronoun: import.meta.env.VITE_BOT_PRONOUN || 'หนู',
      showAiIntro: false,
      aiTilt: { x: 0, y: 0, s: 1 },
      // rAF id for ai tilt updates (reduce reflows)
      aiTiltRafId: null,
      timeGreetingText: '',
      showHelpModal: false,
      aiQuickActions: [],
      // 📋 Feedback reason options for unlike button
      feedbackReasonOptions: [
        { value: 'wrong_answer', label: 'คำตอบไม่ถูกต้อง' },
        { value: 'incomplete', label: 'ข้อมูลไม่ครบถ้วน' },
        { value: 'outdated', label: 'ข้อมูลล้าสมัย' },
        { value: 'not_relevant', label: 'ไม่เกี่ยวข้องกับคำถาม' },
        { value: 'confusing', label: 'เข้าใจยาก/สับสน' },
        { value: 'other', label: 'อื่นๆ' }
      ],
      // Currently open feedback dropdown (message index or null)
      openFeedbackDropdownIndex: null,
      // Show comment box for 'other' reason
      showFeedbackCommentBox: false,
      feedbackCommentText: '',
      pendingFeedbackMsg: null,
      // 💬 Unlike tooltip (แสดงเมื่อกดปุ่ม unlike)
      showUnlikeTooltip: false,
      unlikeTooltipText: '',
      unlikeTooltipTimer: null,
      // 💖 Like tooltip (แสดงเมื่อเปลี่ยนจาก unlike เป็น like)
      showLikeTooltip: false,
      likeTooltipText: '',
      likeTooltipTimer: null,
      // 🎭 Feedback toggle warning (เมื่อสลับ like/unlike บ่อยๆ)
      feedbackToggleCount: 0,
      feedbackToggleResetTimer: null,
      // 🚫 Feedback button disable (เมื่อกดถี่เกิน 5 ครั้ง)
      feedbackButtonsDisabled: false,
      feedbackCooldownTime: 5,
      feedbackCooldownTimer: null,
      feedbackCooldownInterval: null,
      // Flying text animation
      flyingText: '',
      showFlyingText: false,
      flyingTextStyle: {},
      // Typing animation
      isTyping: false,
      typingTimeout: null,
      lastTypedChar: '',
      // ⌨️ User typing tooltip (แสดงเมื่อ user กำลังพิมพ์)
      showUserTypingTooltip: false,
      userTypingTooltipText: '',
      userTypingTooltipStyle: {},
      typingTooltipTimer: null,
      currentTypingMessageIndex: 0,
      // Composition / Autocomplete state
      isComposing: false,
      suggestionText: '',
      // Populated from backend `/keywords/public` on mount
      autocompleteKeywords: [],
      // Debounced remote autocomplete (keywords + synonyms + stopwords)
      autocompleteSuggestTimer: null,
      autocompleteSuggestSeq: 0,
      // Power mode particles
      particles: [],
      particleAnimationFrame: null,
      // Thai notice bubble (auto-hide after 5s)
      // Theme transition circle animation
      showThemeTransition: false,
      themeTransitionSize: 0,
      themeTransitionTimer: null,
      showThaiNotice: true,
      thaiNoticeTimer: null,
      // 💤 Sleeping bot when idle
      isBotSleeping: false,
      isBotWakingUp: false,
      idleTimer: null,
      idleCheckInterval: null,
      idleLastActivity: Date.now(),
      idleTimeout: parseInt(import.meta.env.VITE_BOT_SLEEP_TIMEOUT || '30000'), // อ่านจาก env หรือ default 30 วินาที
      // Visual effects toggles (managed via /manageaiimage)
      masterEnabled: true,
      snowEnabled: true,
      particleEnabled: true,
      shadowEnabled: true,
      animationEnabled: true,
      // Snow configuration from env
      snowCount: parseInt(import.meta.env.VITE_SNOW_COUNT || '20'),
      snowMinSize: parseFloat(import.meta.env.VITE_SNOW_MIN_SIZE || '0.6'),
      snowMaxSize: parseFloat(import.meta.env.VITE_SNOW_MAX_SIZE || '1.4'),
      snowMinDuration: parseInt(import.meta.env.VITE_SNOW_MIN_DURATION || '10'),
      snowMaxDuration: parseInt(import.meta.env.VITE_SNOW_MAX_DURATION || '20'),
      snowOpacity: parseFloat(import.meta.env.VITE_SNOW_OPACITY || '0.7'),
      // Pre-generated snowflake styles to prevent re-render jank
      snowflakeStyles: [],
      // Snowflake drag state
      draggedSnowflakeIndex: null,
      snowflakeDragOffsets: {}, // { index: { x, y } }
      categories: [],
      // Suggestions pagination: track visible count per message
      suggestionVisibleCounts: {}, // { messageIndex: visibleCount }
      // Contacts pagination / collapse: track visible org count per message
      contactVisibleCounts: {}, // { messageIndex: visibleOrgCount }
      // Keyboard detection
      isKeyboardOpen: false,
      initialViewportHeight: window.innerHeight,
      // True viewport height to account for virtual keyboard (updated via Visual Viewport API)
      viewportHeight: '100%',
      // Footer focus fallback to reliably move send button on mobile
      panelFocused: false,
      // Theme: 'light' | 'dark' | 'auto' (initialized in mounted via initTheme)
      theme: 'light',
      // Theme toggle expansion state
      isExpanded: false,
      expandTimer: null,
      // Media query listener for system theme changes in auto mode
      systemThemeMediaQuery: null,
      // Inline style object for fixed-position send button when focused (measured from input)
      sendBtnFixedStyle: null,
      // One-time simulation to stabilize mobile layout
      hasSimulatedKeyboardCycle: false,
      // Mini help dismissed state (persist until clear chat)
      miniHelpDismissed: false,
      // Track whether the user has ever asked the bot (used to hide the clear/trash on fresh installs)
      hasAskedBot: false,
      // 🕵️‍♀️ Rapid input-focus detection
      inputFocusTimestamps: [],
      inputFocusCooldownUntil: 0,
      // 🎯 Gating for UX: show input tooltip occasionally
      inputTooltipCooldownUntil: 0,
      inputTooltipMinIntervalMs: 3000,
      inputTooltipShowProbability: 0.5,
      // 🗣️ Gating for playful bot nudge
      lastBotNudgeAt: 0,
      botNudgeMinIntervalMs: 45000,
      // Welcome message typing
      welcomeTitle: '',
      welcomeSub: '',
      welcomeInstruction: '',
      stopwords: [],
      protectedKeywords: new Set(),
      segmenter: null,
    }
  },
  computed: {
    snowZIndex() {
      return parseInt(import.meta.env.VITE_SNOW_Z_INDEX || '1000');
    },
    displayedCategories() {
      if (!this.categories || !Array.isArray(this.categories)) return []
      const result = this.showAllCategories ? this.categories : this.categories.slice(0, 3)
      console.log('displayedCategories:', result, 'showAllCategories:', this.showAllCategories, 'categories.length:', this.categories.length)
      return result
    },
    showTopCategories() {
      // Hide categories while a temporary typing indicator is active (e.g., after clearing chat)
      if (this.tempTyping) return false
      if (!Array.isArray(this.messages)) return true
      const hasTempTyping = this.messages.some(m => m && m._temp === true)
      return !hasTempTyping
    },
    // Dynamic messages with bot pronoun
    dynamicUnlikeMessages() {
      return [
        'อืมม... จะถามอะไรดีนะ 🤔',
        `${this.botPronoun}รอฟังอยู่นะคะ 👂✨`,
        'กำลังจะถามอะไรหรอคะ 😊',
        'เอ่อ... พิมพ์ช้าๆ ก็ได้นะคะ 🐌💕',
        `${this.botPronoun}พร้อมตอบแล้วค่ะ 💪✨`,
        'ถามอะไรมาเลยค่ะ 🙋‍♀️',
        'อ่า... น่าจะเป็นคำถามดีๆ นะ 👀',
        `${this.botPronoun}ตั้งใจฟังอยู่เลยค่ะ 🎧`,
        'เอ๊ะ... กำลังคิดคำถามอยู่หรอคะ 💭',
        `มีอะไรให้${this.botPronoun}ช่วยดีคะ 🌸`,
        'ถามได้เลยนะคะ ไม่ต้องกลัว 😌',
        'อืม... คำถามยากๆ หรือเปล่านะ 🧐'
      ]
    },
    dynamicLikeMessages() {
      return [
        'ขอบคุณนะคะ 💖✨',
        'ยินดีมากเลยค่ะ 🥰',
        'ดีใจที่ช่วยได้นะคะ 💜',
        `ขอบคุณที่ให้โอกาส${this.botPronoun}ค่ะ 🌸`,
        `${this.botPronoun}ดีใจมากเลย 😊💕`,
        'ขอบพระคุณค่ะ 🙏💫',
        'ยินดีที่ได้ช่วยเหลือค่ะ 🌟'
      ]
    },
    dynamicWarningMessages() {
      return [
        'เอ่อ... กดบ่อยไปแล้วนะคะ 😅',
        `แกล้ง${this.botPronoun}หรอคะ 🙈💦`,
        'เลือกอันเดียวได้แล้วนะ 😂',
        `${this.botPronoun}งง... ชอบหรือไม่ชอบกันแน่คะ 🤔`,
        'ทำไมเปลี่ยนใจบ่อยจัง 😵',
        'ขอแค่ครั้งเดียวได้มั้ยคะ 🥺',
        `${this.botPronoun}เหนื่อยแล้วค่ะ 😩💫`
      ]
    },
    dynamicApologyMessages() {
      return [
        'ขอโทษที่ตอบผิดค่ะ 😔💕',
        'ขอโทษนะคะที่ไม่ตรงใจ 🙏',
        `${this.botPronoun}ขอโทษมากๆ จะพยายามดีขึ้นค่ะ 😊`,
        'อ๊ะ... โทษที่ตอบไม่ดีค่ะ 😭',
        'ขอโทษจริงๆ ค่ะ 💜',
        'ขอโทษค่ะ 😢',
        'โทษที่ทำให้ผิดหวังค่ะ 🥺'
      ]
    },
    aiTiltTransform() {
      const x = this.aiTilt.x || 0
      const y = this.aiTilt.y || 0
      const s = this.aiTilt.s || 1
      return { transform: `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(${s})` }
    },
    typingStyle() {
      if (!this.isTyping) return {}
      return {
        textShadow: '0 0 20px rgba(139, 76, 184, 0.6), 0 0 40px rgba(107, 44, 145, 0.4)',
        color: '#8B4CB8',
        transition: 'text-shadow 0.15s ease-out, color 0.15s ease-out'
      }
    },
    fabStyle() {
      return {
        right: '18px',
        bottom: '18px',
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        zIndex: 1060
      }
    },
    // หา index ของ bot message ล่าสุด (เพื่อแสดง tooltip เฉพาะอันสุดท้าย)
    lastBotMessageIndex() {
      if (!this.messages || this.messages.length === 0) return -1
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].type === 'bot') return i
      }
      return -1
    },
    // ตรวจว่ามี bot message ใน chat หรือยัง
    hasBotMessages() {
      return this.lastBotMessageIndex >= 0
    },
    // Show clear (trash) button only if there are messages or the user has previously interacted
    showClearBtn() {
      return (Array.isArray(this.messages) && this.messages.length > 0) || !!this.hasAskedBot
    },
    themeDisplayOnly() {
      if (this.theme === 'light') return 'Light';
      if (this.theme === 'dark') return 'Dark';
      return 'Auto';
    }
  },
  
  async mounted() {
    // Initialize Intl.Segmenter for frontend stopword removal.
    if ('Segmenter' in Intl) {
      this.segmenter = new Intl.Segmenter('th', { granularity: 'word' });
    } else {
      console.warn('Intl.Segmenter not supported, frontend stopword filtering will be disabled.');
    }
    this.fetchStopwordsAndKeywords();

    // Generate snowflake styles once to prevent jank on re-render
    this.generateSnowflakeStyles()
    
    // Prevent Bootstrap carousel auto-init from parent page (university website)
    // This stops jQuery/Bootstrap from trying to initialize carousels on our component
    this.$nextTick(() => {
      const chatbotEl = this.$el
      if (chatbotEl) {
        // Remove data-bs-ride attribute to prevent Bootstrap from auto-initializing
        chatbotEl.querySelectorAll('[data-bs-ride]').forEach(el => el.removeAttribute('data-bs-ride'))
        // Mark as already initialized to prevent re-init
        chatbotEl.setAttribute('data-bs-no-init', 'true')
      }
    })
    
    this.timeGreetingText = this.computeTimeGreeting()
    
    // 🎨 Initialize user typing tooltip text with first message
    this.userTypingTooltipText = this.dynamicUnlikeMessages[0]
    
    // Auto-hide Thai notice bubble after 5 seconds on mount
    if (this.showThaiNotice) {
      if (this.thaiNoticeTimer) clearTimeout(this.thaiNoticeTimer)
      this.thaiNoticeTimer = setTimeout(() => {
        this.showThaiNotice = false
        this.thaiNoticeTimer = null
      }, 5000)
    }

    // Load whether the user has ever asked the bot before (used to hide the clear button on fresh users)
    try {
      const hasAsked = localStorage.getItem('chatbot_has_asked')
      this.hasAskedBot = !!hasAsked
    } catch (e) { this.hasAskedBot = false }

    // Initialize theme preference (dark / light) and apply it
    try {
      this.initTheme()
    } catch (e) { /* ignore */ }
    
    // Setup particle canvas
    this.$nextTick(() => {
      const canvas = this.$refs.particleCanvas
      if (canvas) {
        const updateCanvasSize = () => {
          const footer = canvas.parentElement
          if (footer) {
            canvas.width = footer.offsetWidth
            canvas.height = footer.offsetHeight
          }
        }
        updateCanvasSize()
        window.addEventListener('resize', updateCanvasSize)
      }
    })
    
    // Get user type from localStorage and set bot avatar
    const userType = localStorage.getItem('userType')
    if (userType) {
      this.userType = userType
      this.botAvatar = getBotAvatar(userType)
    } else {
      // Default bot avatar if no user type
      this.botAvatar = getBotAvatar()
    }
    
    // โหลด bot avatar ที่ถูกเลือกจาก ManageAIImageView (หากมี)
    try {
      const aiImageUrl = localStorage.getItem('aiImageUrl')
      if (aiImageUrl) {
        this.botAvatar = aiImageUrl
      }
    } catch (e) { /* ignore */ }
    
    // ดึงภาพ bot ปัจจุบันจาก backend เพื่อให้ทุกอุปกรณ์ตรงกัน
    try {
      const resp = await this.$axios.get('/ai-image/active')
      if (resp?.data?.url) {
        // cache-bust เพื่อหลีกเลี่ยงรูปเก่าจาก cache บนมือถือ
        this.botAvatar = `${resp.data.url}?t=${Date.now()}`
      }
    } catch (e) {
      // ignore fetch errors; fallback to local image
    }
    
    // โหลด bot name จาก localStorage (หากมี)
    try {
      const savedBotName = localStorage.getItem('botName')
      if (savedBotName) {
        this.botName = savedBotName
      }
    } catch (e) { /* ignore */ }
    
    // โหลด bot pronoun จาก backend API
    try {
      const pronounResp = await this.$axios.get('/ai-image/bot-pronoun')
      if (pronounResp?.data?.pronoun) {
        this.botPronoun = pronounResp.data.pronoun
      }
    } catch (e) {
      console.log('Using default pronoun:', this.botPronoun)
    }
    
    // Check if it's winter season (November - February in Thailand)
    this.checkWinterSeason()

    // Load persisted mini help dismissed state (persists until user clears chat)
    try {
      const dismissed = localStorage.getItem('chatbot_mini_help_dismissed')
      this.miniHelpDismissed = !!dismissed
    } catch (e) {
      this.miniHelpDismissed = false
    }

    // Load visual effects settings
    try {
      const savedMaster = localStorage.getItem('chatbot_master_enabled')
      const savedSnow = localStorage.getItem('chatbot_snow_enabled')
      const savedParticle = localStorage.getItem('chatbot_particle_enabled')
      const savedShadow = localStorage.getItem('chatbot_shadow_enabled')
      const savedAnimation = localStorage.getItem('chatbot_animation_enabled')

      if (savedMaster !== null) this.masterEnabled = savedMaster === 'true'
      if (savedSnow !== null) this.snowEnabled = savedSnow === 'true'
      if (savedParticle !== null) this.particleEnabled = savedParticle === 'true'
      if (savedShadow !== null) this.shadowEnabled = savedShadow === 'true'
      if (savedAnimation !== null) this.animationEnabled = savedAnimation === 'true'
      
      // If master is off, disable all effects
      if (savedMaster === 'false') {
        this.snowEnabled = false
        this.particleEnabled = false
        this.shadowEnabled = false
        this.animationEnabled = false
        // Apply no-effects class to disable animations
        document.body.classList.add('no-effects')
      }
      
      // Apply shadow class to body
      if (savedShadow === 'false' || savedMaster === 'false') {
        document.body.classList.add('no-shadows')
      }
    } catch (e) { /* ignore */ }
    
    // Load chat history from localStorage
    this.loadChatHistory()
    
    // Load category open/close state
    this.loadCategoryState()
    
    // Close feedback dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick)
    
    // Detect keyboard open/close by monitoring viewport height changes
    window.addEventListener('resize', this.handleKeyboardDetection)
    
    // Also listen to input focus/blur for immediate detection
    this.$nextTick(() => {
      const inputBox = this.$refs.inputBox
      if (inputBox) {
        inputBox.addEventListener('focus', this.onInputFocus)
        inputBox.addEventListener('blur', this.onInputBlur)
      }
      // Simulate keyboard open/close once on mobile to stabilize initial layout
      this.simulateKeyboardCycle()
    })

    // --- Mobile viewport height fix (Visual Viewport API) ---
    const setViewportHeight = () => {
      if (window.visualViewport) {
        // Use the visible height reported by VisualViewport so keyboard area is excluded
        this.viewportHeight = `${window.visualViewport.height}px`

        // When keyboard appears, ensure panel body scrolls to bottom
        if (this.$refs.panelBody) {
          setTimeout(() => {
            try {
              this.$refs.panelBody.scrollTop = this.$refs.panelBody.scrollHeight
            } catch (e) { /* ignore */ }
          }, 100)
        }
      } else {
        // Fallback
        this.viewportHeight = `${window.innerHeight}px`
      }
    }

    // Initial set
    setViewportHeight()

    // Attach listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight)
      window.visualViewport.addEventListener('scroll', setViewportHeight)
    } else {
      window.addEventListener('resize', setViewportHeight)
    }

    // keep reference for cleanup
    this._viewportHandler = setViewportHeight
    // ---------------------------------------------------------

    // Fetch categories from backend. This app supports your backend's flat rows
    // shape: { CategoriesID, CategoriesName, ParentCategoriesID, CategoriesPDF }
    this.loading = true
    this.loadError = ''
    try {
      if (!this.$axios) throw new Error('axios plugin not available as $axios')
      const res = await this.$axios.get('/categories', { params: { onlyWithAnswers: 1 } })
      let payload = res.data

      // support wrapper { categories: [...] } or { success: true, categories: [...], count: ... }
      if (payload && !Array.isArray(payload)) {
        if (Array.isArray(payload.categories)) {
          payload = payload.categories
        } else {
          console.error('Unexpected payload structure:', payload)
          throw new Error('Categories API returned unexpected structure. Expected array or object with categories array.')
        }
      }

      if (!Array.isArray(payload)) {
        console.error('Payload after processing:', payload)
        throw new Error('Unexpected categories response shape - payload is not an array')
      }

      // If backend returns flat rows from SQL with CategoriesID, map into tree
      if (payload.length && payload[0].hasOwnProperty('CategoriesID')) {
        console.log('Raw payload from backend:', payload)
        
        const byId = {}
        const childrenByParent = {}
        
        // Build lookup structures
        payload.forEach(r => {
          const id = String(r.CategoriesID)
          const parentId = r.ParentCategoriesID == null ? null : String(r.ParentCategoriesID)
          
          // If ParentCategoriesID equals CategoriesID, it's a top-level category (parent points to itself)
          const isTopLevel = !parentId || parentId === id
          
          byId[id] = {
            id,
            title: r.CategoriesName || 'Untitled',
            parent: isTopLevel ? null : parentId,
            pdf: r.CategoriesPDF || null
          }
          
          // Group children by parent (only if not pointing to itself)
          if (parentId && parentId !== id) {
            if (!childrenByParent[parentId]) {
              childrenByParent[parentId] = []
            }
            childrenByParent[parentId].push(id)
          }
        })
        
        console.log('byId:', byId)
        console.log('childrenByParent:', childrenByParent)
        
        // Build final category structure for UI
        const mappedCategories = []
        
        Object.keys(byId).forEach(id => {
          const cat = byId[id]
          
          // Only process top-level categories (no parent)
          if (!cat.parent) {
            const children = childrenByParent[id] || []
            const items = children.map(childId => byId[childId].title)
            
            mappedCategories.push({
              title: cat.title,
              items: items
            })
            
            console.log(`Category "${cat.title}" has ${items.length} items:`, items)
          }
        })
        
        console.log('Final mapped categories:', mappedCategories)
        
        // Only update if we got valid categories from backend
        if (mappedCategories.length > 0) {
          this.categories = mappedCategories
          console.log('Categories assigned to this.categories')
          
          // Trigger re-render
          this.$nextTick(() => {
            console.log('After nextTick, categories:', this.categories)
            console.log('displayedCategories computed:', this.displayedCategories)
          })
        }
      } else {
        // Fallback for other shapes
        const mappedCategories = payload.map(c => {
          const title = c.title || c.name || c.category || 'Untitled'
          const subs = c.subcategories || c.children || c.items || c.options || []
          const items = Array.isArray(subs)
            ? subs.map(s => (typeof s === 'string' ? s : (s.title || s.name || s.label || 'Untitled')))
            : []
          return { title, items }
        })
        // Only update if we got valid categories from backend
        if (mappedCategories.length > 0) {
          this.categories = mappedCategories
        }
      }

      // Restore disabled state from localStorage
      this.restoreCategoriesDisabledState()

    } catch (err) {
      console.error('Failed to load categories from backend, using local placeholders', err)
      this.loadError = err?.message || 'Failed to load categories'
      // Keep default categories from data() when API fails
    } finally {
      this.loading = false
    }

    // initial anchoring check
    this.$nextTick(() => this.updateAnchoring())
    // keep anchoring updated on resize
    window.addEventListener('resize', this.updateAnchoring)

    // 💤 Start idle tracking for sleeping bot
    this.startIdleTracking()

    // 📜 Scroll to bottom to show latest messages
    setTimeout(() => {
      if (this.$refs.panelBody) {
        this.$refs.panelBody.scrollTop = this.$refs.panelBody.scrollHeight
      }
      // Try again with more delay to ensure content is fully loaded
      setTimeout(() => {
        if (this.$refs.panelBody) {
          this.$refs.panelBody.scrollTop = this.$refs.panelBody.scrollHeight
        }
      }, 0)
    }, 0)

    // embedding removed; no persisted embed settings

    // Auto-open chatbot if enabled in env, or if the current route is the chatbot root
    if (import.meta.env.VITE_AUTO_OPEN_CHATBOT === 'true' || (this.$route && this.$route.name === 'chatbot')) {
      // Open immediately on mount without artificial delay
      this.visible = true
    }
  },

  beforeDestroy() {
    // Vue 2 lifecycle hook
    if (this.welcomeTypingTimer) {
      clearTimeout(this.welcomeTypingTimer)
      this.welcomeTypingTimer = null
    }
    window.removeEventListener('resize', this.updateAnchoring)
    // 💤 Stop idle tracking
    this.stopIdleTracking()
    // clear any pending bot typing timers
    if (Array.isArray(this.botTypingTimers) && this.botTypingTimers.length) {
      this.botTypingTimers.forEach(id => clearTimeout(id))
      this.botTypingTimers = []
    }
    // Clear unlike tooltip timer
    if (this.unlikeTooltipTimer) {
      clearTimeout(this.unlikeTooltipTimer)
      this.unlikeTooltipTimer = null
    }
    // Clear like tooltip timer
    if (this.likeTooltipTimer) {
      clearTimeout(this.likeTooltipTimer)
      this.likeTooltipTimer = null
    }
    // Clear feedback toggle reset timer
    if (this.feedbackToggleResetTimer) {
      clearTimeout(this.feedbackToggleResetTimer)
      this.feedbackToggleResetTimer = null
    }
    // Clear feedback cooldown timers
    if (this.feedbackCooldownTimer) {
      clearTimeout(this.feedbackCooldownTimer)
      this.feedbackCooldownTimer = null
    }
    if (this.feedbackCooldownInterval) {
      clearInterval(this.feedbackCooldownInterval)
      this.feedbackCooldownInterval = null
    }
    // Cancel any outstanding animation frames
    try {
      if (this.particleAnimationFrame) { cancelAnimationFrame(this.particleAnimationFrame); this.particleAnimationFrame = null }
      if (this.aiTiltRafId) { cancelAnimationFrame(this.aiTiltRafId); this.aiTiltRafId = null }
    } catch (e) { /* ignore */ }

    // Listen for system theme changes when in auto mode
    if (window.matchMedia) {
      this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange)
    }
  },

  beforeUnmount() {
    // Vue 3 lifecycle hook
    if (this.welcomeTypingTimer) {
      clearTimeout(this.welcomeTypingTimer)
      this.welcomeTypingTimer = null
    }
    window.removeEventListener('resize', this.updateAnchoring)
    window.removeEventListener('resize', this.handleKeyboardDetection)
    document.removeEventListener('click', this.handleOutsideClick)
    
    const inputBox = this.$refs.inputBox
    if (inputBox) {
      inputBox.removeEventListener('focus', this.onInputFocus)
      inputBox.removeEventListener('blur', this.onInputBlur)
    }
    
    // clear any pending bot typing timers
    if (Array.isArray(this.botTypingTimers) && this.botTypingTimers.length) {
      this.botTypingTimers.forEach(id => clearTimeout(id))
      this.botTypingTimers = []
    }
    // Clear unlike tooltip timer
    if (this.unlikeTooltipTimer) {
      clearTimeout(this.unlikeTooltipTimer)
      this.unlikeTooltipTimer = null
    }
    // Clear like tooltip timer
    if (this.likeTooltipTimer) {
      clearTimeout(this.likeTooltipTimer)
      this.likeTooltipTimer = null
    }
    // Clear feedback toggle reset timer
    if (this.feedbackToggleResetTimer) {
      clearTimeout(this.feedbackToggleResetTimer)
      this.feedbackToggleResetTimer = null
    }
    // Clear feedback cooldown timers
    if (this.feedbackCooldownTimer) {
      clearTimeout(this.feedbackCooldownTimer)
      this.feedbackCooldownTimer = null
    }
    if (this.feedbackCooldownInterval) {
      clearInterval(this.feedbackCooldownInterval)
      this.feedbackCooldownInterval = null
    }
    // Clear theme toggle expansion timer
    if (this.expandTimer) {
      clearTimeout(this.expandTimer)
      this.expandTimer = null
    }

    // Clear pending autocomplete request timer
    if (this.autocompleteSuggestTimer) {
      clearTimeout(this.autocompleteSuggestTimer)
      this.autocompleteSuggestTimer = null
    }
    // Remove visualViewport listeners if set
    if (this._viewportHandler) {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', this._viewportHandler)
        window.visualViewport.removeEventListener('scroll', this._viewportHandler)
      } else {
        window.removeEventListener('resize', this._viewportHandler)
      }
      this._viewportHandler = null
    }
    
    // Remove system theme change listener
    if (this.systemThemeMediaQuery) {
      this.systemThemeMediaQuery.removeEventListener('change', this.handleSystemThemeChange)
      this.systemThemeMediaQuery = null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // Initialize welcome text
        if (this.messages.length > 0 || this.welcomeTypingShown) {
          // If history exists or already shown, show immediately
          this.welcomeTitle = `สวัสดี <span class="wave-hand" aria-hidden="true">👋</span> ${this.botPronoun}ชื่อ ${this.botName} <br> ผู้ช่วย AI ของ PCRU ค่ะ`
          this.welcomeSub = `ยินดีที่ได้ช่วยคุณ! มาหาคำตอบที่คุณต้องการกันเลยค่ะ ✨`
          this.welcomeInstruction = `เลือกหมวดหมู่ด้านล่าง <br> หรือพิมพ์คำถามได้เลยค่ะ 😊`
          this.welcomeTyping = false
          if (this.welcomeTypingTimer) {
            clearTimeout(this.welcomeTypingTimer)
            this.welcomeTypingTimer = null
          }
        } else {
          // First open, no history -> Type it
          this.welcomeTyping = false
          this.welcomeTypingShown = true
          this.typeWelcomeMessage()

          // Show Thai notice bubble and auto-hide after 5 seconds
          this.showThaiNotice = true
          if (this.thaiNoticeTimer) clearTimeout(this.thaiNoticeTimer)
          this.thaiNoticeTimer = setTimeout(() => {
            this.showThaiNotice = false
            this.thaiNoticeTimer = null
          }, 5000)
        }

        // After opening, ensure the panel shows the latest messages
        this.$nextTick(() => {
          this.updateAnchoring()
          if (!this.messages || this.messages.length === 0) {
            // No messages: show top (welcome/categories) at start
            if (this.$refs.panelBody) {
              this.$refs.panelBody.scrollTop = 0
            }
            // Ensure it remains at top after animations/rendering
            setTimeout(() => {
              if (this.$refs.panelBody) this.$refs.panelBody.scrollTop = 0
            }, 400)
          } else {
            // Has messages: scroll to bottom as usual
            this.scrollToBottom()
            setTimeout(() => {
              if (this.$refs.panelBody) {
                this.$refs.panelBody.scrollTop = this.$refs.panelBody.scrollHeight
              }
            }, 400)
          }
        })
      } else {
        // Chat closed: cancel any pending welcome typing and bot typing timers
        if (this.welcomeTypingTimer) {
          clearTimeout(this.welcomeTypingTimer)
          this.welcomeTypingTimer = null
        }
        if (Array.isArray(this.botTypingTimers) && this.botTypingTimers.length) {
          this.botTypingTimers.forEach(id => clearTimeout(id))
          this.botTypingTimers = []
        }
        this.welcomeTyping = false
        // Remove any temporary typing state left behind
        this.tempTyping = false
        this.messages = this.messages.filter(m => !m._temp)
      }
    }
  },
  methods: {
    onEnterKey() {
      // Ignore enter while IME composition is active
      if (this.isComposing) return

      // If a ghost suggestion exists, Enter should first accept it (fill input)
      // Press Enter again to actually send.
      const input = (this.query || '').toString().trim()
      const suggestion = (this.suggestionText || '').toString().trim()
      if (input && suggestion && suggestion.toLowerCase() !== input.toLowerCase()) {
        this.acceptSuggestion()
        return
      }

      this.onSend()
    },
    async fetchStopwordsAndKeywords() {
      try {
        const [stopwordsRes, keywordsRes] = await Promise.all([
          this.$axios.get('/stopwords/public'),
          this.$axios.get('/keywords/public')
        ]);
        
        const stopwordsData = stopwordsRes.data?.data || stopwordsRes.data || [];
        const keywordsData = keywordsRes.data?.data || keywordsRes.data || [];

        if (Array.isArray(keywordsData)) {
          this.protectedKeywords = new Set(keywordsData.map(k => (k.KeywordText || '').toLowerCase()));

          // Fill autocomplete keywords from backend-provided keywords
          // Support both object with KeywordText and plain string entries
          this.autocompleteKeywords = Array.from(new Set(
            keywordsData
              .map(k => (k && (k.KeywordText || k.keyword || k.text || k)).toString().trim())
              .filter(Boolean)
          ))
          // Sort using Thai locale where possible for stable suggestions
          try { this.autocompleteKeywords.sort((a, b) => a.localeCompare(b, 'th')); } catch (e) { /* ignore */ }
        } else {
          this.autocompleteKeywords = [];
        }

        if (Array.isArray(stopwordsData)) {
          // An "active" stopword is one that is in the stopwords list but NOT in the protected keywords list.
          this.stopwords = stopwordsData
            .map(s => (s.StopwordText || '').toLowerCase())
            .filter(sw => sw && !this.protectedKeywords.has(sw));
        }
      } catch (error) {
        console.warn('Could not fetch stopwords/keywords for frontend filtering. This is not critical.', error);
      }
    },

    formatTel(raw) {
      if (!raw) return '';
      const m = String(raw).match(/\b(0[- \d]{8,15}\d)(?:\s*(?:ต่อ|ext\.?|x)\s*([\d, ]+))?\b/i);
      if (m) {
        const phoneDigits = m[1].replace(/\D/g, '');
        let tel = phoneDigits;
        if (m[2]) {
          const firstExt = m[2].split(',')[0].replace(/\D/g, '');
          if (firstExt) tel += ',' + firstExt;
        }
        return tel;
      }
      return String(raw).replace(/\D/g, '');
    },

    // Theme initialization & toggle (persist to localStorage & set document dataset)
    initTheme() {
      try {
        const stored = localStorage.getItem('chatbot_theme')
        if (stored === 'dark' || stored === 'light' || stored === 'auto') {
          this.theme = stored
        } else {
          // Respect system preference if nothing persisted
          const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          this.theme = prefers ? 'dark' : 'light'
        }
      } catch (e) {
        this.theme = 'light'
      }
      
      // Determine actual theme to apply (resolve 'auto' to 'light' or 'dark')
      let actualTheme = this.theme
      if (this.theme === 'auto') {
        actualTheme = this.resolveAutoTheme()
      }
      
      // Apply to document root
      try {
        document.documentElement.setAttribute('data-theme', actualTheme)
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute('content', actualTheme === 'dark' ? '#202124' : '#8B4CB8')
        const cs = document.querySelector('meta[name="color-scheme"]')
        if (cs) cs.setAttribute('content', actualTheme === 'dark' ? 'dark' : 'light')
      } catch (e) { /* ignore */ }
    },

    toggleTheme() {
      // Start theme transition circle animation
      this.startThemeTransition()
      
      // Cycle through: light -> dark -> auto -> light
      if (this.theme === 'light') {
        this.theme = 'dark'
      } else if (this.theme === 'dark') {
        this.theme = 'auto'
      } else {
        this.theme = 'light'
      }
      
      // Expand button to show text for 3 seconds
      this.isExpanded = true;
      if (this.expandTimer) clearTimeout(this.expandTimer);
      this.expandTimer = setTimeout(() => {
        this.isExpanded = false;
      }, 3000);
      
      try {
        localStorage.setItem('chatbot_theme', this.theme)
        
        // Determine actual theme to apply (resolve 'auto' to 'light' or 'dark')
        let actualTheme = this.theme
        if (this.theme === 'auto') {
          actualTheme = this.resolveAutoTheme()
        }
        
        document.documentElement.setAttribute('data-theme', actualTheme)
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute('content', actualTheme === 'dark' ? '#202124' : '#8B4CB8')
        const cs = document.querySelector('meta[name="color-scheme"]')
        if (cs) cs.setAttribute('content', actualTheme === 'dark' ? 'dark' : 'light')
      } catch (e) { /* ignore */ }
    },

    getThemeButtonTitle() {
      if (this.theme === 'light') {
        return 'สลับเป็นโหมดมืด'
      } else if (this.theme === 'dark') {
        return 'สลับเป็นโหมดอัตโนมัติ'
      } else {
        return 'สลับเป็นโหมดสว่าง'
      }
    },

    // Resolve 'auto' to an actual theme based on local time (day -> light, night -> dark)
    resolveAutoTheme() {
      try {
        const hour = new Date().getHours()
        return (hour >= 7 && hour < 19) ? 'light' : 'dark'
      } catch (e) {
        return 'light'
      }
    },

    handleSystemThemeChange() {
      // Only update if we're in auto mode — re-evaluate time-based theme (auto uses local time now)
      if (this.theme === 'auto') {
        const actualTheme = this.resolveAutoTheme()
        
        try {
          document.documentElement.setAttribute('data-theme', actualTheme)
          const meta = document.querySelector('meta[name="theme-color"]')
          if (meta) meta.setAttribute('content', actualTheme === 'dark' ? '#202124' : '#8B4CB8')
          const cs = document.querySelector('meta[name="color-scheme"]')
          if (cs) cs.setAttribute('content', actualTheme === 'dark' ? 'dark' : 'light')
        } catch (e) { /* ignore */ }
      }
    },

    parseContactParts(contactStr) {
      if (!contactStr) return [];
      // Remove common prefix and split on commas, semicolons and newlines first (preserve 'หรือ' between URLs)
      let cleaned = String(contactStr).replace(/^(?:เบอร์โทรศัพท์|ติดต่อ)\s*:\s*/i, '').trim();
      // initial split without \sหรือ\s so we can treat 'หรือ' specially
      const initialParts = cleaned.split(/(?:,|;|\r?\n)/i).map(p => p.trim()).filter(Boolean);
      const rawParts = [];
      // Now further split on 'หรือ' ONLY when the fragment does not contain a URL-like pattern
      for (const ip of initialParts) {
        if (/https?:\/\/|www\.|facebook\./i.test(ip)) {
          rawParts.push(ip);
        } else {
          rawParts.push(...ip.split(/\s(?:หรือ)\s/i).map(p => p.trim()).filter(Boolean));
        }
      }

      const parts = [];
      for (let i = 0; i < rawParts.length; i++) {
        let p = rawParts[i];
        // Merge broken URL fragments like 'https:' + 'www.facebook.com...'
        if (/^https?:$/i.test(p) && rawParts[i+1]) {
          p = p + rawParts[i+1];
          i++;
        }
        // Merge fragments where next piece looks like URL continuation
        if (/(facebook\.com|www\.|https?:)/i.test(p) && i+1 < rawParts.length) {
          // if next fragment starts with '?' or contains '=' or looks like a domain continuation (but NOT a full http(s) URL), append it
          while (i+1 < rawParts.length && (/^[\?=&]/.test(rawParts[i+1]) || (/facebook\.com|www\.|\./i.test(rawParts[i+1]) && !/^https?:\/\//i.test(rawParts[i+1])))) {
            p += rawParts[i+1];
            i++;
          }
        }

        // If this part is just 'ต่อ' and previous part is a phone, attach 'ต่อ' to previous
        if (/^ต่อ\s*$/i.test(p) && parts.length > 0) {
          const lastIdx = parts.length - 1;
          const last = parts[lastIdx];
          if (/\b0[- \d]{8,15}\d\b/.test(last)) {
            parts[lastIdx] = `${last} ต่อ`;
            continue;
          }
        }

        // If this part contains a phone followed by space/comma-separated extensions (e.g., '056-717-100 1121 1122'), split them into separate parts
        // If format is 'PHONE ext1 ext2' (space separated), handle it robustly using tokenization
        const tokens = p.split(/\s+/).filter(Boolean);
        if (tokens.length > 1 && /^0[0-9\-\s]{6,}$/.test(tokens[0])) {
          const phoneCandidate = tokens[0];
          const extTokens = tokens.slice(1);
          if (extTokens.every(t => /^[0-9,]+$/.test(t))) {
            p = phoneCandidate;
            // expand comma-separated pieces inside tokens
            const exts = extTokens.flatMap(t => t.split(/[,\s]+/).filter(Boolean));
            if (exts.length) rawParts.splice(i+1, 0, ...exts);
          }
        } else {
          const phoneMatch = p.match(/\b0[- \d]{8,15}\d\b(?!\s+\d)/);
          if (phoneMatch) {
            const phone = phoneMatch[0];
            const rest = p.slice(p.indexOf(phone) + phone.length).trim();
            if (/^[0-9][0-9,\s]*$/.test(rest)) {
              const exts = rest.split(/[,\s]+/).filter(Boolean);
              p = phone;
              if (exts.length) rawParts.splice(i+1, 0, ...exts);
            }
          }
        }

        // If this part is just numeric extensions (e.g., '1122'), try to attach it logically to the previous part.
        if (/^[0-9\s,]+$/.test(p) && parts.length > 0) {
          const lastIdx = parts.length - 1;
          const last = parts[lastIdx];
          const cleanedExt = p.replace(/\s+/g, '').replace(/(^,|,$)/g, '');
          // 1) If previous part already ends with 'ต่อ' or has 'ต่อ digits', append or comma-separate.
          if (/ต่อ\s*(?:\d+)?$/i.test(last) || /ต่อ\s*\d+/i.test(last)) {
            if (/ต่อ\s*$/.test(last)) {
              parts[lastIdx] = `${last} ${cleanedExt}`;
            } else {
              parts[lastIdx] = `${last} หรือ ${cleanedExt}`;
            }
            continue; // consumed this numeric part
          }
          // 2) If previous part looks like a phone number but doesn't have 'ต่อ', attach as 'ต่อ X'
          if (/\b0[- \d]{8,15}\d\b/.test(last)) {
            parts[lastIdx] = `${last} ต่อ ${cleanedExt}`;
            continue;
          }
        }

        parts.push(p);
      }
      return parts;
    },
    joinBrokenUrls(s) {
      if (!s) return s;
      // Join URL fragments split over newlines (e.g. '.../loca\nle=th_TH') safely
      // But do not join when the next line looks like a phone number (starts with 0\d), another URL, 'www.' or the word 'ลิงค์'
      const re = new RegExp('(https?:\\/\\/[^^\\s]+)\\n(?!0\\d|https?:\\/\\/|www\\.|ลิงค์)([A-Za-z0-9\\/\\?#%._=&+\\-:@]+)', 'ig');
      let prev;
      do { prev = s; s = s.replace(re, '$1$2'); } while (s !== prev);
      return s;
    },
    hasContact(raw) {
      // Return true if linkifyText(raw) contains meaningful contact info (not blank or 'ไม่มี')
      const plain = (this.linkifyText(raw || '') || '').replace(/<[^>]+>/g, '').trim();
      return !!plain && !/^ไม่มี$/i.test(plain);
    },
    linkifyText(text) {
      if (!text) return '';

      const knownFacebookPages = {
        'หน่วยหอพักนักศึกษา มหาวิทยาลัยราชภัฏเพชรบูรณ์': 'https://www.facebook.com/dsd.pcru.news/',
        'งาน กยศ. กองพัฒนานักศึกษา มหาวิทยาลัยราชภัฏเพชรบูรณ์': 'https://www.facebook.com/Studentloan.PCRU/?locale=th_TH'
      };

      // This regex finds URLs starting with http, https, ftp, file, or www.
      const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      const phoneRegexWithExt = /\b(0[- \d]{8,15}\d)(\s*(?:ต่อ|ext\.?|x)\s*([\d, ]+))?\b/gi;
      const facebookQuoteRegex = /Facebook "([^"]+)"/g;

      // 1. Replace <br> tags (including encoded ones) to ensure they render.
      let processedText = text.replace(/<br\s*\/?>|&lt;br\s*\/?>/gi, '<br>');

      // 2. Replace known Facebook pages from quotes
      processedText = processedText.replace(facebookQuoteRegex, (match, pageName) => {
          if (knownFacebookPages[pageName]) {
              return `<a href="${knownFacebookPages[pageName]}" target="_blank" rel="noopener noreferrer" class="message-link">${match}</a>`;
          }
          return match;
      });
      
      // And for the other format "Facebook: Page Name"
      const facebookColonRegex = /((?:Facebook|เพจ Facebook)\s*:\s*|ดูที่เพจ Facebook ")([^<"\n]+)(")?/g;
      processedText = processedText.replace(facebookColonRegex, (match, prefix, pageName, suffix) => {
        const trimmedPageName = pageName.trim();
        if (knownFacebookPages[trimmedPageName]) {
          return `${prefix}<a href="${knownFacebookPages[trimmedPageName]}" target="_blank" rel="noopener noreferrer" class="message-link">${trimmedPageName}</a>${suffix||''}`;
        }
        return match;
      });

      // Normalize URLs that may have been split across newlines (e.g., '.../loca\nle=th_TH') so they become contiguous
      // Use RegExp constructor and repeated replace to avoid unterminated regex literals in SFC parsing
      const urlJoinRe = new RegExp('(https?:\\/\\/[^^\\s]+)\\n([A-Za-z0-9\\/\\?#%._=&+\\-:@]+)', 'ig');
      let _prevProcessed;
      do {
        _prevProcessed = processedText;
        processedText = processedText.replace(urlJoinRe, '$1$2');
      } while (processedText !== _prevProcessed);

      // 3. Special handling for "ลิงค์ : ..." lines so multiple URLs are converted individually and joined with ' หรือ '
      processedText = processedText.replace(/(ลิงค์\s*:\s*)([\s\S]*?)(?=(?:\n\S|$))/gi, (match, prefix, list) => {
        // extract URLs inside the list (after we've normalized broken URLs)
        const urlList = [];
        const urlRe = /(https?:\/\/[A-Za-z0-9\/\?#%._=&+\-:@][^\n\s]*)|(www\.[A-Za-z0-9\/\?#%._=&+\-:@][^\n\s]*)/ig;
        let m;
        while ((m = urlRe.exec(list)) !== null) {
          urlList.push(m[0]);
        }
        if (urlList.length === 0) return match; // nothing to do
        const anchors = urlList.map(u => {
          const href = u.toLowerCase().startsWith('www.') ? 'http://' + u : u;
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="message-link">${u}</a>`;
        });
        return prefix + anchors.join(' หรือ ');
      });

      // 4. Find other URLs and wrap them in anchor tags, but avoid doing so inside existing <a> tags.
      const urlParts = processedText.split(/(<a[^>]*>.*?<\/a>)/g);
      for (let i = 0; i < urlParts.length; i++) {
          if (!urlParts[i].startsWith('<a')) {
              urlParts[i] = urlParts[i].replace(urlRegex, function(url) {
                  let href = url;
                  if (url.toLowerCase().startsWith('www.')) {
                      href = 'http://' + url;
                  }
                  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
              });
          }
      }
      processedText = urlParts.join('');


      // 4. Linkify phone numbers, but avoid doing so inside existing <a> tags.
      const phoneParts = processedText.split(/(<a[^>]*>.*?<\/a>)/g);
      for (let i = 0; i < phoneParts.length; i++) {
        if (!phoneParts[i].startsWith('<a')) {
          phoneParts[i] = phoneParts[i].replace(phoneRegexWithExt, function(match, phonePart, extPart, extDigits) {
            const phoneDigits = phonePart.replace(/\D/g, '');
            if (phoneDigits.length === 9 || phoneDigits.length === 10) {
              let telHref = phoneDigits;
              let extText = '';
              if (extDigits) {
                // normalize ext list (comma/space separated) and join with ' หรือ '
                const exts = extDigits.split(/[ ,]+/).map(e => e.replace(/\D/g, '')).filter(Boolean);
                if (exts.length) {
                  // use first ext in href for quick dial pause
                  telHref += ',' + exts[0];
                  extText = ' ต่อ ' + exts.join(' หรือ ');
                }
              }
              // Anchor only around the phone number; extension text remains plain (not underlined)
              return `<a href="tel:${telHref}" class="message-link">${phonePart}</a>${extText}`;
            }
            return match; // not a valid phone number, return as is
          });
        }
      }
      processedText = phoneParts.join('');

      return processedText;
    },
    // Generate snowflake styles once to prevent jank during typing
    async streamText(messageIndex, textToStream) {
      if (!textToStream || !this.messages[messageIndex]) return;

      this.messages[messageIndex].text = ''; // Clear existing text
      // Determine typing delay (ms per character). Prefer explicit VITE_BOT_TYPING_DELAY_MS, fallback to legacy VITE_BOT_TYPING_SPEED.
      const envDelay = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
      let typingDelay = parseInt(envDelay || '12', 10)
      // Clamp to reasonable bounds
      if (Number.isNaN(typingDelay) || typingDelay < 0) typingDelay = 0
      typingDelay = Math.min(Math.max(typingDelay, 0), 200)

      // Split by HTML tags and newlines to preserve them
      const parts = textToStream.split(/(<[^>]+>|\n)/g);
      
      for (const part of parts) {
        if (!part) continue; // Skip empty parts from split

        if (part.match(/<[^>]+>/) || part === '\n') {
          // It's a tag or a newline, append it instantly
          this.messages[messageIndex].text += part;
        } else {
          // It's text, type it out character by character
          for (let i = 0; i < part.length; i++) {
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            if (!this.messages[messageIndex]) return; // Stop if message was cleared
            this.messages[messageIndex].text += part[i];
            
            // Scroll to bottom every few characters to keep it in view
            if (i % 5 === 0) {
              this.scrollToBottom();
            }
          }
        }
      }
    },
    async typeWelcomeMessage() {
      // Construct text with current bot settings
      const title = `สวัสดี <span class="wave-hand" aria-hidden="true">👋</span> ${this.botPronoun}ชื่อ ${this.botName} <br> ผู้ช่วย AI ของ PCRU ค่ะ`
      const sub = `ยินดีที่ได้ช่วยคุณ! มาหาคำตอบที่คุณต้องการกันเลยค่ะ ✨`
      const instr = `เลือกหมวดหมู่ด้านล่าง <br> หรือพิมพ์คำถามได้เลยค่ะ 😊`
      
      // Reset
      this.welcomeTitle = ''
      this.welcomeSub = ''
      this.welcomeInstruction = ''
      
      // Type sequentially
      await this.streamToVariable('welcomeTitle', title)
      await this.streamToVariable('welcomeSub', sub)
      await this.streamToVariable('welcomeInstruction', instr)
    },
    async streamToVariable(key, text) {
      // Use the same typed delay config as streamText
      const envDelay = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
      let typingDelay = parseInt(envDelay || '12', 10)
      if (Number.isNaN(typingDelay) || typingDelay < 0) typingDelay = 0
      typingDelay = Math.min(Math.max(typingDelay, 0), 200)

      const parts = text.split(/(<[^>]+>)/g)
      for (const part of parts) {
        if (part.match(/<[^>]+>/)) {
          this[key] += part
        } else {
          for (const char of part) {
            this[key] += char
            await new Promise(r => setTimeout(r, typingDelay)) // Typing speed
          }
        }
      }
    },

    generateSnowflakeStyles() {
      const styles = []
      const windMax = 150;
      const numGroups = 5;
      const windProfiles = [];

      // Generate wind profiles for each group
      for (let i = 0; i < numGroups; i++) {
        windProfiles.push({
          '--wind1': `${Math.random() * windMax - (windMax / 2)}px`,
          '--wind2': `${Math.random() * windMax - (windMax / 2)}px`,
          '--wind3': `${Math.random() * windMax - (windMax / 2)}px`,
          '--wind4': `${Math.random() * windMax - (windMax / 2)}px`,
        });
      }

      for (let i = 1; i <= this.snowCount; i++) {
        // Assign snowflake to a group
        const groupIndex = i % numGroups;
        const windProfile = windProfiles[groupIndex];

        styles.push({
          left: `${Math.random() * 100}%`,
          animationDuration: `${this.snowMinDuration + Math.random() * (this.snowMaxDuration - this.snowMinDuration)}s`,
          animationDelay: `${Math.random() * 10}s`,
          fontSize: `${this.snowMinSize + Math.random() * (this.snowMaxSize - this.snowMinSize)}em`,
          opacity: this.snowOpacity,
          symbol: i % 2 === 0 ? '❅' : '❆',
          ...windProfile
        })
      }
      // Freeze styles to avoid Vue creating reactive proxies for this array (big perf win)
      this.snowflakeStyles = Object.freeze(styles)
    },

    // Compute snowflake inline style (with drag offset if applicable)
    getSnowflakeStyle(flake, index) {
      const offset = this.snowflakeDragOffsets[index]
      const base = {
        left: flake.left,
        animationDuration: flake.animationDuration,
        animationDelay: flake.animationDelay,
        fontSize: flake.fontSize,
        opacity: flake.opacity,
        '--wind1': flake['--wind1'],
        '--wind2': flake['--wind2'],
        '--wind3': flake['--wind3'],
        '--wind4': flake['--wind4'],
        cursor: 'grab'
      }
      if (offset) {
        // When dragged or released at custom position
        const isDragging = this.draggedSnowflakeIndex === index
        return {
          ...base,
          animationPlayState: 'paused',
          animation: 'none', // Stop animation completely when placed
          position: 'fixed',
          left: `${offset.x}px`,
          top: `${offset.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 99999 : 99991
        }
      }
      return base
    },

    // Check if snowflake should be rendered outside container (dragging or falling)
    isSnowflakeFloating(index) {
      if (this.draggedSnowflakeIndex === index) return true
      const offset = this.snowflakeDragOffsets[index]
      return offset && offset.falling
    },

    // Style for floating snowflakes (dragged or falling, rendered outside container)
    getFloatingSnowflakeStyle(flake, index) {
      const offset = this.snowflakeDragOffsets[index]
      if (!flake || !offset) return { display: 'none' }
      const isDragging = this.draggedSnowflakeIndex === index
      return {
        position: 'fixed',
        left: `${offset.x}px`,
        top: `${offset.y}px`,
        fontSize: flake.fontSize,
        opacity: flake.opacity,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: isDragging ? 999999 : 99999,
        animation: 'none',
        pointerEvents: isDragging ? 'none' : 'auto'
      }
    },

    // Mouse drag handlers
    onSnowflakeMouseDown(e, index) {
      e.stopPropagation()
      this.draggedSnowflakeIndex = index
      // Use mouse position as initial snowflake position (centered on cursor)
      const x = e.clientX - 15
      const y = e.clientY - 15
      this.snowflakeDragOffsets = {
        ...this.snowflakeDragOffsets,
        [index]: { x, y }
      }
      // Bind move/up to window
      window.addEventListener('mousemove', this.onSnowflakeMouseMove)
      window.addEventListener('mouseup', this.onSnowflakeMouseUp)
    },
    onSnowflakeMouseMove(e) {
      if (this.draggedSnowflakeIndex == null) return
      const index = this.draggedSnowflakeIndex
      this.snowflakeDragOffsets = {
        ...this.snowflakeDragOffsets,
        [index]: { x: e.clientX - 15, y: e.clientY - 15 }
      }
    },
    onSnowflakeMouseUp() {
      this.releaseSnowflake()
      window.removeEventListener('mousemove', this.onSnowflakeMouseMove)
      window.removeEventListener('mouseup', this.onSnowflakeMouseUp)
    },

    // Touch drag handlers
    onSnowflakeTouchStart(e, index) {
      if (!e.touches || e.touches.length === 0) return
      e.stopPropagation()
      this.draggedSnowflakeIndex = index
      const touch = e.touches[0]
      // Use touch position as initial snowflake position (centered on finger)
      const x = touch.clientX - 15
      const y = touch.clientY - 15
      this.snowflakeDragOffsets = {
        ...this.snowflakeDragOffsets,
        [index]: { x, y }
      }
      window.addEventListener('touchmove', this.onSnowflakeTouchMove, { passive: false })
      window.addEventListener('touchend', this.onSnowflakeTouchEnd)
      window.addEventListener('touchcancel', this.onSnowflakeTouchEnd)
    },
    onSnowflakeTouchMove(e) {
      if (this.draggedSnowflakeIndex == null) return
      if (!e.touches || e.touches.length === 0) return
      e.preventDefault()
      const touch = e.touches[0]
      const index = this.draggedSnowflakeIndex
      this.snowflakeDragOffsets = {
        ...this.snowflakeDragOffsets,
        [index]: { x: touch.clientX - 15, y: touch.clientY - 15 }
      }
    },
    onSnowflakeTouchEnd() {
      this.releaseSnowflake()
      window.removeEventListener('touchmove', this.onSnowflakeTouchMove)
      window.removeEventListener('touchend', this.onSnowflakeTouchEnd)
      window.removeEventListener('touchcancel', this.onSnowflakeTouchEnd)
    },

    // Release snowflake: start falling from dropped position
    releaseSnowflake() {
      if (this.draggedSnowflakeIndex == null) return
      const index = this.draggedSnowflakeIndex
      const offset = this.snowflakeDragOffsets[index]
      this.draggedSnowflakeIndex = null
      
      if (!offset) return
      
      // Mark as "falling" from current position
      this.snowflakeDragOffsets = {
        ...this.snowflakeDragOffsets,
        [index]: { ...offset, falling: true, startY: offset.y }
      }
      
      // Animate falling
      const fallSpeed = 3 // pixels per frame
      const animateFall = () => {
        const current = this.snowflakeDragOffsets[index]
        if (!current || !current.falling) return
        
        const newY = current.y + fallSpeed
        
        // If fallen off screen, reset to normal animation
        if (newY > window.innerHeight + 50) {
          const newOffsets = { ...this.snowflakeDragOffsets }
          delete newOffsets[index]
          this.snowflakeDragOffsets = newOffsets
          return
        }
        
        // Update position
        this.snowflakeDragOffsets = {
          ...this.snowflakeDragOffsets,
          [index]: { ...current, y: newY }
        }
        
        requestAnimationFrame(animateFall)
      }
      
      requestAnimationFrame(animateFall)
    },

    // Ensure only one tooltip is visible at a time
    hideAllTooltips() {
      try {
        this.showUnlikeTooltip = false
        this.showLikeTooltip = false
        this.showUserTypingTooltip = false
        this.userTypingTooltipStyle = {}
        if (this.unlikeTooltipTimer) { clearTimeout(this.unlikeTooltipTimer); this.unlikeTooltipTimer = null }
        if (this.likeTooltipTimer) { clearTimeout(this.likeTooltipTimer); this.likeTooltipTimer = null }
        // remove tooltip position handlers if any
        if (this._tooltipPositionHandler) {
          window.removeEventListener('resize', this._tooltipPositionHandler)
          window.removeEventListener('scroll', this._tooltipPositionHandler, true)
          this._tooltipPositionHandler = null
        }
      } catch (e) { /* ignore */ }
    },

    // Position the typing tooltip over the last bot avatar using fixed coords so it won't be clipped
    updateTypingTooltipPosition() {
      this.$nextTick(() => {
        try {
          const avatars = this.$el.querySelectorAll('.bot-avatar')
          if (!avatars || avatars.length === 0) return
          const avatar = avatars[avatars.length - 1]
          const rect = avatar.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          // place tooltip above the avatar with extra offset so it doesn't overlap inline action buttons
          let top = rect.top - 64 // base buffer above the avatar

          // on small screens, nudge more so input isn't overlapped
          if (window.innerWidth <= 640) top -= 20
          // when virtual keyboard is open, nudge further up
          if (document.documentElement.classList.contains('keyboard-open')) top -= 40

          // set fixed positioning so tooltip escapes any clipping containers
          // but clamp the horizontal position so the tooltip stays inside the chat panel
          this.$nextTick(() => {
            try {
              const panel = this.$el.querySelector('.chat-panel')
              const tooltipEl = document.querySelector('.typing-tooltip')
              let leftToUse = centerX
              let tailLeftPx = null

              if (panel && tooltipEl) {
                const panelRect = panel.getBoundingClientRect()
                const tipRect = tooltipEl.getBoundingClientRect()

                // clamp centerX so tooltip doesn't overflow panel horizontally (8px padding)
                const minCenter = panelRect.left + (tipRect.width / 2) + 8
                const maxCenter = panelRect.right - (tipRect.width / 2) - 8
                leftToUse = Math.max(minCenter, Math.min(maxCenter, centerX))

                // calculate tooltip left (top-left) and compute tail position relative to tooltip
                const tooltipLeft = leftToUse - (tipRect.width / 2)

                // Compute a stable tail position using the avatar center, but bias toward the left
                const rawTail = centerX - tooltipLeft
                // For narrow tooltips, anchor very close to the left edge for consistent appearance
                if (tipRect.width < 220) {
                  tailLeftPx = 12
                } else {
                  const maxTail = Math.max(12, Math.floor(tipRect.width * 0.35))
                  tailLeftPx = Math.max(10, Math.min(Math.floor(rawTail), maxTail))
                }

                // compute top so tooltip sits just above the avatar (use tooltip height for precise placement)
                const gap = 8
                let computedTop = rect.top - tipRect.height - gap

                // On small screens, keep it closer to avatar
                if (window.innerWidth <= 640) computedTop = rect.top - tipRect.height - 6

                // If keyboard is open, nudge up slightly
                if (document.documentElement.classList.contains('keyboard-open')) computedTop -= 12

                // ensure tooltip stays inside the panel vertically
                const minTop = panelRect.top + 8
                const maxTop = panelRect.bottom - tipRect.height - 8
                computedTop = Math.max(minTop, Math.min(maxTop, computedTop))

                top = computedTop

                // Schedule a recalculation shortly after to handle cases where tooltip width/content changes
                if (this._tooltipRecalcTimer) clearTimeout(this._tooltipRecalcTimer)
                this._tooltipRecalcTimer = setTimeout(() => {
                  try {
                    const newTipRect = tooltipEl.getBoundingClientRect()
                    // Re-clamp horizontal center using updated width
                    const newMinCenter = panelRect.left + (newTipRect.width / 2) + 8
                    const newMaxCenter = panelRect.right - (newTipRect.width / 2) - 8
                    const newLeftToUse = Math.max(newMinCenter, Math.min(newMaxCenter, centerX))

                    // Recompute tail position relative to the tooltip left
                    const newTooltipLeft = newLeftToUse - (newTipRect.width / 2)
                    const rawNewTail = centerX - newTooltipLeft
                    let newTail
                    if (newTipRect.width < 220) {
                      newTail = 12
                    } else {
                      const newMax = Math.max(12, Math.floor(newTipRect.width * 0.35))
                      newTail = Math.max(10, Math.min(Math.floor(rawNewTail), newMax))
                    }

                    // Recompute top so tooltip sits just above avatar
                    const gap = 8
                    let newTop = rect.top - newTipRect.height - gap
                    if (window.innerWidth <= 640) newTop = rect.top - newTipRect.height - 6
                    if (document.documentElement.classList.contains('keyboard-open')) newTop -= 12
                    const newMinTop = panelRect.top + 8
                    const newMaxTop = panelRect.bottom - newTipRect.height - 8
                    newTop = Math.max(newMinTop, Math.min(newMaxTop, newTop))

                    // Apply updated inline styles atomically
                    this.userTypingTooltipStyle = {
                      position: 'fixed',
                      left: `${newLeftToUse}px`,
                      top: `${newTop}px`,
                      transform: 'translateX(-50%) translateY(0)',
                      zIndex: 99999,
                      '--tail-left': `${newTail}px`
                    }
                  } catch (e) { /* ignore safe failures */ }
                }, 140)

              }

              const styleObj = {
                position: 'fixed',
                left: `${leftToUse}px`,
                top: `${top}px`,
                transform: 'translateX(-50%) translateY(0)',
                zIndex: 99999
              }

              if (tailLeftPx !== null) styleObj['--tail-left'] = `${tailLeftPx}px`

              this.userTypingTooltipStyle = styleObj
            } catch (e) { /* ignore safe failures */ }
          })
        } catch (e) { /* ignore */ }
      })
    },
    openTooltip(type) {
      this.hideAllTooltips()
      if (type === 'unlike') this.showUnlikeTooltip = true
      if (type === 'like') this.showLikeTooltip = true
      if (type === 'typing') this.showUserTypingTooltip = true
    },

    // Show tooltip when user hovers / focuses the send button
    onSendBtnMouseEnter(ev) {
      // Avoid showing tooltip when keyboard is open on mobile
      if (document.documentElement.classList.contains('keyboard-open')) return

      try {
        // If input is empty, show a single helpful message
        if (!this.query || !String(this.query).trim()) {
          this.hideAllTooltips()
          this.unlikeTooltipText = 'ต้องพิมพ์ก่อนส่งนะคะ'
          this.showUnlikeTooltip = true

          // Auto-hide after a short delay
          if (this.unlikeTooltipTimer) { clearTimeout(this.unlikeTooltipTimer); this.unlikeTooltipTimer = null }
          this.unlikeTooltipTimer = setTimeout(() => {
            this.showUnlikeTooltip = false
            this.unlikeTooltipTimer = null
          }, 4000)
        } else {
          // If there's already text, do not show the hint tooltip
          this.hideAllTooltips()
        }
      } catch (e) { /* ignore */ }
    },



    onSendBtnMouseLeave(ev) {
      if (this.typingTooltipTimer) {
        clearTimeout(this.typingTooltipTimer)
        this.typingTooltipTimer = null
      }
      this.hideAllTooltips()
    },
    computeTimeGreeting() {
      // Use Bangkok time explicitly to avoid browser timezone differences
      const formatter = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false })
      const hour = Number(formatter.format(new Date()))
      if (hour >= 5 && hour < 11) return 'สวัสดีตอนเช้า ☀️ ขอให้วันนี้สดใสจัง'
      if (hour >= 11 && hour < 13) return 'สวัสดีตอนเที่ยง 🍚 อย่าลืมพักทานข้าวนะคะ'
      if (hour >= 13 && hour < 17) return 'สวัสดีตอนบ่าย 🌤 รีเฟรชพลังแล้วลุยกันต่อ'
      if (hour >= 17 && hour < 20) return 'สวัสดีตอนเย็น 🌇 วันนี้เป็นไงบ้างคะ'
      if (hour >= 20 && hour < 23) return 'สวัสดีตอนค่ำ 🌙 พักผ่อนสายตาบ้างนะ'
      return 'สวัสดีดึกแล้ว 💤 อย่าลืมพักผ่อนให้เพียงพอนะคะ'
    },
    
    // Keyboard detection methods
    handleKeyboardDetection() {
      const currentHeight = window.innerHeight
      const heightDiff = this.initialViewportHeight - currentHeight
      
      // If viewport shrinks by more than 150px, keyboard is likely open
      if (heightDiff > 150) {
        this.isKeyboardOpen = true
        document.documentElement.classList.add('keyboard-open')
      } else {
        this.isKeyboardOpen = false
        document.documentElement.classList.remove('keyboard-open')
      }
    },
    onInputFocus() {
      // 💬 แสดง tooltip เมื่อคลิกที่ช่องพิมพ์
      // Clear timer ก่อนหน้า
      if (this.unlikeTooltipTimer) {
        clearTimeout(this.unlikeTooltipTimer)
        this.unlikeTooltipTimer = null
      }
      // Close other tooltips to avoid overlap
      this.hideAllTooltips()
      // บันทึกการกดช่องคำถามถี่ ๆ และตอบกลับแบบน่ารักเมื่อถึงเกณฑ์
      this.trackRapidInputFocus()
      
      // แสดง tooltip บางครั้งเท่านั้น: จำกัดความถี่ + random chance
      try {
        const now = Date.now()
        const allowByTime = now >= (this.inputTooltipCooldownUntil || 0)
        const allowByChance = Math.random() <= (this.inputTooltipShowProbability || 0.5)
        if (allowByTime && allowByChance) {
          const randomIndex = Math.floor(Math.random() * this.dynamicUnlikeMessages.length)
          this.unlikeTooltipText = this.dynamicUnlikeMessages[randomIndex]
          this.showUnlikeTooltip = true
          // ปิด tooltip หลัง 5 วินาที
          this.unlikeTooltipTimer = setTimeout(() => {
            this.showUnlikeTooltip = false
            this.unlikeTooltipTimer = null
          }, 5000)
          // ตั้งคูลดาวน์ครั้งต่อไป
          this.inputTooltipCooldownUntil = now + (this.inputTooltipMinIntervalMs || 3000)
        }
      } catch (e) { /* ignore */ }

      // Slight delay to let viewport adjust
      setTimeout(() => {
        this.handleKeyboardDetection()
        // Reactive fallback: set panelFocused so CSS can react reliably
        this.panelFocused = true
        // Position the send button exactly over the input so it overlays avatars/messages
        this.updateSendBtnPosition()
        // Add temporary listeners while focused so button follows scrolling/resizing
        this._sendBtnPositionHandler = () => this.updateSendBtnPosition()
        window.addEventListener('resize', this._sendBtnPositionHandler)
        window.addEventListener('scroll', this._sendBtnPositionHandler, true)
      }, 300)
    },
    onInputBlur() {
      // Slight delay to let viewport adjust back
      setTimeout(() => {
        this.handleKeyboardDetection()
        // Reactive cleanup: unset panelFocused so CSS reverts
        this.panelFocused = false
        // Hide any typing hint tooltip and clear timer
        this.showUserTypingTooltip = false
        if (this.typingTooltipTimer) { clearTimeout(this.typingTooltipTimer); this.typingTooltipTimer = null }
        // Clear autocomplete suggestion and composition state
        this.suggestionText = ''
        this.isComposing = false
        // Clear the measured send button positioning and remove listeners
        this.sendBtnFixedStyle = null
        try {
          if (this._sendBtnPositionHandler) {
            window.removeEventListener('resize', this._sendBtnPositionHandler)
            window.removeEventListener('scroll', this._sendBtnPositionHandler, true)
            this._sendBtnPositionHandler = null
          }
        } catch (e) { /* ignore */ }
      }, 300)
    },
    // ตรวจจับการกดช่องคำถามถี่ ๆ และให้บอทพูด
    trackRapidInputFocus() {
      try {
        const now = Date.now()
        // คูลดาวน์กันสแปมสำหรับการนับคลิก
        if (now < (this.inputFocusCooldownUntil || 0)) return
        // เก็บเฉพาะ 3 วิล่าสุด
        const windowMs = 3000
        this.inputFocusTimestamps = (this.inputFocusTimestamps || []).filter(t => now - t < windowMs)
        this.inputFocusTimestamps.push(now)
        // ต้องคลิก >= 4 ครั้งภายใน 3 วิ และผ่านคูลดาวน์ bot-nudge + โชคจึงจะพูด
        const canNudgeByTime = now - (this.lastBotNudgeAt || 0) >= (this.botNudgeMinIntervalMs || 45000)
        const canNudgeByChance = Math.random() <= 0.5
        if (this.inputFocusTimestamps.length >= 4 && canNudgeByTime && canNudgeByChance) {
          const playful = [
            'เอ๊ะ... กำลังคิดคำถามอยู่หรอคะ ☁️',
            `${this.botPronoun}รอฟังอยู่นะคะ ลองพิมพ์มาได้เลย ✨`,
            `ลองพิมพ์ดูสิคะ เดี๋ยว${this.botPronoun}ช่วยหาให้เอง 💜`
          ]
          const text = playful[Math.floor(Math.random() * playful.length)]
          // ส่งแบบมี typing เล็กน้อยให้ดูเป็นธรรมชาติ
          this.sendBotReply(text, 800)
          // รีเซ็ตและตั้งคูลดาวน์
          this.inputFocusTimestamps = []
          this.inputFocusCooldownUntil = now + 20000
          this.lastBotNudgeAt = now
        }
      } catch (e) { /* ignore */ }
    },
    // 💤 Idle tracking for sleeping bot animation
    startIdleTracking() {
      // รีเซ็ต timer และตื่น
      this.resetIdleTimer()
      this.idleLastActivity = Date.now()
      if (this.idleCheckInterval) {
        clearInterval(this.idleCheckInterval)
      }
      // ตรวจเช็กทุก 0.5 วิ ป้องกันกรณี timeout ถูกเคลียร์ไปโดยไม่ตั้งกลับ
      this.idleCheckInterval = setInterval(() => {
        const now = Date.now()
        if (now - this.idleLastActivity >= this.idleTimeout) {
          this.triggerBotSleep()
        }
      }, 500)
      // ติดตาม user activity events
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.addEventListener(event, this.resetIdleTimer, { passive: true })
      })
    },
    stopIdleTracking() {
      // ลบ event listeners
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.removeEventListener(event, this.resetIdleTimer)
      })
      // เคลียร์ timer
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
      if (this.idleCheckInterval) {
        clearInterval(this.idleCheckInterval)
        this.idleCheckInterval = null
      }
      this.isBotSleeping = false
    },
    resetIdleTimer() {
      this.idleLastActivity = Date.now()
      // ถ้าบอทหลับอยู่ ให้ตื่นขึ้น
      if (this.isBotSleeping) {
        this.isBotSleeping = false
        // แสดง animation การตื่น
        this.isBotWakingUp = true
        setTimeout(() => {
          this.isBotWakingUp = false
        }, 1000) // แสดง 1 วินาที
      }
      // เคลียร์ timer เก่า
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
      }
      // ตั้ง timer ใหม่
      this.idleTimer = setTimeout(() => {
        this.triggerBotSleep()
      }, this.idleTimeout)
    },
    triggerBotSleep() {
      // หลีกเลี่ยงซ้อนทับ animation
      if (this.isBotSleeping) return
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
      this.isBotWakingUp = false
      this.isBotSleeping = true
    },
    // Simulate a keyboard open/close cycle on initial load (mobile only)
    simulateKeyboardCycle() {
      try {
        if (this.hasSimulatedKeyboardCycle) return
        const ua = navigator.userAgent || ''
        const isMobile = /iPhone|Android|iPad|iPod/i.test(ua)
        const input = this.$refs.inputBox
        if (!isMobile || !input) return
        this.hasSimulatedKeyboardCycle = true
        // Focus to open keyboard, then blur to close, with gentle delays
        setTimeout(() => {
          try { input.focus() } catch (e) {}
          setTimeout(() => {
            this.handleKeyboardDetection()
            try { input.blur() } catch (e) {}
            setTimeout(() => {
              this.handleKeyboardDetection()
              document.documentElement.classList.add('keyboard-initialized')
            }, 400)
          }, 600)
        }, 300)
      } catch (e) {
        // fail-safe: do nothing
      }
    },

    // Measure input position — we prefer CSS absolute inside the footer.
    // Clear any inline fixed positioning so layout is driven by CSS rules.
    updateSendBtnPosition() {
      try {
        const input = this.$refs.inputBox
        if (!input) {
          this.sendBtnFixedStyle = null
          return
        }
        // Let CSS handle positioning; clearing inline styles prevents the button from moving
        this.sendBtnFixedStyle = null
      } catch (e) {
        // ignore measurement errors
      }
    },


    
    // Get category icon SVG - delegates to config file for flexibility
    getCategoryIcon(categoryTitle, iconType = null) {
      // ใช้ function จาก config file - สามารถแก้ไข icon ได้ที่ src/config/categoryIcons.js
      // รองรับ iconType จาก backend (optional) หรือ auto-detect จากชื่อหมวดหมู่
      return getIconSvg(categoryTitle, iconType)
    },
    // ฟังก์ชันนี้สามารถลบได้ - เก็บไว้เพื่อ backward compatibility
    _OLD_getCategoryIcon_DEPRECATED(categoryTitle) {
      const title = categoryTitle?.toLowerCase() || ''
      
      // ข่าวสาร - Newspaper (ย้ายไปแล้ว)
      if (title.includes('ข่าว') || title.includes('news')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="news-paper" x="4" y="5" width="16" height="16" rx="2" stroke="white" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="60">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
          </rect>
          <line class="news-line-1" x1="7" y1="9" x2="17" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="10" stroke-dashoffset="10">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.2s" fill="freeze"/>
          </line>
          <line class="news-line-2" x1="7" y1="13" x2="13" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="6" stroke-dashoffset="6">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
          </line>
          <line class="news-line-3" x1="7" y1="16" x2="17" y2="16" stroke="white" stroke-width="1" stroke-linecap="round" stroke-dasharray="10" stroke-dashoffset="10">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.4s" fill="freeze"/>
          </line>
        </svg>`
      }
      
      // ทุนการศึกษา - Money/Scholarship
      if (title.includes('ทุน') || title.includes('scholarship')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle class="coin-outer" cx="12" cy="12" r="8" stroke="white" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="50">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
          </circle>
          <circle class="coin-inner" cx="12" cy="12" r="5" stroke="white" stroke-width="1.5" stroke-dasharray="32" stroke-dashoffset="32">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.4s" begin="0.2s" fill="freeze"/>
          </circle>
          <text x="12" y="15" text-anchor="middle" fill="white" font-size="10" font-weight="bold" opacity="0">
            <animate attributeName="opacity" to="1" dur="0.3s" begin="0.4s" fill="freeze"/>฿
          </text>
        </svg>`
      }
      
      // บริการนักศึกษา - User/Student Service
      if (title.includes('บริการ') || title.includes('นักศึกษา') || title.includes('service')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle class="user-head" cx="12" cy="8" r="3" stroke="white" stroke-width="2" stroke-dasharray="19" stroke-dashoffset="19">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" fill="freeze"/>
          </circle>
          <path class="user-body" d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="22" stroke-dashoffset="22">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" begin="0.2s" fill="freeze"/>
          </path>
        </svg>`
      }
      
      // หอพัก/บ้านพัก - Building/Dormitory/House
      if (title.includes('หอพัก') || title.includes('ที่พัก') || title.includes('บ้าน') || title.includes('dorm') || title.includes('house')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="building" d="M3 21h18M4 21V7l8-4 8 4v14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="70" stroke-dashoffset="70">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" fill="freeze"/>
          </path>
          <rect class="window-1" x="8" y="11" width="2" height="2" fill="white" opacity="0">
            <animate attributeName="opacity" to="1" dur="0.2s" begin="0.4s" fill="freeze"/>
          </rect>
          <rect class="window-2" x="14" y="11" width="2" height="2" fill="white" opacity="0">
            <animate attributeName="opacity" to="1" dur="0.2s" begin="0.5s" fill="freeze"/>
          </rect>
          <rect class="window-3" x="8" y="15" width="2" height="2" fill="white" opacity="0">
            <animate attributeName="opacity" to="1" dur="0.2s" begin="0.6s" fill="freeze"/>
          </rect>
          <rect class="window-4" x="14" y="15" width="2" height="2" fill="white" opacity="0">
            <animate attributeName="opacity" to="1" dur="0.2s" begin="0.7s" fill="freeze"/>
          </rect>
        </svg>`
      }
      
      // การศึกษา/หลักสูตร - Book/Education
      if (title.includes('การศึกษา') || title.includes('หลักสูตร') || title.includes('วิชา')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="book" d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.4s" fill="freeze"/>
          </path>
          <path class="book-cover" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="80" stroke-dashoffset="80">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" begin="0.2s" fill="freeze"/>
          </path>
        </svg>`
      }
      
      // ติดต่อ/สอบถาม - Phone/Contact
      if (title.includes('ติดต่อ') || title.includes('สอบถาม') || title.includes('contact')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="phone" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="100">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.7s" fill="freeze"/>
          </path>
        </svg>`
      }
      
      // รับสมัคร/สมัคร - Clipboard/Application
      if (title.includes('รับสมัคร') || title.includes('สมัคร') || title.includes('application')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="clipboard" x="5" y="3" width="14" height="18" rx="2" stroke="white" stroke-width="2" stroke-dasharray="68" stroke-dashoffset="68">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.6s" fill="freeze"/>
          </rect>
          <path class="clip-top" d="M9 3h6v2H9z" stroke="white" stroke-width="2" stroke-dasharray="14" stroke-dashoffset="14">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
          </path>
          <path class="checkmark" d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10" stroke-dashoffset="10">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.5s" fill="freeze"/>
          </path>
        </svg>`
      }
      
      // อบรม/กิจกรรม - Calendar/Event
      if (title.includes('อบรม') || title.includes('กิจกรรม') || title.includes('event')) {
        return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="calendar" x="3" y="6" width="18" height="15" rx="2" stroke="white" stroke-width="2" stroke-dasharray="66" stroke-dashoffset="66">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
          </rect>
          <line class="cal-top" x1="3" y1="10" x2="21" y2="10" stroke="white" stroke-width="2" stroke-dasharray="18" stroke-dashoffset="18">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
          </line>
          <line class="cal-hook-1" x1="8" y1="3" x2="8" y2="7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="4" stroke-dashoffset="4">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.2s" begin="0.5s" fill="freeze"/>
          </line>
          <line class="cal-hook-2" x1="16" y1="3" x2="16" y2="7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="4" stroke-dashoffset="4">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.2s" begin="0.6s" fill="freeze"/>
          </line>
        </svg>`
      }
      
      // Default - Info/Question mark
      return `<svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="info-circle" cx="12" cy="12" r="9" stroke="white" stroke-width="2" stroke-dasharray="57" stroke-dashoffset="57">
          <animate attributeName="stroke-dashoffset" to="0" dur="0.5s" fill="freeze"/>
        </circle>
        <path class="info-i" d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8" stroke-dashoffset="8">
          <animate attributeName="stroke-dashoffset" to="0" dur="0.3s" begin="0.3s" fill="freeze"/>
        </path>
      </svg>`
    },
    // AI intro overlay controls
    openAiIntro() { this.showAiIntro = true },
    closeAiIntro() { this.showAiIntro = false },
    // Help modal controls
    openHelpModal() { this.showHelpModal = true },
    // Trigger mini help press animation and open modal (supports keyboard activation)
    triggerMiniHelp() {
      try {
        const el = this.$refs.miniHelpBtn
        if (el) {
          el.classList.remove('pressed')
          // Force reflow to restart animation
          void el.offsetWidth
          el.classList.add('pressed')
          setTimeout(() => { el.classList.remove('pressed') }, 450)
        }
      } catch (e) { /* ignore */ }
      // Slight delay so the press animation/ripple is visible before opening the modal
      setTimeout(() => { this.openHelpModal() }, 180)
    },
    // Dismiss the mini help button until chat is cleared
    dismissMiniHelp() {
      try { localStorage.setItem('chatbot_mini_help_dismissed', '1') } catch (e) {}
      this.miniHelpDismissed = true
    },
    closeHelpModal() { 
      // Close help modal and return to chat
      this.showHelpModal = false
      this.showAiIntro = false
      // Ensure chat drawer is open but do NOT force focusing the input (avoid opening keyboard)
      this.$nextTick(() => {
        if (!this.visible) {
          this.visible = true
        }
        // Do not autofocus input to prevent forcing keyboard to open on mobile
      })
    },
    // Parallax tilt interactions (throttled via rAF)
    onAiMouseMove(e) {
      // Cancel any pending frame
      if (this.aiTiltRafId) cancelAnimationFrame(this.aiTiltRafId)
      const target = e.currentTarget
      this.aiTiltRafId = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect()
        const rx = (e.clientX - rect.left) / rect.width - 0.5
        const ry = (e.clientY - rect.top) / rect.height - 0.5
        // update atomically to minimize reactive work
        this.aiTilt = { x: rx * 8, y: -ry * 8, s: 1.02 }
        this.aiTiltRafId = null
      })
    },
    onAiMouseLeave() {
      if (this.aiTiltRafId) { cancelAnimationFrame(this.aiTiltRafId); this.aiTiltRafId = null }
      this.aiTilt = { x: 0, y: 0, s: 1 }
    },
    // embedding removed; toggleEmbedScripts omitted
    toggle(i, evt, msg = null) {
      // เก็บ element ปุ่มที่ถูกกดไว้ก่อน เพื่อใช้อ้างอิงตอนเลื่อนจอ
      const clickedElement = evt ? evt.currentTarget : null
      // If a message object is provided, keep open state local to that message
      if (msg) {
        if (!msg.openIndexes) {
          if (this.$set) this.$set(msg, 'openIndexes', [])
          else msg.openIndexes = []
        }

        const idxMsg = msg.openIndexes.indexOf(i)
        if (idxMsg === -1) {
          // Open this index and ensure only one open per message
          msg.openIndexes = [i]
        } else {
          // It was open, so close it
          msg.openIndexes = []
        }

        // Persist message changes
        this.saveChatHistory()

        // If opened, scroll to bottom after DOM/transition
        if (idxMsg === -1) {
          this.$nextTick(() => {
            setTimeout(() => {
              // this.scrollToBottom() <-- Removed to prevent jumping
              this.updateAnchoring()
              if (clickedElement && typeof clickedElement.scrollIntoView === 'function') {
                clickedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }
            }, 300)
          })
        }

        return
      }

      // Fallback: global openIndexes (used by welcome/top categories)
      const idx = this.openIndexes.indexOf(i)
      if (idx === -1) {
        // Open this index and close all others (single-open behavior)
        this.openIndexes = [i]
      } else {
        // It was already open - close it
        this.openIndexes = []
      }
      
      // Save category state to localStorage (single index only)
      this.saveCategoryState()

      // Ensure chat panel scrolls to bottom when opening an accordion
      if (idx === -1) {
        this.$nextTick(() => {
          // Wait for DOM update and accordion transition to finish
          setTimeout(() => {
            // this.scrollToBottom() <-- Removed to prevent jumping
            this.updateAnchoring()
            if (clickedElement && typeof clickedElement.scrollIntoView === 'function') {
              clickedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          }, 300)
        })
      }
    },
    // Show bot typing animation then reveal the reply text
    // sendBotReply now supports inserting at top when `options.insertAtTop` is true.
    // This keeps behavior backward-compatible: when `options` is omitted, it appends as before.
    sendBotReply(text, delay = 1200, options = {}) {
      if (!text) return
      const insertAtTop = !!options.insertAtTop

      // Determine configured typing delay preference (ms per char) and minimal indicator (ms)
      const envDelay = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
      let typingDelay = parseInt(envDelay || '12', 10)
      if (Number.isNaN(typingDelay) || typingDelay < 0) typingDelay = 0
      const indicatorMs = parseInt(import.meta.env.VITE_BOT_TYPING_INDICATOR_MS || '0', 10) || 0

      // Helper to add message placeholder at specific index
      const insertMessageAt = (index, msgObj) => {
        if (index >= this.messages.length) {
          this.messages.push(msgObj)
        } else {
          this.messages.splice(index, 0, msgObj)
        }
      }

      // If in instant mode and no indicator requested, skip showing a typing placeholder
      if (typingDelay === 0 && indicatorMs === 0) {
        const idx = insertAtTop ? 0 : this.messages.length
        insertMessageAt(idx, { id: ++this.messageIdCounter, type: 'bot', text, typing: false, timestamp: new Date().toISOString() })
        this.saveChatHistory()
        this.$nextTick(() => {
          if (insertAtTop) this.scrollToTop()
          else this.scrollToBottom()
          this.updateAnchoring()
        })
        return
      }

      // Otherwise, show a typing placeholder (either because typingDelay > 0 or indicatorMs > 0)
      // Determine where to insert the typing placeholder
      let idx
      if (options.insertAfterUser) {
        // find last user message
        let lastUserIndex = -1
        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (this.messages[i] && this.messages[i].type === 'user') { lastUserIndex = i; break }
        }
        idx = lastUserIndex >= 0 ? lastUserIndex + 1 : this.messages.length
      } else {
        idx = insertAtTop ? 0 : this.messages.length
      }

      insertMessageAt(idx, { id: ++this.messageIdCounter, type: 'bot', text: '', typing: true })
      this.saveChatHistory()
      this.$nextTick(() => {
        // Scroll behavior depends on insertion point: prefer to show the inserted bot message
        const panelBody = this.$refs.panelBody
        if (panelBody) {
          const botEls = panelBody.querySelectorAll('.message-wrapper.bot')
          const lastBot = botEls && botEls.length ? botEls[botEls.length - 1] : null
          if (lastBot && typeof lastBot.scrollIntoView === 'function') {
            try { lastBot.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch (e) { if (insertAtTop) this.scrollToTop(); else this.scrollToBottom() }
          } else {
            if (insertAtTop) this.scrollToTop(); else this.scrollToBottom()
          }
        } else {
          if (insertAtTop) this.scrollToTop(); else this.scrollToBottom()
        }
        this.updateAnchoring()
      })

      // When we later reveal the message, ensure we wait at least indicatorMs (if set) or use provided delay
      const timerId = setTimeout(() => {
        // If message index still exists, set text and clear typing
        if (this.messages[idx] && this.messages[idx].type === 'bot') {
          this.messages[idx].typing = false
          this.messages[idx]._temp = false
          this.messages[idx].text = text
          this.messages[idx].timestamp = new Date().toISOString()
          this.saveChatHistory()
          this.$nextTick(() => {
            if (insertAtTop) this.scrollToTop()
            else this.scrollToBottom()
            this.updateAnchoring()
          })
        }
        // remove timer id from array
        const i = this.botTypingTimers.indexOf(timerId)
        if (i !== -1) this.botTypingTimers.splice(i, 1)
      }, delay || (indicatorMs || 0))

      // store timer so it can be cancelled if chat closes/unmounts
      this.botTypingTimers.push(timerId)
    },
    // Called when user clicks a category sub-item.
    // item may be a string or an object. catIdx and itemIdx indicate the position
    selectCategoryItem(itemOrText, catIdx, itemIdx, evt) {
      // resolve label; for top-level category clicks (no sub-items), use the category title
      let label = (typeof itemOrText === 'string') ? itemOrText : (itemOrText.label || itemOrText.text || '')
      if (!label && this.categories && this.categories[catIdx]) {
        label = this.categories[catIdx].title || ''
      }
      if (!label) return

      // If already disabled, ignore (applies to sub-items only)
      if (typeof itemOrText === 'object' && itemOrText._disabled) return

      // mark this category sub-item as disabled so user can't select again; skip for top-level
      const hasItems = !!(this.categories && this.categories[catIdx] && this.categories[catIdx].items)
      const isTopLevelClick = !hasItems || itemIdx == null
      if (!isTopLevelClick) {
        try {
          this.$set ? this.$set(this.categories[catIdx].items, itemIdx, { label, _disabled: true }) : (this.categories[catIdx].items[itemIdx] = { label, _disabled: true })
          // persist categories disabled state so it survives reload
          try { localStorage.setItem('chatbot_categories', JSON.stringify(this.categories)) } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
      }

      // Stop welcome typing and set the query
      this.welcomeTyping = false
      this.query = label

      // Send immediately and scroll to bottom to show the sent message
      this.onSend()
      
      // Scroll to bottom after message is added
      this.$nextTick(() => {
        if (this.$refs.panelBody) {
          this.$refs.panelBody.scrollTo({
            top: this.$refs.panelBody.scrollHeight,
            behavior: 'smooth'
          })
        }
        this.updateAnchoring()
      })
    },
    onTyping() {
      // Ignore autocomplete while IME composition active
      if (this.isComposing) return

      // Animation-only typing feedback; tooltip handled on focus/blur
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
      }
      if (this.animationEnabled) {
        this.isTyping = true
        if (this.particleEnabled) {
          this.createParticles()
        }
      }

      // --- 1) Typing hint for 'เมนู' (show fixed instructional message) ---
      try {
        const raw = (this.query || '').toString()
        const normalized = raw.replace(/\s+/g, '') // remove spaces (handles 'เ ม น ู')
        const target = 'เมนู'
        if (normalized && target.startsWith(normalized)) {
          const now = Date.now()
          const allowByTime = now >= (this.inputTooltipCooldownUntil || 0)
          const allowByChance = Math.random() <= (this.inputTooltipShowProbability || 0.5)
          if (allowByTime && allowByChance) {
            this.hideAllTooltips()
            // Show fixed instruction using the unlike tooltip component
            this.unlikeTooltipText = 'พิมพ์ เมนู คำเดียว แล้วกดส่ง เพื่อเปิด เมนูได้นะคะ'
            this.showUnlikeTooltip = true

            if (this.unlikeTooltipTimer) { clearTimeout(this.unlikeTooltipTimer); this.unlikeTooltipTimer = null }
            this.unlikeTooltipTimer = setTimeout(() => {
              this.showUnlikeTooltip = false
              this.unlikeTooltipTimer = null
            }, 5000)

            // Set cooldown so it won't appear too frequently
            this.inputTooltipCooldownUntil = now + (this.inputTooltipMinIntervalMs || 3000)
          }
        } else {
          // If user stops matching 'เมนู', hide the tooltip
          if (this.showUnlikeTooltip) {
            this.showUnlikeTooltip = false
            if (this.unlikeTooltipTimer) { clearTimeout(this.unlikeTooltipTimer); this.unlikeTooltipTimer = null }
          }
        }
      } catch (e) { /* ignore detection errors */ }

      // --- 2) Autocomplete / Ghost Suggestion ---
      try {
        const input = (this.query || '').toString()
        if (!input || input.trim().length < 2) {
          this.suggestionText = ''
          if (this.autocompleteSuggestTimer) {
            clearTimeout(this.autocompleteSuggestTimer)
            this.autocompleteSuggestTimer = null
          }
        } else {
          this.queueAutocompleteSuggestion(input)
        }
      } catch (e) { this.suggestionText = '' }

      // End typing animation shortly after input stops
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false
      }, 300)
    },

    // --- Autocomplete helpers ---
    getAutocompleteContext(fullText) {
      const raw = (fullText || '').toString()
      if (!raw) return null

      // Treat whitespace + punctuation as token separators
      const isSep = (ch) => {
        // Includes common punctuation and Thai/Unicode punctuation variants
        return /[\s.,!?;:()\[\]{}"'“”‘’。、，。·…—–\-/_\\]/.test(ch)
      }

      // If the last char is a separator, don't suggest (user just finished a token)
      const lastChar = raw[raw.length - 1]
      if (lastChar && isSep(lastChar)) return null

      // Find last separator index
      let sepIndex = -1
      for (let i = raw.length - 1; i >= 0; i--) {
        if (isSep(raw[i])) { sepIndex = i; break }
      }

      const basePrefix = raw.slice(0, sepIndex + 1)
      const baseToken = raw.slice(sepIndex + 1)
      if (!baseToken || baseToken.trim().length < 1) return null

      // Fallback: if user types everything stuck together (no spaces/punct),
      // try to autocomplete a short suffix at the end (e.g., ...กย -> ...กยศ)
      // We only attempt this when the current "token" is long enough.
      const tokenTrim = baseToken.trim()
      const shouldTrySuffix = sepIndex === -1 && tokenTrim.length > 3
      if (shouldTrySuffix) {
        const tokenLower = tokenTrim.toLowerCase()
        const maxLen = Math.min(10, tokenLower.length)
        // Prefer longer suffixes first
        for (let len = maxLen; len >= 2; len--) {
          const subToken = tokenTrim.slice(tokenTrim.length - len)
          const subLower = subToken.toLowerCase()
          const hasMatch = (this.autocompleteKeywords || []).some(k => {
            if (!k) return false
            const kw = k.toString()
            const kwLower = kw.toLowerCase()
            return kwLower.startsWith(subLower) && kwLower !== subLower
          })
          if (hasMatch) {
            const leading = tokenTrim.slice(0, tokenTrim.length - len)
            return { prefix: basePrefix + leading, token: subToken }
          }
        }
      }

      return { prefix: basePrefix, token: baseToken }
    },

    applyLocalAutocomplete(fullText) {
      try {
        const raw = (fullText || '').toString()
        const ctx = this.getAutocompleteContext(raw)
        if (!ctx) {
          this.suggestionText = ''
          return
        }

        // Keep local autocomplete conservative: require 2+ chars.
        // Single-char suggestions are handled via remote stopword-only endpoint.
        if ((ctx.token || '').toString().trim().length < 2) {
          this.suggestionText = ''
          return
        }

        const { prefix, token } = ctx
        const tokenLower = token.toLowerCase()
        const match = (this.autocompleteKeywords || []).find(k => {
          if (!k) return false
          const kw = k.toString()
          const kwLower = kw.toLowerCase()
          return kwLower.startsWith(tokenLower) && kwLower !== tokenLower
        })
        if (match) {
          const matchStr = match.toString()
          this.suggestionText = prefix + token + matchStr.slice(token.length)
        } else {
          this.suggestionText = ''
        }
      } catch (e) {
        this.suggestionText = ''
      }
    },

    pickAutocompleteSuggestionText(fullText, suggestions) {
      const raw = (fullText || '').toString()
      const ctx = this.getAutocompleteContext(raw)
      if (!ctx) return ''

      const { prefix, token } = ctx
      const tokenLower = token.toLowerCase()
      const arr = Array.isArray(suggestions) ? suggestions : []

      for (const item of arr) {
        const text = typeof item === 'string' ? item : (item && item.text)
        if (!text) continue
        const s = text.toString()
        const sLower = s.toLowerCase()
        if (sLower.startsWith(tokenLower) && sLower !== tokenLower) {
          return prefix + token + s.slice(token.length)
        }
      }
      return ''
    },

    queueAutocompleteSuggestion(fullText) {
      const inputStr = (fullText || '').toString()

      // Instant local suggestion for responsiveness (fallback)
      this.applyLocalAutocomplete(inputStr)

      // Debounce remote requests
      if (this.autocompleteSuggestTimer) {
        clearTimeout(this.autocompleteSuggestTimer)
        this.autocompleteSuggestTimer = null
      }

      const ctx = this.getAutocompleteContext(inputStr)
      if (!ctx) return

      const { token } = ctx

      const seq = ++this.autocompleteSuggestSeq
      this.autocompleteSuggestTimer = setTimeout(async () => {
        // Ignore autocomplete while IME composition active
        if (this.isComposing) return

        const currentInput = (this.query || '').toString()
        if (!currentInput || currentInput !== inputStr) return

        // Recompute token at request time (in case whitespace changed)
        const liveCtx = this.getAutocompleteContext(currentInput)
        if (!liveCtx) return

        try {
          const res = await this.$axios.get('/autocomplete/suggest', {
            params: { q: liveCtx.token, limit: 20 }
          })

          // Ignore stale results
          if (seq !== this.autocompleteSuggestSeq) return

          const payload = res && res.data ? res.data : null
          const suggestions = payload?.data?.suggestions || payload?.suggestions || []
          const picked = this.pickAutocompleteSuggestionText(currentInput, suggestions)

          // Only apply if input hasn't changed since request was queued
          if ((this.query || '').toString() === inputStr) {
            this.suggestionText = picked
          }
        } catch (e) {
          // Network/backend failure: keep local suggestion
        }
      }, 120)
    },
    createParticles() {
      const inputBox = this.$refs.inputBox
      const canvas = this.$refs.particleCanvas
      if (!inputBox || !canvas) return
      
      const rect = inputBox.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      
      // Get approximate text width using a more accurate method
      const fontSize = 14 // from CSS
      const charWidth = fontSize * 0.45 // average character width
      const textWidth = this.query.length * charWidth
      
      // Position at the end of text (where cursor is)
      const x = rect.left - canvasRect.left + 3 + textWidth
      const y = rect.top - canvasRect.top + rect.height / 0.9
      
      // Firework colors - purple gradient
      const colors = ['#8B4CB8', '#6B2C91', '#9C5EC9', '#B87FD9', '#C99FE5']
      const particleCount = 1 // more particles for firework effect
      
      // Create particles in circular pattern (falling petals)
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        // Much slower horizontal movement for floating effect
        const speed = 0.05 + Math.random() * 0.5
        
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: 0.5 + Math.random() * 0.3, // slight downward movement
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2, // slow rotation
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 1 // 2-3px petal size
        })
      }
      
      // Start animation if not already running
      if (!this.particleAnimationFrame) {
        this.animateParticles()
      }
    },

    acceptSuggestion() {
      if (!this.suggestionText) return
      this.query = this.suggestionText
      this.suggestionText = ''
      this.$nextTick(() => {
        const input = this.$refs.inputBox
        if (input && typeof input.focus === 'function') {
          input.focus()
          const len = (this.query || '').length
          try { input.setSelectionRange(len, len) } catch (e) { /* ignore */ }
        }
      })
    },
    checkAcceptSuggestion(e) {
      if (!this.suggestionText) return
      const input = e && e.target ? e.target : this.$refs.inputBox
      try {
        if (input.selectionEnd === input.value.length) {
          this.query = this.suggestionText
          this.suggestionText = ''
          this.$nextTick(() => {
            try { input.setSelectionRange(this.query.length, this.query.length); input.focus() } catch (e) {}
          })
        }
      } catch (err) { /* ignore */ }
    },
    onCompositionStart() { this.isComposing = true },
    onCompositionEnd() { this.isComposing = false; this.$nextTick(() => this.onTyping()) },
    animateParticles() {
      const canvas = this.$refs.particleCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Reverse loop to avoid creating new arrays (better GC behavior)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.vx *= 0.99
        p.vy += 0.05
        p.life -= 0.015

        if (p.life > 0) {
          ctx.save()
          ctx.globalAlpha = p.life * 0.8
          ctx.fillStyle = p.color
          // Use integer coords to reduce subpixel rendering cost
          ctx.translate(Math.floor(p.x), Math.floor(p.y))
          ctx.rotate(p.rotation)

          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.8, 0, 0, Math.PI * 2)
          ctx.fill()

          // Avoid expensive shadows on mobile (commented out)
          // ctx.shadowBlur = 0

          ctx.restore()
        } else {
          // remove dead particle in-place
          this.particles.splice(i, 1)
        }
      }
      
      if (this.particles.length > 0) {
        this.particleAnimationFrame = requestAnimationFrame(() => this.animateParticles())
      } else {
        this.particleAnimationFrame = null
      }
    },
    beforeFlyEnter(el) {
      // Get input box position as starting point
      const inputBox = this.$refs.inputBox
      if (!inputBox) return
      
      const inputRect = inputBox.getBoundingClientRect()
      
      // Set initial position at input box
      el.style.position = 'fixed'
      el.style.left = inputRect.left + 'px'
      el.style.top = inputRect.top + 'px'
      el.style.width = inputRect.width - 80 + 'px' // minus send button width
      el.style.opacity = '0'
      el.style.transform = 'scale(0.8)'
    },
    flyEnter(el, done) {
      // Calculate target position (top right where user messages appear)
      const panelBody = this.$refs.panelBody
      if (!panelBody) {
        done()
        return
      }
      
      const panelRect = panelBody.getBoundingClientRect()
      
      // Target position: top-right of panel (where user messages go)
      const targetX = panelRect.right - 60 // right side with some padding
      const targetY = panelRect.top + 100 // near top with some padding
      
      // Force reflow
      el.offsetHeight
      
      // Apply transition
      el.style.transition = 'all 0.8s cubic-bezier(.2,.9,.2,1)'
      el.style.left = targetX + 'px'
      el.style.top = targetY + 'px'
      el.style.opacity = '1'
      el.style.transform = 'scale(0.6) rotate(5deg)'
      
      setTimeout(() => {
        el.style.opacity = '0'
        el.style.transform = 'scale(0.3) rotate(10deg)'
        setTimeout(done, 200)
      }, 600)
    },
    async onSend(options = {}) {
      // Clear autocomplete suggestion on send
      this.suggestionText = ''
      // --- แก้ไข Logic ปุ่มเมนู ---
      if (this.query && (this.query.trim() === 'เมนู' || this.query.trim() === 'menu')) {
        const originalUserMessage = this.query.trim();
        
        // 1. เพิ่มข้อความฝั่ง User ว่า "เมนู"
        this.messages.push({
          id: ++this.messageIdCounter,
          type: 'user',
          text: originalUserMessage,
          timestamp: new Date().toISOString()
        });
        // Mark that the user has interacted with the bot
        try { localStorage.setItem('chatbot_has_asked', '1'); } catch(e) {}
        this.hasAskedBot = true
        
        this.query = ''; // เคลียร์ช่องพิมพ์
        this.welcomeTyping = false;

        // 2. เตรียมข้อความตอบกลับ (ไม่ต้องแสดงข้อความยาวๆ)
        const replyText = '';

        // 3. แสดง Typing Indicator เล็กน้อยเพื่อความสมจริง
        this.messages.push({ id: ++this.messageIdCounter, type: 'bot', text: '', typing: true });
        this.$nextTick(() => this.scrollToBottom());

        setTimeout(() => {
          // ลบ Typing Indicator ตัวล่าสุดออก
          this.messages.pop();

          // 4. เพิ่มข้อความ Bot พร้อมเซ็ตค่า showCategories: true
          this.messages.push({
            id: ++this.messageIdCounter,
            type: 'bot',
            text: replyText,
            showCategories: true, // <--- คีย์สำคัญที่ทำให้เมนูแสดงในแชท
            openIndexes: [], // per-message accordion state
            timestamp: new Date().toISOString()
          });

          this.saveChatHistory();
          this.$nextTick(() => {
            this.scrollToBottom();
            this.updateAnchoring();
          });
        }, 600); // ดีเลย์ 0.6 วินาที

        return; // จบการทำงาน ไม่ต้องส่งไป Backend
      }
      // ----------------------------

      if (!this.query || !this.query.trim()) return
      
      const originalUserMessage = this.query.trim()
      let processedUserMessage = originalUserMessage;

      // Frontend stopword removal as a workaround for backend inconsistency.
      if (this.segmenter && this.stopwords && this.stopwords.length > 0) {
        try {
          const segments = Array.from(this.segmenter.segment(originalUserMessage));
          const filteredSegments = segments.filter(seg => {
            // Keep non-word segments (spaces, punctuation) and words that are NOT active stopwords.
            return !seg.isWordLike || !this.stopwords.includes(seg.segment.toLowerCase());
          });
          processedUserMessage = filteredSegments.map(s => s.segment).join('').replace(/\s+/g, ' ').trim();
        } catch (e) {
          console.error('Error during frontend word segmentation:', e);
          processedUserMessage = originalUserMessage; // Fallback to original on error
        }
      }
      
      // Trigger flying text animation (only if animations enabled)
      if (this.animationEnabled) {
        this.flyingText = originalUserMessage
        this.showFlyingText = true
        
        // Hide flying text after animation completes
        setTimeout(() => {
          this.showFlyingText = false
        }, 1000)
      }
      
      // ⌨️ ซ่อน typing tooltip เมื่อส่งข้อความ
      this.showUserTypingTooltip = false
      if (this.typingTooltipTimer) { clearTimeout(this.typingTooltipTimer); this.typingTooltipTimer = null }
      
      // เปลี่ยนข้อความ tooltip ครั้งต่อไป
      this.currentTypingMessageIndex = (this.currentTypingMessageIndex + 1) % this.dynamicUnlikeMessages.length
      this.userTypingTooltipText = this.dynamicUnlikeMessages[this.currentTypingMessageIndex]
      
      this.query = ''
      // Stop welcome typing once user interacts
      this.welcomeTyping = false
      
      // Add user message
      this.messages.push({
        id: ++this.messageIdCounter,
        type: 'user',
        text: originalUserMessage,
        timestamp: new Date().toISOString()
      })
      // Mark that the user has interacted with the bot
      try { localStorage.setItem('chatbot_has_asked', '1'); } catch(e) {}
      this.hasAskedBot = true

      // If the user typed the name of a category item, disable it so it can't be selected again
      try { this.disableCategoryItemByLabel(originalUserMessage) } catch (e) { /* ignore */ }
      
      // Save to localStorage
      this.saveChatHistory()
      
      // Scroll to bottom and update anchoring
      this.$nextTick(() => {
        this.scrollToBottom()
        this.updateAnchoring()
      })

      // Always delegate answering to backend; no local canned replies
      
        // If the user typed exactly one of the previously shown suggestion titles, prefer sending that suggestion's id
        let matchedSuggestion = null  
        for (const m of this.messages) {
          if (!m || !m.results || !Array.isArray(m.results)) continue
          for (const r of m.results) {
            const title = (typeof r === 'string') ? r : (r.title || r.name || r.question || '')
            if (title && title.trim() === originalUserMessage) {
              matchedSuggestion = r
              break
            }
          }
          if (matchedSuggestion) break
        }

        // Send to backend API if available, otherwise show polite backend-only error
        if (this.$axios && typeof this.$axios.post === 'function') {
          // Determine typingDelay and indicator duration for this session
          const envDelayForSend = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
          let typingDelayForSend = parseInt(envDelayForSend || '12', 10)
          if (Number.isNaN(typingDelayForSend) || typingDelayForSend < 0) typingDelayForSend = 0
          const indicatorMsForSend = parseInt(import.meta.env.VITE_BOT_TYPING_INDICATOR_MS || '0', 10) || 0

          // Add bot typing placeholder only if we have a non-zero typing delay OR a requested minimal indicator duration
          let botIndex = null
          if (typingDelayForSend > 0 || indicatorMsForSend > 0) {
            botIndex = this.messages.length
            this.messages.push({ id: ++this.messageIdCounter, type: 'bot', text: '', typing: true })
            this.saveChatHistory()
            this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
          } else {
            // Instant mode with no indicator: do not show a placeholder — we'll render response directly when available
            botIndex = null
          }

            try {
            const explicitPayload = options.payload || null
            // determine payload priority: explicit payload from caller > matched suggestion id > message text
            let payload
            if (explicitPayload) payload = explicitPayload
            else if (matchedSuggestion && matchedSuggestion.id) payload = { id: matchedSuggestion.id }
            else payload = { message: processedUserMessage }

            const res = await this.$axios.post('/chat/respond', payload)
            let botText = ''
            let pdf = null
            let contacts = null
            let results = null
            let multipleResults = false
            let resQuestionId = null
            let resFound = false
            // 🛡️ Quality Guard: New fields for handling low confidence and clarification
            let lowConfidence = false
            let needsClarification = false
            let confidenceLevel = null
            let verificationWarnings = []
            let suggestions = null
            
            if (res && res.data) {
              if (typeof res.data === 'string') botText = res.data
                else {
                // 🛡️ Extract quality guard fields
                if (res.data.lowConfidence) lowConfidence = true
                if (res.data.needsClarification) needsClarification = true
                if (res.data.confidenceLevel) confidenceLevel = res.data.confidenceLevel
                if (Array.isArray(res.data.verificationWarnings)) verificationWarnings = res.data.verificationWarnings
                if (Array.isArray(res.data.suggestions)) suggestions = res.data.suggestions
                
                // support new backend shape: { success, found, message, answer, categories, categoriesPDF, results/alternatives: [...] }
                // Priority: extract from results first, then other fields
                const potentialResults = Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data.alternatives) ? res.data.alternatives : null)
                
                // 🆕 Extract questionId from first result EARLY (before setting results variable)
                if (!resQuestionId && potentialResults && potentialResults.length > 0) {
                  resQuestionId = potentialResults[0].id || null
                  if (resQuestionId) {
                    console.log('✅ Early extracted resQuestionId from potentialResults[0].id:', resQuestionId)
                  }
                }
                
                // Handle results array
                if (potentialResults && potentialResults.length > 0) {
                  // If multiple results: show suggestion buttons only, don't extract full answer text
                  if (potentialResults.length > 1) {
                    results = potentialResults
                    multipleResults = true
                    // For multiple results, don't set botText - let the buttons be the response
                    botText = ''
                  } else {
                    // Also capture PDF from single result if provided
                    const firstRes = potentialResults[0]
                    if (firstRes && !pdf) {
                      pdf = firstRes.pdf
                        || firstRes.pdfUrl
                        || firstRes.attachment
                        || firstRes.attachmentUrl
                        || firstRes.categoriesPDF
                        || firstRes.categoriesPdf
                        || firstRes.fileUrl
                        || firstRes.file
                        || firstRes.url
                        || null
                    }
                    // For single result: extract and display the full answer
                    const resultTexts = potentialResults.map(r => {
                      if (typeof r === 'string') return r
                      return r.answer || r.message || r.text || r.description || r.detail || r.content || r.body || r.title || ''
                    }).filter(t => t && t.trim())
                    if (resultTexts.length > 0) {
                      botText = resultTexts.join('\n\n')
                    }
                  }
                }
                
                // If still no text from results, try other fields
                if (!botText) {
                  if (res.data.message) botText = res.data.message
                  else if (res.data.text) botText = res.data.text
                  else if (res.data.answer) botText = res.data.answer
                  else if (res.data.response) botText = res.data.response
                  else if (res.data.result) botText = res.data.result
                  else if (res.data.data && typeof res.data.data === 'string') botText = res.data.data
                  else if (Array.isArray(res.data.messages) && res.data.messages.length > 0) {
                    botText = res.data.messages.join('\n')
                  }
                  else botText = ''
                }
                
                // Debug log to see what we received
                console.log('Backend response:', res.data, 'Extracted botText:', botText)
                
                // accept different PDF fields (categoriesPDF is used by backend example)
                // Only set if pdf was not already extracted from alternatives/results
                if (!pdf) {
                  pdf = res.data.pdf
                    || res.data.pdfUrl
                    || res.data.attachment
                    || res.data.attachmentUrl
                    || res.data.categoriesPDF
                    || res.data.categoriesPdf
                    || res.data.fileUrl
                    || res.data.file
                    || res.data.url
                    || null

                  // Fallback: look into categories array for any PDF-like field
                  if (!pdf && Array.isArray(res.data.categories)) {
                    const catPdf = res.data.categories
                      .map(c => c && (
                        c.pdf || c.pdfUrl || c.attachment || c.attachmentUrl || c.categoriesPDF || c.categoriesPdf || c.fileUrl || c.file || c.url
                      ))
                      .find(Boolean)
                    if (catPdf) pdf = catPdf
                  }

                  // Fallback: attachments array
                  if (!pdf && Array.isArray(res.data.attachments)) {
                    const attPdf = res.data.attachments
                      .map(a => a && (a.pdf || a.url || a.link || a.href || a.file || a.path))
                      .find(Boolean)
                    if (attPdf) pdf = attPdf
                  }

                  console.log('📄 PDF extraction (root/categories/attachments):', { 
                    'res.data.pdf': res.data.pdf, 
                    'res.data.categoriesPDF': res.data.categoriesPDF,
                    'from categories': Array.isArray(res.data.categories),
                    'from attachments': Array.isArray(res.data.attachments),
                    'final pdf': pdf 
                  })
                } else {
                  console.log('📄 PDF already extracted from alternatives:', pdf)
                }
                // accept contacts array
                if (Array.isArray(res.data.contacts) && res.data.contacts.length) {
                  // normalize contact objects - support new shape { organization, category, contact } and legacy fields
                  contacts = res.data.contacts.map(c => ({
                    name: c.name || c.organization || c.org || c.department || '',
                    organization: c.organization || c.org || c.department || '',
                    category: c.category || c.CategoriesName || null,
                    contact: c.contact || c.Contact || null,
                    officer: c.officer || c.name || c.person || '',
                    phone: c.phone || c.tel || c.phoneNumber || '',
                    phones: Array.isArray(c.phones) ? c.phones : (c.phone ? [c.phone] : []),
                    unit: c.unit || c.ext || c.extension || c.phoneExtension || c.departmentUnit || '',
                    url: c.url || c.website || '',
                    facebook: c.facebook || c.fb || '',
                  }))
                }
                // detect found flag (when backend has an exact answer)
                if (typeof res.data.found !== 'undefined') resFound = !!res.data.found
                // capture question id if backend returned it
                if (res.data.questionId) {
                  // attach id into results or metadata as needed later
                  // we will store it on the bot message when saving below
                  // preserve in a local var
                  resQuestionId = res.data.questionId
                }
                // Already extracted from messages array above
              }
            } else {
              botText = 'ขออภัยค่ะ 😅 ในขณะนี้ระบบมีเรื่องไปหน่อย ลองอีกครั้งได้ไหมคะ?'
            }
            
            // Fallback: if still empty, use a generic response
            if (!botText || botText.trim() === '') {
              botText = 'เออ... ดูเหมือนว่าคำถามนี้ยังเหนือความสามารถของฉันเลย 🤔 ลองพูดคุยกับศูนย์บริการจึงสวัสดิการนักศึกษาได้ค่ะ!'
            }

            // Only use fallback universityContacts when no contacts were returned by the backend
            if ((botText.includes('ขออภัยจริงๆ ฉันไม่มีข้อมูลเกี่ยวกับคำถามนี้') || botText.includes('ยังเหนือความสามารถของฉันเลย')) && (!contacts || !contacts.length)) {
                // Map old universityContacts shape to new { organization, category, contact }
                contacts = (universityContacts || []).map(c => ({
                  organization: c.name || c.organization || c.OrgName || c.title || '',
                  category: null,
                  contact: c.phone ? `เบอร์โทรศัพท์ : ${c.phone}` : (Array.isArray(c.phones) && c.phones.length ? `เบอร์โทรศัพท์ : ${c.phones.join(', ')}` : null)
                }));
                console.log('ℹ️ fallback contacts assigned (no backend contacts):', contacts && contacts.length);
            }

            if (botText && botText.includes('พบ')) {
                botText = botText.replace(' (', '\n(');
            }

            // Add a minimum delay to show typing indicator (use indicatorMs if provided, otherwise fallback to 750 when we showed a placeholder)
            const indicatorMsFinal = indicatorMsForSend || ((typingDelayForSend > 0) ? 750 : 0)
            await new Promise(resolve => setTimeout(resolve, indicatorMsFinal))

            if (this.messages[botIndex] && this.messages[botIndex].type === 'bot') {
              console.log('🔧 Setting message properties:', { botText, pdf, results, multipleResults, resQuestionId, resFound });
              console.log('📄 Full res.data for PDF debug:', JSON.stringify(res.data, null, 2));
              
              const msg = this.messages[botIndex];
              msg.typing = false;
              // Set all non-text properties first
              if (pdf) msg.pdf = pdf;
              if (contacts) msg.contacts = contacts;

              // Compute visibleContacts based on new contact shape (organization, category, contact)
              let visibleContacts = (contacts || []).filter(c => c.contact && String(c.contact).trim());

              // Do not auto-inject global university contacts when there's no explicit contact returned.
              // Show only contacts explicitly returned by the backend (question-specific/staff-added contacts).
              // msg.visibleContacts = visibleContacts; // Delay showing contacts until text finishes

              // if (results) msg.results = results; // Delay showing results until text finishes
              // if (multipleResults) msg.multipleResults = true;
              if (resQuestionId) msg.questionId = resQuestionId;
              if (typeof resFound !== 'undefined') msg.found = resFound;
              
              // 🛡️ Quality Guard: Store confidence info
              if (lowConfidence) msg.lowConfidence = true;
              if (needsClarification) msg.needsClarification = true;
              if (confidenceLevel) msg.confidenceLevel = confidenceLevel;
              if (verificationWarnings.length) msg.verificationWarnings = verificationWarnings;
              if (suggestions) msg.suggestions = suggestions;
              
              if (!msg.feedback) msg.feedback = null;
              msg.timestamp = new Date().toISOString();
              
              // Send log FIRST before any feedback or auto-like
              if (resFound === false) {
                const noAnswerLogId = await this.sendNoAnswerLog(originalUserMessage);
                if (noAnswerLogId) {
                  msg.chatLogId = noAnswerLogId;
                }
              } else if (resFound === true && !multipleResults) {
                const chatLogId = await this.sendHasAnswerLog(originalUserMessage, resQuestionId);
                if (chatLogId) {
                  msg.chatLogId = chatLogId;
                }
                try {
                  if (msg.found === true && !msg.feedback) {
                    msg.feedback = 'like';
                    if (this.$axios && chatLogId) {
                      const payloadFb = { chatLogId: chatLogId, liked: true };
                      await this.$axios.post('/chat/feedback', payloadFb).catch(err => console.warn('Failed to send auto-like feedback', err));
                    }
                  }
                } catch (e) {
                  // ignore
                }
              }


              // Now, stream the text content
              if (botText) {
                await this.streamText(botIndex, botText);
              }

              // Show suggestions after typing finishes (sequentially)
              if (results && results.length > 0) {
                if (multipleResults) msg.multipleResults = true;
                msg.results = [];
                for (const result of results) {
                  msg.results.push(result);
                  // Delay for animation effect (only for first few)
                  if (msg.results.length <= 5) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                    this.scrollToBottom();
                  }
                }
                this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring(); });
              }

              // Show contacts after typing finishes
              if (visibleContacts && visibleContacts.length > 0) {
                // Normalize + dedupe visibleContacts (merge URL fragments, skip empty entries, drop category labels, and keep distinct extensions)
                const normalizeAndDedupe = (contacts) => {
                  const normalized = [];

                  // First pass: normalize and merge URL continuations
                  for (const c of contacts) {
                    const org = c.organization || 'อื่นๆ';
                    let rawContact = (c.contact || '').trim();
                    const labelMatch = String(rawContact || '').match(/^(เบอร์โทรศัพท์|ติดต่อ|ลิงค์)\s*:/i);
                    const isLinkLabel = labelMatch && /ลิงค์/i.test(labelMatch[1]);
                    const stripped = String(rawContact || '').replace(/^(?:เบอร์โทรศัพท์|ติดต่อ|ลิงค์)\s*:\s*/i, '').trim();

                    if (!stripped) continue;

                    const isUrl = /https?:\/\/|www\./i.test(stripped);
                    const currLooksLikeUrlContinuation = /^[\?&]/.test(stripped) || (/[=&]/.test(stripped) && stripped.length < 120);

                    if (currLooksLikeUrlContinuation) {
                      let attached = false;
                      for (let j = normalized.length - 1; j >= 0; j--) {
                        const prev = normalized[j];
                        if (!prev || !prev.contact) continue;
                        if (prev.organization !== org) break;
                        if (/https?:\/\/|www\./i.test(prev.contact)) {
                          prev.contact = String(prev.contact).trim() + stripped;
                          attached = true;
                          break;
                        }
                      }
                      if (attached) continue;
                    }

                    if (isLinkLabel && !isUrl) continue;

                    // Drop category labels here (we don't show categories in contact cards)
                    normalized.push({ organization: org, contact: rawContact || null });
                  }

                  // Deduplicate by phone+ext and by normalized URL; allow distinct extensions for same phone
                  const phoneOnlyMap = new Map(); // phone -> index (no ext)
                  const phoneExtMap = new Map(); // phone|ext -> index
                  const urlMap = new Map(); // url -> index
                  const result = [];

                  const extractPhone = (s) => {
                    const m = String(s || '').match(/0(?:2|[3-9]\d)[-\s]?\d{3}[-\s]?\d{3,4}|0\d{2}[-\s]?\d{3}[-\s]?\d{4}/);
                    return m ? m[0].replace(/\D/g, '') : null;
                  }
                  const extractExts = (s) => {
                    if (!s) return [];
                    const str = String(s);
                    const exts = new Set();
                    // capture explicitly marked extensions (e.g., 'ต่อ 1001', 'ext. 1001', 'x1001')
                    for (const m of str.matchAll(/(?:ต่อ|ext\.?|x)\s*[:\.]?\s*(\d{1,6})/ig)) {
                      if (m[1]) {
                        const cleaned = m[1].replace(/\D/g, '');
                        // Only accept extensions that look like typical internal extensions: 4-5 digits, not starting with 0
                        if (cleaned.length >= 4 && cleaned.length <= 5 && !cleaned.startsWith('0')) exts.add(cleaned);
                      }
                    }
                    // capture numeric tokens after the phone in same string (e.g., '\n5101' or ',5101')
                    const phoneMatch = str.match(/0(?:2|[3-9]\d)[-\s]?\d{3}[-\s]?\d{3,4}|0\d{2}[-\s]?\d{3}[-\s]?\d{4}/);
                    if (phoneMatch) {
                      const rest = str.slice(str.indexOf(phoneMatch[0]) + phoneMatch[0].length);
                      const nums = rest.match(/(\d{2,6})/g);
                      if (nums) nums.forEach(n => {
                        const cleaned = n.replace(/\D/g, '');
                        if (cleaned.length >= 4 && cleaned.length <= 5 && !cleaned.startsWith('0')) exts.add(cleaned);
                      });
                    }
                    return Array.from(exts);
                  }
                  const extractUrl = (s) => {
                    if (!s) return null;
                    let str = String(s);
                    // merge URL fragments split across newlines (e.g., '.../loca\nle=th_TH')
                    // Join broken URL fragments safely
                    str = this.joinBrokenUrls(str);
                    const m = str.match(/https?:\/\/[^\n\s]+/i);
                    if (!m) return null;
                    // preserve query string but remove internal newlines and trailing slash
                    return m[0].trim().replace(/\n/g, '').replace(/\/$/, '');
                  }

                  const extractUrls = (s) => {
                    if (!s) return [];
                    let str = String(s);
                    // merge URL fragments split across newlines (e.g., '.../loca\nle=th_TH')
                    // Join broken URL fragments safely
                    str = this.joinBrokenUrls(str);
                    // Use RegExp constructor to avoid multi-line regex literal issues
                    const re = new RegExp('(https?:\\/\\/[^^\\s]+)', 'ig');
                    const matches = [];
                    let m;
                    while ((m = re.exec(str)) !== null) {
                      let u = m[0].trim().replace(/\n/g, '').replace(/\/$/, '');
                      // If a phone-like token got appended directly to the URL (e.g., '...TH056-717-144'),
                      // strip that phone suffix so it won't be treated as part of the URL.
                      const phoneSuffixRe = /(0(?:2|[3-9]\d)[-\d]{6,10}|0\d{2}[-\d]{7,10})$/;
                      if (phoneSuffixRe.test(u)) {
                        u = u.replace(phoneSuffixRe, '').replace(/[-_.]+$/,'');
                      }
                      matches.push(u);
                    }
                    // preserve order and dedupe
                    return Array.from(new Set(matches));
                  }

                  const extractFirstUrl = (s) => {
                    const all = extractUrls(s);
                    return all.length ? all[0] : null;
                  }

                  const formatPhone = (digits) => {
                    if (!digits) return '';
                    if (digits.length === 9) return digits.slice(0,3) + '-' + digits.slice(3);
                    if (digits.length === 10) return digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
                    return digits;
                  }

                  const hasPhoneExtForPhone = (phone) => {
                    for (const k of phoneExtMap.keys()) {
                      if (k.startsWith(`${phone}|ext:`)) return true;
                    }
                    return false;
                  }

                  // New logic: aggregate extensions for same base phone into one entry
                  const phoneAggregateMap = new Map(); // phone -> { idx, exts: Set, urls: Set }

                  for (const item of normalized) {
                    const phone = extractPhone(item.contact);
                    const extsArr = extractExts(item.contact);
                    const urlsFound = extractUrls(item.contact);

                    if (phone) {
                      if (!phoneAggregateMap.has(phone)) {
                        const exts = new Set();
                        const urlsSet = new Set();
                        if (extsArr && extsArr.length) extsArr.forEach(e => exts.add(e));
                        if (urlsFound && urlsFound.length) urlsFound.forEach(u => urlsSet.add(u));
                        const contactText = `${formatPhone(phone)}${exts.size ? ' ต่อ ' + Array.from(exts).join(' หรือ ') : ''}${urlsSet.size ? '\nลิงค์ : ' + Array.from(urlsSet).join(' หรือ ') : ''}`;
                        const idx = result.length;
                        result.push({ organization: item.organization, contact: contactText });
                        phoneAggregateMap.set(phone, { idx, exts, urls: urlsSet });
                      } else {
                        // merge extension and urls into existing
                        const entry = phoneAggregateMap.get(phone);
                        if (extsArr && extsArr.length) extsArr.forEach(e => entry.exts.add(e));
                        if (urlsFound && urlsFound.length) urlsFound.forEach(u => entry.urls.add(u));
                        const contactText = `${formatPhone(phone)}${entry.exts.size ? ' ต่อ ' + Array.from(entry.exts).join(' หรือ ') : ''}${entry.urls.size ? '\nลิงค์ : ' + Array.from(entry.urls).join(' หรือ ') : ''}`;
                        result[entry.idx].contact = contactText;
                      }
                    } else if (urlsFound && urlsFound.length) {
                      // dedupe by urls when no phone, but avoid adding if url already associated with a phone
                      const alreadyInPhone = (u) => Array.from(phoneAggregateMap.values()).some(e => e.urls && e.urls.has(u));
                      const uniqueUrls = urlsFound.filter(u => !alreadyInPhone(u));
                      if (uniqueUrls.length) {
                        // only add URLs that haven't already been added to urlMap
                        const notAdded = uniqueUrls.filter(u => !urlMap.has(u));
                        if (notAdded.length) {
                          const idx = result.length;
                          result.push({ organization: item.organization, contact: 'ลิงค์ : ' + notAdded.join(' หรือ ') });
                          notAdded.forEach(u => urlMap.set(u, idx));
                        }
                      }
                    } else {
                      // fallback: keep name-only entries if not duplicates
                      const nameKey = `name:${(item.organization || '').trim()}`;
                      if (!phoneOnlyMap.has(nameKey)) {
                        const idx = result.length;
                        result.push({ organization: item.organization, contact: item.contact });
                        phoneOnlyMap.set(nameKey, idx);
                      }
                    }
                  }

                  // Group by organization
                  const groupsMap = new Map();
                  for (const r of result) {
                    const org = r.organization;
                    if (!groupsMap.has(org)) groupsMap.set(org, { organization: org, categories: [] });
                    groupsMap.get(org).categories.push({ category: null, contact: r.contact });
                  }

                  return Array.from(groupsMap.values());
                }

                const groupedContacts = normalizeAndDedupe(visibleContacts);
                msg.groupedContacts = groupedContacts;
                msg.visibleContacts = visibleContacts; // keep for backwards compatibility if needed
                this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring(); });
              }
              
              // Final save and UI update
              this.saveChatHistory();
              this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring(); });
            } else {
              // Instant mode: render the message immediately without a placeholder
              const idxNew = this.messages.length
              this.messages.push({ id: ++this.messageIdCounter, type: 'bot', text: botText || '', typing: false, timestamp: new Date().toISOString() })
              const msg = this.messages[idxNew]
              // Set non-text properties
              if (pdf) msg.pdf = pdf;
              if (contacts) msg.contacts = contacts;
              if (resQuestionId) msg.questionId = resQuestionId;
              if (typeof resFound !== 'undefined') msg.found = resFound;
              if (lowConfidence) msg.lowConfidence = true;
              if (needsClarification) msg.needsClarification = true;
              if (confidenceLevel) msg.confidenceLevel = confidenceLevel;
              if (verificationWarnings.length) msg.verificationWarnings = verificationWarnings;
              if (suggestions) msg.suggestions = suggestions;
              if (!msg.feedback) msg.feedback = null;

              // Attach results immediately
              if (results && results.length > 0) {
                if (multipleResults) msg.multipleResults = true;
                msg.results = results
              }

              // Show contacts immediately
              let visibleContacts = (contacts || []).filter(c => c.officer && c.phone);
              if (!visibleContacts || visibleContacts.length === 0) visibleContacts = (contacts || []).filter(c => (c.phone && c.phone.trim()) || (Array.isArray(c.phones) && c.phones.length > 0));
              // Do not auto-fill with global contacts — display only contacts returned by the backend for this query.
              if (visibleContacts && visibleContacts.length > 0) msg.visibleContacts = visibleContacts

              this.saveChatHistory()
              this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring(); })
            }
          } catch (err) {
            console.error('Chat API error', err)
            if (botIndex !== null && this.messages[botIndex]) {
              this.messages[botIndex].typing = false
              this.messages[botIndex].text = 'อุ๊ะ 😭 ฉันเหนื่อยไปหน่อย ลองอีกครั้งได้ไหมคะ?'
              this.messages[botIndex].timestamp = new Date().toISOString()
              this.saveChatHistory()
              this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
            } else {
              // If we were in instant mode (no placeholder), add an error message directly
              this.messages.push({ id: ++this.messageIdCounter, type: 'bot', text: 'อุ๊ะ 😭 ฉันเหนื่อยไปหน่อย ลองอีกครั้งได้ไหมคะ?', typing: false, timestamp: new Date().toISOString() })
              this.saveChatHistory()
              this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
            }
            this.sendNoAnswerLog(originalUserMessage)
          }
        } else {
          // No backend available: show a polite error from bot (respect typing delay)
          const envDelayFallback = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
          let typingDelayFallback = parseInt(envDelayFallback || '12', 10)
          if (Number.isNaN(typingDelayFallback) || typingDelayFallback < 0) typingDelayFallback = 0

          if (typingDelayFallback === 0) {
            // Instant mode: push the message immediately
            this.messages.push({ type: 'bot', text: 'ค่ะ 💔 ฉันไม่สามารถติดต่อเซิร์ฟเวอร์ได้ขณะนี้ ลองใหม่ทีหลัง!', typing: false, timestamp: new Date().toISOString() })
            this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
          } else {
            const botIndex = this.messages.length
            this.messages.push({ type: 'bot', text: '', typing: true })
            this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
            setTimeout(() => {
              if (this.messages[botIndex]) {
                this.messages[botIndex].typing = false
                this.messages[botIndex].text = 'ค่ะ 💔 ฉันไม่สามารถติดต่อเซิร์ฟเวอร์ได้ขณะนี้ ลองใหม่ทีหลัง!'
                this.messages[botIndex].timestamp = new Date().toISOString()
                this.saveChatHistory()
                this.$nextTick(() => { this.scrollToBottom(); this.updateAnchoring() })
              }
            }, 600)
          }
          this.sendNoAnswerLog(originalUserMessage)
        }
    },
    scrollToBottom() {
      if (this.$refs.panelBody) {
        this.$refs.panelBody.scrollTo({
          top: this.$refs.panelBody.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    selectSuggestion(msg, item, idx) {
      if (!item) return
      // If already disabled/selected, ignore
      if (item._disabled) return

      // mark as selected & disabled so user can't pick it again
      this.$set ? this.$set(item, '_disabled', true) : (item._disabled = true)
      this.$set ? this.$set(item, '_selected', true) : (item._selected = true)
      // persist changes
      this.saveChatHistory()

      const title = (typeof item === 'string') ? item : (item.title || item.name || item.question || '')
      if (!title) return
      this.query = title

      // Also disable the matching category item (if the user selected via suggestions)
      try { this.disableCategoryItemByLabel(title) } catch (e) { /* ignore */ }

      // prefer sending id when available
      if (typeof item === 'object' && item.id) {
        console.log('🎯 selectSuggestion: sending with id', item.id)
        this.onSend({ forceBackend: true, payload: { id: item.id } })
      } else {
        console.log('🎯 selectSuggestion: sending with query', this.query)
        this.onSend({ forceBackend: true })
      }
    },

    // Suggestions pagination methods
    getVisibleSuggestions(msg) {
      if (!msg || !msg.results) return []
      const msgIndex = this.messages.indexOf(msg)
      const visibleCount = this.suggestionVisibleCounts[msgIndex] || 3
      // Make sure we only show 3 items initially
      return msg.results.slice(0, visibleCount)
    },
    
    getVisibleCount(msg) {
      const msgIndex = this.messages.indexOf(msg)
      return this.suggestionVisibleCounts[msgIndex] || 3
    },
    
    loadMoreSuggestions(msg) {
      const msgIndex = this.messages.indexOf(msg)
      if (msgIndex === -1) return

      const currentCount = this.suggestionVisibleCounts[msgIndex] || 3
      const newCount = currentCount + 3

      // Update visible count using Vue.set for reactivity
      if (this.$set) {
        this.$set(this.suggestionVisibleCounts, msgIndex, newCount)
      } else {
        this.suggestionVisibleCounts[msgIndex] = newCount
      }

      // Save to localStorage
      this.saveChatHistory()

      // Show contact list when user clicks Read More
      try {
        const existing = this.messages[msgIndex] || {}
        const visible = (existing.visibleContacts && existing.visibleContacts.length) ? existing.visibleContacts : ((universityContacts || []).filter(c => (c.phone && c.phone.trim()) || (Array.isArray(c.phones) && c.phones.length > 0)))
        const updated = Object.assign({}, existing, { showContacts: true, visibleContacts: visible })
        // Use splice to replace the message object so Vue reactivity picks up property additions
        this.messages.splice(msgIndex, 1, updated)
        // persist changes
        this.saveChatHistory()
      } catch (e) {
        /* ignore */
      }
    },

    // Contacts pagination / Read More helpers
    getContactVisibleCount(msg) {
      const msgIndex = this.messages.indexOf(msg)
      return this.contactVisibleCounts[msgIndex] || 3
    },

    getVisibleContactGroups(msg) {
      const groups = (msg.groupedContacts && msg.groupedContacts.length) ? msg.groupedContacts : (universityContacts || [])
      const visibleCount = this.getContactVisibleCount(msg)
      // Filter out groups that have no meaningful contact info (no phone/ext/url)
      const filtered = groups.filter(group => {
        if (!group || !Array.isArray(group.categories)) return false
        for (const cat of group.categories) {
          if (!cat || !cat.contact) continue
          const parts = this.parseContactParts(cat.contact)
          for (const p of parts) {
            // link parts (start with url/www/facebook/ลิงค์) count as meaningful
            if (/^(https?:|www\.|facebook\.|ลิงค์)/i.test(p)) return true
            // other parts: check if has meaningful contact (not 'ไม่มี')
            if (this.hasContact(p)) return true
          }
        }
        return false
      })
      return filtered.slice(0, visibleCount)
    },

    toggleLoadMoreContacts(msg) {
      const msgIndex = this.messages.indexOf(msg)
      if (msgIndex === -1) return
      const groups = (msg.groupedContacts && msg.groupedContacts.length) ? msg.groupedContacts : (universityContacts || [])
      const total = groups.length
      const current = this.contactVisibleCounts[msgIndex] || 3
      const newCount = (current >= total) ? 3 : total
      if (this.$set) {
        this.$set(this.contactVisibleCounts, msgIndex, newCount)
      } else {
        this.contactVisibleCounts[msgIndex] = newCount
      }
      // persist preference
      this.saveChatHistory()
    },

    // Disable a category sub-item by its label so the user cannot pick it again.
    disableCategoryItemByLabel(label) {
      if (!label || !Array.isArray(this.categories)) return
      for (let ci = 0; ci < this.categories.length; ci++) {
        const cat = this.categories[ci]
        if (!cat || !Array.isArray(cat.items)) continue
        for (let ii = 0; ii < cat.items.length; ii++) {
          const it = cat.items[ii]
          const itemLabel = (typeof it === 'string') ? it : (it.label || it.text || it)
          if (itemLabel === label) {
            // set as object with disabled flag to preserve label
            const newObj = { label: itemLabel, _disabled: true }
            if (this.$set) this.$set(this.categories[ci].items, ii, newObj)
            else this.categories[ci].items[ii] = newObj
            // persist categories disabled state
            try { localStorage.setItem('chatbot_categories_disabled', JSON.stringify(this.categories)) } catch (e) { /* ignore */ }
            return true
          }
        }
      }
      return false
    },
    // Restore disabled state from localStorage after loading categories
    restoreCategoriesDisabledState() {
      try {
        const saved = localStorage.getItem('chatbot_categories_disabled')
        if (!saved || !Array.isArray(this.categories)) return
        
        const savedCategories = JSON.parse(saved)
        if (!Array.isArray(savedCategories)) return

        // Build a map of disabled items by label
        const disabledLabels = new Set()
        savedCategories.forEach(cat => {
          if (!cat || !Array.isArray(cat.items)) return
          cat.items.forEach(item => {
            if (item && typeof item === 'object' && item._disabled === true) {
              const label = item.label || item.text || item
              if (label) disabledLabels.add(label)
            }
          })
        })

        // Apply disabled state to current categories
        this.categories.forEach((cat, ci) => {
          if (!cat || !Array.isArray(cat.items)) return
          cat.items.forEach((item, ii) => {
            const itemLabel = (typeof item === 'string') ? item : (item.label || item.text || item)
            if (disabledLabels.has(itemLabel)) {
              const newObj = { label: itemLabel, _disabled: true }
              if (this.$set) this.$set(this.categories[ci].items, ii, newObj)
              else this.categories[ci].items[ii] = newObj
            }
          })
        })
      } catch (e) {
        console.warn('Failed to restore categories disabled state:', e)
      }
    },
    updateAnchoring() {
      // If content fits inside panel, anchor to bottom so welcome/categories sit above input
      this.$nextTick(() => {
        const el = this.$refs.panelBody
        if (!el) return
          const buffer = 16 // smaller buffer so anchoring only when there's genuinely no overflow
        this.anchorBottom = el.scrollHeight <= (el.clientHeight + buffer)
      })
    },
    saveChatHistory() {
      try {
        localStorage.setItem('chatbot_messages', JSON.stringify(this.messages))
      } catch (error) {
        console.error('Failed to save chat history:', error)
      }
    },
    loadChatHistory() {
      try {
        const savedMessages = localStorage.getItem('chatbot_messages')
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages)
          // Scroll to bottom after loading
          this.$nextTick(() => {
            this.scrollToBottom()
            this.updateAnchoring()
          })
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        this.messages = []
      }
    },
    clearChatHistory() {
      // Send request to backend to reset session blocked domains
      if (this.$axios) {
        this.$axios.post('/chat/respond', { resetConversation: true }).catch(err => {
          console.warn('Failed to reset conversation on backend:', err)
        })
      }
      
      // Clear messages and persisted history
      this.messages = []
      localStorage.removeItem('chatbot_messages')
      // Reset mini help dismissed state when chat is cleared
      try {
        localStorage.removeItem('chatbot_mini_help_dismissed')
      } catch (e) {}
      this.miniHelpDismissed = false

      // Reset 'has asked' flag so fresh users don't see the trash button
      try { localStorage.removeItem('chatbot_has_asked') } catch (e) {}
      this.hasAskedBot = false

      // Also clear persisted category disabled state so items become selectable again
      try {
        localStorage.removeItem('chatbot_categories')
        localStorage.removeItem('chatbot_categories_disabled')
      } catch (e) {
        // ignore
      }
      // Normalize categories items back to plain strings so buttons re-enable
      try {
        if (Array.isArray(this.categories)) {
          this.categories = this.categories.map(c => {
            const items = Array.isArray(c.items) ? c.items.map(it => {
              if (!it) return it
              if (typeof it === 'string') return it
              // object case: extract label/text or fallback to empty string
              return it.label || it.text || ''
            }) : []
            return { title: c.title, items }
          })
        }
      } catch (e) {
        // ignore errors during reset
      }

      // Close all open categories and persist that state
      this.openIndexes = []
      this.saveCategoryState()

      // Show bot "typing" as a temporary message at the bottom (so it appears near input)
      // Use tracked timer so it can be cancelled if the chat is closed quickly
      if (this.welcomeTypingTimer) {
        clearTimeout(this.welcomeTypingTimer)
        this.welcomeTypingTimer = null
      }

      // Respect typing delay and indicator settings: if both zero, don't show the temporary typing bubble
      const welcomeEnvDelay = import.meta.env.VITE_BOT_TYPING_DELAY_MS ?? import.meta.env.VITE_BOT_TYPING_SPEED
      const welcomeTypingDelay = parseInt(welcomeEnvDelay || '12', 10)
      const welcomeIndicatorMs = parseInt(import.meta.env.VITE_BOT_TYPING_INDICATOR_MS || '0', 10) || 0

      // Show temp typing if we have per-char delay OR a configured minimal indicator duration
      this.tempTyping = (welcomeTypingDelay > 0) || (welcomeIndicatorMs > 0)

      // mark as shown so reopening won't retrigger the welcome typing
      this.welcomeTypingShown = true

      // Ensure panel scrolls to bottom so user sees the typing near the input
      this.$nextTick(() => {
        if (this.tempTyping) {
          // If we're showing the typing indicator at the bottom, keep behavior to scroll to bottom
          this.scrollToBottom()
          setTimeout(() => this.scrollToBottom(), 50)
          setTimeout(() => this.scrollToBottom(), 250)
        } else {
          // No messages/typing: ensure the panel is scrolled to the top so welcome/categories are visible
          if (this.$refs.panelBody) this.$refs.panelBody.scrollTop = 0
          setTimeout(() => { if (this.$refs.panelBody) this.$refs.panelBody.scrollTop = 0 }, 50)
          setTimeout(() => { if (this.$refs.panelBody) this.$refs.panelBody.scrollTop = 0 }, 250)
        }
        this.updateAnchoring()
      })

      // After a short delay, hide the temporary typing indicator (only if it was shown)
      if (this.tempTyping) {
        const welcomeHideMs = welcomeIndicatorMs || 1200
        this.welcomeTypingTimer = setTimeout(() => {
          this.tempTyping = false
          this.welcomeTypingTimer = null
          this.$nextTick(() => this.updateAnchoring())
        }, welcomeHideMs)
      } else {
        this.welcomeTypingTimer = null
      }
    },
    saveCategoryState() {
      try {
        // Persist only the first open index to enforce single-open behavior
        const toSave = Array.isArray(this.openIndexes) && this.openIndexes.length > 0 ? [this.openIndexes[0]] : []
        localStorage.setItem('chatbot_category_state', JSON.stringify(toSave))
      } catch (error) {
        console.error('Failed to save category state:', error)
      }
    },
    
    loadCategoryState() {
      try {
        const savedState = localStorage.getItem('chatbot_category_state')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          if (Array.isArray(parsed) && parsed.length > 0) this.openIndexes = [parsed[0]]
          else this.openIndexes = []
        }
      } catch (error) {
        console.error('Failed to load category state:', error)
        this.openIndexes = []
      }
    },
    
    // 📋 Toggle feedback reason dropdown
    toggleFeedbackDropdown(idx) {
      if (this.openFeedbackDropdownIndex === idx) {
        this.openFeedbackDropdownIndex = null
      } else {
        this.openFeedbackDropdownIndex = idx
        // After DOM updates, anchor the dropdown to the button position to avoid any horizontal nudges
        this.$nextTick(() => {
          this.updateDropdownPosition(idx)

          // Start diagnostics (short-lived) to capture any horizontal movement
          this.startDropdownDiagnostics && this.startDropdownDiagnostics(idx)

          // Add reanchor handlers so the dropdown follows its button on resize/scroll
          this._dropdownReanchorHandler = () => this.updateDropdownPosition(idx)
          this._dropdownScrollHandler = () => this.updateDropdownPosition(idx)
          window.addEventListener('resize', this._dropdownReanchorHandler)
          // Use capture so scrolls inside scrollable containers are caught
          window.addEventListener('scroll', this._dropdownScrollHandler, true)
        })
      }
    },

    // 🧭 Anchor the inline dropdown horizontally to the unlike button and add a short visual debug outline
    updateDropdownPosition(idx) {
      try {
        const wrappers = this.$el.querySelectorAll('.feedback-unlike-wrapper')
        const wrapper = wrappers && wrappers[idx]
        if (!wrapper) return
        const btn = wrapper.querySelector('.feedback-btn')
        const dropdown = wrapper.querySelector('.feedback-reason-dropdown-inline')
        if (!dropdown || !btn) return

        // Compute bounding rects relative to viewport so we can use fixed positioning
        const btnRect = btn.getBoundingClientRect()
        // Measure dropdown first (it might be collapsed), ensure it has a size by temporarily making it visible offscreen
        let dropdownRect = dropdown.getBoundingClientRect()
        if (!dropdownRect.width || !dropdownRect.height) {
          // Temporarily show offscreen to measure
          dropdown.style.visibility = 'hidden'
          dropdown.style.display = 'block'
          dropdown.style.position = 'fixed'
          dropdown.style.left = '-9999px'
          dropdown.style.top = '-9999px'
          dropdownRect = dropdown.getBoundingClientRect()
          dropdown.style.display = ''
          dropdown.style.visibility = ''
        }

        // Center dropdown horizontally relative to the button within the viewport
        const leftViewport = Math.round(btnRect.left + (btnRect.width - dropdownRect.width) / 2)
        // Prefer placing above the button; if not enough space, place below
        const spaceAbove = btnRect.top
        const spaceBelow = window.innerHeight - btnRect.bottom
        const gap = 8
        let topViewport = btnRect.top - dropdownRect.height - gap
        if (topViewport < 8 && spaceBelow > dropdownRect.height + gap) {
          topViewport = Math.round(btnRect.bottom + gap)
        }

        // Apply fixed positioning to avoid layout reflows changing the computed X
        dropdown.style.position = 'fixed'
        dropdown.style.left = `${leftViewport}px`
        dropdown.style.top = `${topViewport}px`
        dropdown.style.right = 'auto'
        dropdown.style.transform = 'translateX(0)'
        dropdown.style.willChange = 'transform, opacity, left, top'
        dropdown.style.backfaceVisibility = 'hidden'
        dropdown.style.transition = 'none'

        // Force no CSS stylesheet animation (in case global rules apply), then programmatically start the inline keyframe
        dropdown.style.animation = 'none'
        /* eslint-disable no-unused-expressions */
        dropdown.offsetWidth
        /* eslint-enable no-unused-expressions */
        dropdown.style.animation = 'appleDropdownInInline 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        dropdown.style.animationFillMode = 'forwards'

        // Once animation ends, clear the inline animation to allow future toggles to reapply
        const onAnimEnd = () => {
          dropdown.style.animation = ''
          dropdown.removeEventListener('animationend', onAnimEnd)
        }
        dropdown.addEventListener('animationend', onAnimEnd)

        // Temporary visual aid to confirm bounding boxes while testing (removed after 700ms)
        dropdown.style.outline = '2px dashed rgba(255,80,80,0.9)'
        console.log('🔧 anchored feedback dropdown (fixed)', { idx, leftViewport, topViewport, btnRect, dropdownRect })
        setTimeout(() => { dropdown.style.outline = '' }, 700)
      } catch (err) {
        console.error('Failed to anchor dropdown:', err)
      }
    },
    
    // 💬 แสดงข้อความ tooltip น่ารักเมื่อกดปุ่ม unlike
    showUnlikeTooltipMessage() {
      // 🎭 ถ้ากดถี่เกิน 3 ครั้ง แสดงข้อความเตือนแทน
      if (this.feedbackToggleCount >= 3) {
        this.showFeedbackWarning()
        return
      }
      // ซ่อน tooltip อื่นทันที
      this.hideAllTooltips()
      
      // สุ่มข้อความน่ารัก
      const randomIndex = Math.floor(Math.random() * this.dynamicApologyMessages.length)
      this.unlikeTooltipText = this.dynamicApologyMessages[randomIndex]
      
      // ⏱️ ดีเลย์ 400ms ก่อนแสดง tooltip
      setTimeout(() => {
        this.openTooltip('unlike')
        
        // ซ่อน tooltip หลัง 5 วินาที
        this.unlikeTooltipTimer = setTimeout(() => {
          this.showUnlikeTooltip = false
          this.unlikeTooltipTimer = null
        }, 5000)
      }, 400)
    },

    // 🧪 Diagnostics: sample dropdown position per frame for a short duration to detect horizontal shifts
    startDropdownDiagnostics(idx) {
      try {
        // Avoid multiple diagnostics sessions
        if (this._dropdownDiagnostics && this._dropdownDiagnostics.running) return
        const wrappers = this.$el.querySelectorAll('.feedback-unlike-wrapper')
        const wrapper = wrappers && wrappers[idx]
        if (!wrapper) return
        const btn = wrapper.querySelector('.feedback-btn')
        const dropdown = wrapper.querySelector('.feedback-reason-dropdown-inline')
        if (!dropdown || !btn) return

        this._dropdownDiagnostics = { running: true, frames: [], start: performance.now(), raf: null }

        // Add persistent outlines so you can visually inspect while testing
        btn.style.outline = '2px solid rgba(0,120,255,0.9)'
        dropdown.style.outline = '2px dashed rgba(255,80,80,0.95)'

        let lastLeft = null
        const tick = (ts) => {
          if (!this._dropdownDiagnostics || !this._dropdownDiagnostics.running) return
          const rect = dropdown.getBoundingClientRect()
          const style = window.getComputedStyle(dropdown)
          const transform = style.transform || ''
          const left = Math.round(rect.left * 100) / 100
          const delta = lastLeft === null ? 0 : Math.round((left - lastLeft) * 100) / 100
          this._dropdownDiagnostics.frames.push({ t: Math.round(ts), left, delta, transform })

          if (Math.abs(delta) > 0.6) {
            console.warn('⚠️ feedback dropdown moved horizontally', { idx, left, delta, rect, transform })
          }

          lastLeft = left

          if (performance.now() - this._dropdownDiagnostics.start < 900) {
            this._dropdownDiagnostics.raf = requestAnimationFrame(tick)
          } else {
            // end diagnostics and dump frames
            this._dropdownDiagnostics.running = false
            console.log('🔍 feedback dropdown diagnostics', this._dropdownDiagnostics.frames)
            // leave outlines for a brief moment to inspect
            setTimeout(() => {
              try { btn.style.outline = ''; dropdown.style.outline = '' } catch(e){}
            }, 900)
          }
        }
        this._dropdownDiagnostics.raf = requestAnimationFrame(tick)
      } catch (err) {
        console.error('Failed to start dropdown diagnostics:', err)
      }
    },

    stopDropdownDiagnostics() {
      try {
        if (!this._dropdownDiagnostics) return
        if (this._dropdownDiagnostics.raf) cancelAnimationFrame(this._dropdownDiagnostics.raf)
        this._dropdownDiagnostics.running = false
        console.log('🔍 stopped dropdown diagnostics', this._dropdownDiagnostics.frames || [])
        // remove outlines
        const els = this.$el.querySelectorAll('.feedback-unlike-wrapper')
        const wrapper = els && els[0]
        if (wrapper) {
          const btn = wrapper.querySelector('.feedback-btn')
          const dropdown = wrapper.querySelector('.feedback-reason-dropdown-inline')
          try { if (btn) btn.style.outline = '' } catch (e) {}
          try { if (dropdown) dropdown.style.outline = '' } catch (e) {}
        }
        this._dropdownDiagnostics = null
      } catch (err) {
        console.error('Failed to stop dropdown diagnostics:', err)
      }
    },
    
    // 📋 Get the latest bot message
    getLatestBotMessage() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].type === 'bot') {
          return this.messages[i]
        }
      }
      return null
    },
    
    // 📋 Handle like button click
    handleLikeClick(msg) {
      console.log('👍 Like button clicked:', msg)
      
      // 💖 ถ้า user เปลี่ยนใจจาก unlike เป็น like ให้แสดงข้อความขอบคุณ
      const wasDisliked = msg.feedback === 'dislike'
      
      // Close any open dropdowns first
      this.closeFeedbackDropdown()

      // Clear any previously selected dislike reason when switching to like
      try {
        if (msg && msg.selectedReason) {
          this.$set ? this.$set(msg, 'selectedReason', null) : (msg.selectedReason = null)
        }
        if (msg && msg.feedbackCommentText) {
          this.$set ? this.$set(msg, 'feedbackCommentText', '') : (msg.feedbackCommentText = '')
        }
      } catch (err) {
        console.warn('Failed to clear previous feedback reason on like:', err)
      }

      // Persist history after clearing
      this.saveChatHistory()

      this.sendFeedback(msg, true, null, null)
      
      // 🎭 นับจำนวนการกด feedback ทุกครั้ง (ไม่ว่าจะเปลี่ยนใจหรือไม่)
      this.trackFeedbackToggle()
      
      // แสดง tooltip ขอบคุณถ้าเปลี่ยนใจจาก unlike
      if (wasDisliked) {
        this.showLikeTooltipMessage()
      }
    },
    
    // 🎭 ตรวจจับการสลับ like/unlike บ่อยๆ
    trackFeedbackToggle() {
      this.feedbackToggleCount++
      
      // 🚫 ถ้ากดเกิน 5 ครั้ง ให้ disable ปุ่ม 5 วินาที
      if (this.feedbackToggleCount >= 5) {
        this.disableFeedbackButtons()
        return
      }
      
      // รีเซ็ตตัวนับหลัง 5 วินาที
      if (this.feedbackToggleResetTimer) {
        clearTimeout(this.feedbackToggleResetTimer)
      }
      this.feedbackToggleResetTimer = setTimeout(() => {
        this.feedbackToggleCount = 0
        this.feedbackToggleResetTimer = null
      }, 5000)
    },
    
    // 🚫 Disable ปุ่ม feedback พร้อม countdown
    disableFeedbackButtons() {
      // ซ่อน tooltip ทั้งหมด
      if (this.unlikeTooltipTimer) {
        clearTimeout(this.unlikeTooltipTimer)
        this.showUnlikeTooltip = false
      }
      if (this.likeTooltipTimer) {
        clearTimeout(this.likeTooltipTimer)
        this.showLikeTooltip = false
      }
      
      // เซ็ตข้อคววามเตือนและแสดง tooltip
      this.unlikeTooltipText = 'หยุดก่อนนะคะ! รอ 5 วินาที 🚫💤'
      this.showUnlikeTooltip = true
      
      // Disable ปุ่ม
      this.feedbackButtonsDisabled = true
      this.feedbackCooldownTime = 5
      
      // เริ่ม countdown
      this.feedbackCooldownInterval = setInterval(() => {
        this.feedbackCooldownTime--
        this.unlikeTooltipText = `รออีก ${this.feedbackCooldownTime} วินาทีนะคะ 😴🕒`
        
        if (this.feedbackCooldownTime <= 0) {
          clearInterval(this.feedbackCooldownInterval)
          this.feedbackCooldownInterval = null
          this.feedbackButtonsDisabled = false
          this.showUnlikeTooltip = false
          this.feedbackToggleCount = 0
        }
      }, 1000)
      
      // เคลียร์ timer หลัง 5 วินาที
      this.feedbackCooldownTimer = setTimeout(() => {
        if (this.feedbackCooldownInterval) {
          clearInterval(this.feedbackCooldownInterval)
          this.feedbackCooldownInterval = null
        }
        this.feedbackButtonsDisabled = false
        this.showUnlikeTooltip = false
        this.feedbackToggleCount = 0
        this.feedbackCooldownTimer = null
      }, 5000)
    },
    
    // 🎭 แสดงข้อความเตือนเมื่อสลับบ่อยๆ
    showFeedbackWarning() {
      // ซ่อน tooltip อื่นๆ ทั้งหมด
      this.hideAllTooltips()
      
      // สุ่มข้อความเตือน
      const randomIndex = Math.floor(Math.random() * this.dynamicWarningMessages.length)
      this.unlikeTooltipText = this.dynamicWarningMessages[randomIndex]
      
      // ⏱️ ดีเลย์ 400ms ก่อนแสดง
      setTimeout(() => {
        this.openTooltip('unlike')
        
        // ซ่อน tooltip หลัง 5 วินาที (นานกว่าปกติ)
        this.unlikeTooltipTimer = setTimeout(() => {
          this.showUnlikeTooltip = false
          this.unlikeTooltipTimer = null
        }, 5000)
      }, 400)
    },
    
    // 💖 แสดงข้อความขอบคุณเมื่อเปลี่ยนใจเป็น like
    showLikeTooltipMessage() {
      // 🎭 ถ้าสลับบ่อยเกิน 3 ครั้ง แสดงข้อควาวเตือนแทน
      if (this.feedbackToggleCount >= 3) {
        this.showFeedbackWarning()
        return
      }
      // ซ่อน tooltip อื่นทันที
      this.hideAllTooltips()
      
      // สุ่มข้อความขอบคุณ
      const randomIndex = Math.floor(Math.random() * this.dynamicLikeMessages.length)
      this.likeTooltipText = this.dynamicLikeMessages[randomIndex]
      
      // ⏱️ ดีเลย์ 600ms ก่อนแสดง tooltip
      setTimeout(() => {
        this.openTooltip('like')
        
        // ซ่อน tooltip หลัง 4 วินาที
        this.likeTooltipTimer = setTimeout(() => {
          this.showLikeTooltip = false
          this.likeTooltipTimer = null
        }, 4000)
      }, 600)
    },
    
    // 📋 Close feedback dropdown
    closeFeedbackDropdown() {
      this.openFeedbackDropdownIndex = null
      this.showFeedbackCommentBox = false
      this.feedbackCommentText = ''
      this.pendingFeedbackMsg = null

      // Clean up any reanchor listeners added when opening the dropdown
      try {
        if (this._dropdownReanchorHandler) {
          window.removeEventListener('resize', this._dropdownReanchorHandler)
          this._dropdownReanchorHandler = null
        }
        if (this._dropdownScrollHandler) {
          window.removeEventListener('scroll', this._dropdownScrollHandler, true)
          this._dropdownScrollHandler = null
        }
      } catch (err) {
        console.error('Failed to remove dropdown listeners:', err)
      }
    },
    
    // 📋 Handle click outside dropdown to close it
    handleOutsideClick(event) {
      if (this.openFeedbackDropdownIndex === null) return
      
      // Check if click is outside dropdown
      const dropdown = event.target.closest('.feedback-reason-dropdown')
      const feedbackBtn = event.target.closest('.feedback-btn')
      
      if (!dropdown && !feedbackBtn) {
        this.closeFeedbackDropdown()
      }
    },
    
    // 📋 Handle reason selection (show comment box for 'other')
    handleReasonSelect(msg, reason) {
      console.log('🔔 handleReasonSelect called:', { msg, reason })
      
      // Prevent double-firing from both touch and click events
      if (this._reasonSelectLock) return
      this._reasonSelectLock = true
      setTimeout(() => { this._reasonSelectLock = false }, 300)
      
      // Update message feedback state first
      this.$set ? this.$set(msg, 'feedback', 'dislike') : (msg.feedback = 'dislike')
      this.$set ? this.$set(msg, '_anim', 'dislike') : (msg._anim = 'dislike')
      
      // Save selected reason
      this.$set ? this.$set(msg, 'selectedReason', reason) : (msg.selectedReason = reason)
      
      // Save to persist the active state
      this.saveChatHistory()
      
      // Clear animation after duration
      setTimeout(() => {
        if (msg) {
          this.$set ? this.$set(msg, '_anim', null) : (msg._anim = null)
        }
      }, 600)
      
      if (reason === 'other') {
        // Show comment box for 'other' option
        this.showFeedbackCommentBox = true
        this.pendingFeedbackMsg = msg
        // Restore previous comment text if exists, otherwise empty
        this.feedbackCommentText = msg.feedbackCommentText || ''
        
        // ✅ Focus textarea and open keyboard immediately
        this.$nextTick(() => {
          const textarea = document.querySelector('.feedback-comment-input')
          if (textarea) {
            textarea.focus()
          }
        })
      } else {
        // Send feedback immediately for predefined reasons
        this.closeFeedbackDropdown()
        this.sendFeedback(msg, false, reason, null)
        
        // 🎭 นับจำนวนการกด feedback
        this.trackFeedbackToggle()
        
        // 💬 แสดง tooltip น่ารักหลังจาก user เลือกเหตุผล
        this.showUnlikeTooltipMessage()
      }
    },
    
    // 📋 Cancel feedback comment
    cancelFeedbackComment() {
      // Save the comment text before closing
      if (this.pendingFeedbackMsg) {
        this.$set ? this.$set(this.pendingFeedbackMsg, 'feedbackCommentText', this.feedbackCommentText) : (this.pendingFeedbackMsg.feedbackCommentText = this.feedbackCommentText)
      }
      this.showFeedbackCommentBox = false
      this.pendingFeedbackMsg = null
      this.closeFeedbackDropdown()
    },
    
    // 📋 Submit feedback with comment
    submitFeedbackComment() {
      if (!this.feedbackCommentText.trim() || !this.pendingFeedbackMsg) return
      
      const msg = this.pendingFeedbackMsg
      
      // Update message feedback state
      this.$set ? this.$set(msg, 'feedback', 'dislike') : (msg.feedback = 'dislike')
      this.$set ? this.$set(msg, '_anim', 'dislike') : (msg._anim = 'dislike')
      
      // Clear animation after duration
      setTimeout(() => {
        if (msg) {
          this.$set ? this.$set(msg, '_anim', null) : (msg._anim = null)
        }
      }, 600)
      
      this.sendFeedback(msg, false, 'other', this.feedbackCommentText.trim())
      this.showFeedbackCommentBox = false
      this.feedbackCommentText = ''
      this.pendingFeedbackMsg = null
      this.closeFeedbackDropdown()
    },
    
    sendFeedback(msg, isLike, feedbackReason = null, feedbackComment = null) {
      console.log('🔔 sendFeedback called:', { msg, isLike, feedbackReason, feedbackComment })
      
      if (!msg || msg.type !== 'bot') {
        console.log('❌ sendFeedback early return: invalid msg')
        return
      }

      // Update message feedback state
      this.$set ? this.$set(msg, 'feedback', isLike ? 'like' : 'dislike') : (msg.feedback = isLike ? 'like' : 'dislike')
      this.$set ? this.$set(msg, '_anim', isLike ? 'like' : 'dislike') : (msg._anim = isLike ? 'like' : 'dislike')

      // Save updated chat history with feedback
      this.saveChatHistory()

      // Clear animation flag after animation completes
      setTimeout(() => {
        if (msg) {
          this.$set ? this.$set(msg, '_anim', null) : (msg._anim = null)
        }
      }, 600)

      // Build payload
      const payload = {
        liked: isLike,
        message: msg.text || '',
        timestamp: msg.timestamp || new Date().toISOString(),
        chatLogId: msg.chatLogId || null,
        questionId: msg.questionId || null,
        botResponse: msg.text || '',
        query: this.getOriginalQueryForMessage ? this.getOriginalQueryForMessage(msg) : '',
        selectedQAId: msg.questionId || null,
        feedbackReason: feedbackReason || null,
        feedbackComment: feedbackComment || ''
      }
      
      console.log('📤 Sending feedback payload:', payload)

      // Prefer axios so Authorization header and baseURL are applied
      if (this.$axios && typeof this.$axios.post === 'function') {
        this.$axios.post('/chat/feedback', payload)
          .then(res => {
            console.log('📥 Feedback response (axios):', res.data)
          })
          .catch(err => {
            console.error('❌ Feedback axios error:', err)
          })
      } else {
        // Fallback to fetch (ensure leading slash)
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://project.3bbddns.com:36145';
        fetch(`${baseURL}/chat/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': (localStorage.getItem('userToken') ? `Bearer ${localStorage.getItem('userToken')}` : '')
          },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => console.log('✅ Feedback sent successfully (fetch fallback):', data))
        .catch(err => console.error('❌ Fetch error (fallback):', err))
      }
    },
    checkWinterSeason() {
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1 // getMonth() returns 0-11, so add 1
      // Winter season in Thailand: November (11), December (12), January (1), February (2)
      this.isWinterSeason = month === 11 || month === 12 || month === 1 || month === 2
    },
    handleScroll() {
      if (this.$refs.panelBody) {
        const currentScrollTop = this.$refs.panelBody.scrollTop
        
        // Show button only when user intentionally scrolls UP (not down)
        // and is not at the very top
        if (currentScrollTop < this.lastScrollTop && currentScrollTop > 100) {
          this.showScrollTop = true
        } else if (currentScrollTop <= 50) {
          // Hide when near top
          this.showScrollTop = false
        } else if (currentScrollTop > this.lastScrollTop) {
          // Hide when scrolling down
          this.showScrollTop = false
        }
        
        this.lastScrollTop = currentScrollTop
      }
    },
    // Animate open using Web Animations API for a spring-like Apple sheet motion
    animateOpen(el, done) {
      try {
        // Ensure panel body is at top BEFORE animation starts so user doesn't see it scrolling
        const panelBody = el.querySelector('.panel-body')
        if (panelBody) {
          // Apply instant scroll behavior and set to top immediately
          panelBody.style.scrollBehavior = 'auto'
          panelBody.scrollTop = 0
        }

        const panel = el.querySelector('.chat-panel')
        const overlay = el.querySelector('.overlay-backdrop')
        if (overlay) {
          overlay.style.opacity = '0'
          overlay.style.backdropFilter = 'blur(0px)'
        }
        if (panel) {
          panel.style.opacity = '0'
          panel.style.transform = 'translate3d(28px,0,0) scale(.986)'
          panel.style.willChange = 'transform, opacity'
        }

        const overlayAnim = overlay ? overlay.animate([
          { opacity: 0, backdropFilter: 'blur(0px)' },
          { opacity: 1, backdropFilter: 'blur(2px)' }
        ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }) : null

        const panelAnim = panel.animate([
          { transform: 'translate3d(28px,0,0) scale(.986)', opacity: 0, offset: 0 },
          { transform: 'translate3d(-8px,0,0) scale(1.03)', opacity: 1, offset: 0.55 },
          { transform: 'translate3d(4px,0,0) scale(.995)', offset: 0.75 },
          { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 1 }
        ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })

        Promise.all([overlayAnim ? overlayAnim.finished : Promise.resolve(), panelAnim.finished]).then(() => {
          if (panel) panel.style.willChange = ''
          // restore any forced scroll-behavior we set earlier
          try {
            if (panelBody) panelBody.style.scrollBehavior = ''
          } catch(e) {}
          done()
        }).catch(() => done())
      } catch (e) {
        done()
      }
    },


    // Reverse animation for close
    animateClose(el, done) {
      try {
        const panel = el.querySelector('.chat-panel')
        const overlay = el.querySelector('.overlay-backdrop')
        if (overlay) {
          overlay.style.opacity = '1'
          overlay.style.backdropFilter = 'blur(2px)'
        }
        if (panel) {
          panel.style.opacity = '1'
          panel.style.transform = 'translate3d(0,0,0) scale(1)'
          panel.style.willChange = 'transform, opacity'
        }

        const overlayAnim = overlay ? overlay.animate([
          { opacity: 1, backdropFilter: 'blur(2px)' },
          { opacity: 0, backdropFilter: 'blur(0px)' }
        ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }) : null

        const panelAnim = panel.animate([
          { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 0 },
          { transform: 'translate3d(4px,0,0) scale(.995)', offset: 0.25 },
          { transform: 'translate3d(-8px,0,0) scale(1.02)', offset: 0.6 },
          { transform: 'translate3d(28px,0,0) scale(.986)', opacity: 0, offset: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })

        Promise.all([overlayAnim ? overlayAnim.finished : Promise.resolve(), panelAnim.finished]).then(() => {
          if (panel) panel.style.willChange = ''
          done()
        }).catch(() => done())
      } catch (e) {
        done()
      }
    },
    scrollToTop() {
      if (this.$refs.panelBody) {
        this.$refs.panelBody.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    },
    // 🛡️ Helper: Get the original user query that led to this bot message
    getOriginalQueryForMessage(botMsg) {
      if (!botMsg) return ''
      const botIdx = this.messages.indexOf(botMsg)
      if (botIdx <= 0) return ''
      // Find the previous user message
      for (let i = botIdx - 1; i >= 0; i--) {
        if (this.messages[i] && this.messages[i].type === 'user') {
          return this.messages[i].text || ''
        }
      }
      return ''
    },
    // 🛡️ Select a clarification suggestion and send it as a new query
    selectClarificationSuggestion(suggestion) {
      if (!suggestion) return
      const title = (typeof suggestion === 'string') ? suggestion : (suggestion.title || suggestion.name || '')
      if (!title) return
      
      // If suggestion has an ID, send that directly
      if (typeof suggestion === 'object' && suggestion.id) {
        this.query = title
        this.onSend({ payload: { id: suggestion.id } })
      } else {
        this.query = title
        this.onSend()
      }
    }
    ,
    // Open PDF and auto-like the answer (user can still click 'unlike' afterward)
    openPdf(msg, url) {
      try {
        if (!msg) return
        // set feedback to like explicitly
        msg.feedback = 'like'
        this.saveChatHistory()
        // send feedback to backend if available using chatLogId
        if (this.$axios && msg.chatLogId) {
          const payload = { chatLogId: msg.chatLogId, liked: true }
          this.$axios.post('/chat/feedback', payload).catch(err => console.warn('Failed to send feedback', err))
        }
      } catch (e) {
        // ignore
      }
      // open PDF in new tab after updating state
      try {
        // Resolve relative URLs using API base
        let fullUrl = url
        try {
          const base = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : ''
          const cleanedBase = base ? base.replace(/\/$/, '') : ''
          if (fullUrl && !/^https?:\/\//i.test(fullUrl)) {
            fullUrl = cleanedBase ? `${cleanedBase}${fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`}` : fullUrl
          }
        } catch (_) { /* ignore env resolution errors */ }
        if (typeof window !== 'undefined' && fullUrl) window.open(fullUrl, '_blank', 'noopener')
      } catch (e) {
        // fallback: set location
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    }
    ,
    async sendHasAnswerLog(userQuery, questionId) {
      if (!userQuery) return null
      if (!(this.$axios && typeof this.$axios.post === 'function')) return null
      const payload = {
        Timestamp: new Date().toISOString(),
        UserQuery: userQuery,
        Status: 1,
        QuestionsAnswersID: questionId || null
      }
      try {
        const response = await this.$axios.post('/chat/logs/has-answer', payload)
        // Return chatLogId from backend response
        return response.data?.chatLogId || response.data?.ChatLogID || response.data?.id || null
      } catch (err) {
        console.warn('Failed to record has-answer log', err)
        return null
      }
    },
    sendNoAnswerLog(userQuery) {
      if (!userQuery) return null
      if (!(this.$axios && typeof this.$axios.post === 'function')) return null
      const payload = {
        Timestamp: new Date().toISOString(),
        UserQuery: userQuery,
        Status: 0
      }
      return this.$axios.post('/chat/logs/no-answer', payload)
        .then(res => res.data?.chatLogId || res.data?.ChatLogID || res.data?.id || null)
        .catch(err => {
          console.warn('Failed to record no-answer log', err)
          return null
        })
    },

    startThemeTransition() {
      // Show the transition circle and animate it expanding
      this.showThemeTransition = true
      this.themeTransitionSize = 0
      
      // Clear previous timer if exists
      if (this.themeTransitionTimer) clearTimeout(this.themeTransitionTimer)
      
      // Get theme button position (center of circle)
      const themeBtn = document.querySelector('.theme-toggle-btn')
      if (!themeBtn) return
      
      const rect = themeBtn.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Store center position in CSS variables
      document.documentElement.style.setProperty('--transition-x', centerX + 'px')
      document.documentElement.style.setProperty('--transition-y', centerY + 'px')
      
      // Animate size expansion over 600ms
      const startTime = Date.now()
      const duration = 600
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Calculate max size needed to cover entire viewport
        const maxSize = Math.sqrt(
          centerX * centerX + centerY * centerY + 
          (window.innerWidth - centerX) ** 2 + 
          (window.innerHeight - centerY) ** 2
        ) * 2
        
        this.themeTransitionSize = maxSize * progress
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Animation complete - hide circle
          this.themeTransitionTimer = setTimeout(() => {
            this.showThemeTransition = false
          }, 100)
        }
      }
      
      animate()
    }
  }
}
</script>

<style scoped>

</style>


<style src="../assets/chatbot-view.css"></style>
<style src="../assets/dark-mode.css"></style>
<style src="../assets/light-mode.css"></style>
