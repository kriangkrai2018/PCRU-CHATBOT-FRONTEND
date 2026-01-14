<template>
  <div class="effects-section">
    <!-- Apple-style Split Layout: Settings + Preview -->
    <div class="effects-split-layout">
      <!-- Left: Settings Card -->
      <div class="effects-settings-panel">
        <div class="effects-card">
          <div class="effects-card-header">
            <div class="card-icon-wrapper">
              <svg class="card-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="effectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#effectGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">จัดการเอฟเฟกต์</h3>
          <p class="card-subtitle">ตั้งค่าเอฟเฟกต์ภาพและแอนิเมชันในหน้า Chatbot</p>
        </div>
      </div>

      <div class="effects-card-body">
        <!-- Master Effects Toggle -->
        <div class="effect-item master-toggle">
          <div class="effect-info">
            <div class="effect-icon master-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เอฟเฟกต์ทั้งหมด (Master)</h4>
              <p class="effect-desc">เปิด/ปิกเอฟเฟกต์ทั้งหมดพร้อมกัน - ปิดแล้วไม่สามารถเปิดแต่ละตัวได้</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="masterEnabled"
                @change="toggleMaster"
                :disabled="isSaving"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: masterEnabled }">
              {{ masterEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Snow Effect Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon snow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="2" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="22" r="1.5" fill="currentColor"/>
                <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="22" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">❄️ เอฟเฟกต์หิมะ (Snow)</h4>
              <p class="effect-desc">แสดงหิมะตกในหน้า Chatbot (พ.ย. - ก.พ.)</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="snowEnabled"
                @change="toggleSnow"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: snowEnabled }">
              {{ snowEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Summer Effect Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon summer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">☀️ เอฟเฟกต์ฤดูร้อน (Summer)</h4>
              <p class="effect-desc">แสดงแสงแดดและหิ่งห้อยในหน้า Chatbot (มี.ค. - พ.ค.)</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="summerEnabled"
                @change="toggleSummer"
                :disabled="true"
                data-bs-toggle="tooltip"
                data-bs-title="Coming Soon"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: summerEnabled }">
              {{ summerEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Rain Effect Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon rain-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 13v8M8 13v8M12 15v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">🌧️ เอฟเฟกต์ฤดูฝน (Rain)</h4>
              <p class="effect-desc">แสดงฝนตกในหน้า Chatbot (มิ.ย. - ต.ค.)</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="rainEnabled"
                @change="toggleRain"
                :disabled="true"
                data-bs-toggle="tooltip"
                data-bs-title="Coming Soon"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: rainEnabled }">
              {{ rainEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Box Shadow Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon shadow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M7 20l-2 2M17 20l2 2M20 7l2-2M20 17l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">เงา (Box Shadow)</h4>
              <p class="effect-desc">เปิด/ปิดเงาของปุ่มและการ์ดต่างๆ ในหน้า Chatbot</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="shadowEnabled"
                @change="toggleShadow"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: shadowEnabled }">
              {{ shadowEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Animation Toggle -->
        <div class="effect-item">
          <div class="effect-info">
            <div class="effect-icon animation-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="effect-text">
              <h4 class="effect-title">แอนิเมชันทั้งหมด</h4>
              <p class="effect-desc">เปิด/ปิดแอนิเมชันทั้งหมด รวมถึงเอฟเฟกต์ต่างๆ</p>
            </div>
          </div>
          <div class="effect-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="animationEnabled"
                @change="toggleAnimation"
                :disabled="isSaving || !masterEnabled"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-status" :class="{ active: animationEnabled }">
              {{ animationEnabled ? 'เปิด' : 'ปิด' }}
            </span>
          </div>
        </div>

        <!-- Save Button -->
        <div class="effects-actions">
          <button
            class="btn-save-effects"
            @click="saveSettings"
            :disabled="isSaving || !hasChanges"
          >
            <span v-if="!isSaving" class="btn-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>บันทึกการตั้งค่า</span>
            </span>
            <span v-else class="btn-content">
              <span class="spinner"></span>
              <span>กำลังบันทึก...</span>
            </span>
          </button>
          
          <button
            v-if="hasChanges"
            class="btn-reset-effects"
            @click="resetSettings"
            :disabled="isSaving"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>ยกเลิก</span>
          </button>
        </div>
      </div>
        </div>
      </div>
      <!-- End Settings Panel -->

      <!-- Right: Apple-style Live Preview Panel -->
      <div class="effects-preview-panel">
        <div class="preview-card">
          <div class="preview-card-header">
            <div class="preview-badge">
              <span class="preview-badge-dot"></span>
              <span>Live Preview</span>
            </div>
            <h3 class="preview-title">ตัวอย่างเอฟเฟกต์</h3>
            <p class="preview-subtitle">ดูตัวอย่างการแสดงผลก่อนบันทึก</p>
          </div>
          
          <!-- Season Selector -->
          <div class="season-selector">
            <span class="season-selector-label">เลือกฤดูกาล (Preview):</span>
            <div class="season-buttons">
              <button 
                class="season-btn" 
                :class="{ active: previewSeason === 'winter', disabled: !snowEnabled || !masterEnabled }"
                @click="previewSeason = 'winter'"
                :disabled="!snowEnabled || !masterEnabled"
              >
                <span class="season-icon">❄️</span>
                <span class="season-name">หนาว</span>
              </button>
              <button 
                class="season-btn" 
                :class="{ active: previewSeason === 'summer', disabled: true }"
                @click="previewSeason = 'summer'"
                :disabled="true"
                data-bs-toggle="tooltip"
                data-bs-title="Coming Soon"
              >
                <span class="season-icon">☀️</span>
                <span class="season-name">ร้อน</span>
              </button>
              <button 
                class="season-btn" 
                :class="{ active: previewSeason === 'rainy', disabled: true }"
                @click="previewSeason = 'rainy'"
                :disabled="true"
                data-bs-toggle="tooltip"
                data-bs-title="Coming Soon"
              >
                <span class="season-icon">🌧️</span>
                <span class="season-name">ฝน</span>
              </button>
              <button 
                class="season-btn" 
                :class="{ active: previewSeason === 'none' }"
                @click="previewSeason = 'none'"
              >
                <span class="season-icon">🚫</span>
                <span class="season-name">ไม่มี</span>
              </button>
            </div>
            
            <!-- Apply Season Button -->
            <div class="season-apply-section">
              <button 
                class="btn-apply-season"
                @click="applySeasonOverride"
                :disabled="!masterEnabled || previewSeason === 'none'"
                :class="{ 'has-override': activeSeason !== 'auto' }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="activeSeason === 'auto'">ใช้งานฤดู {{ getSeasonName(previewSeason) }}</span>
                <span v-else>อัพเดทเป็นฤดู {{ getSeasonName(previewSeason) }}</span>
              </button>
              
              <button 
                v-if="activeSeason !== 'auto'"
                class="btn-reset-season"
                @click="resetSeasonToAuto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>ใช้อัตโนมัติ</span>
              </button>
            </div>
            
            <!-- Current Active Season Info -->
            <div class="active-season-info" v-if="activeSeason !== 'auto'">
              <span class="active-season-badge">
                <span class="badge-icon">{{ getSeasonEmoji(activeSeason) }}</span>
                <span class="badge-text">กำลังใช้: {{ getSeasonName(activeSeason) }}</span>
              </span>
            </div>
          </div>
          
          <div class="preview-device-frame">
            <!-- iPhone-style Device Frame -->
            <div class="device-notch"></div>
            <div class="device-screen" :class="[previewClasses, 'season-' + previewSeason]">
              <!-- Preview Snow Effect (Winter) -->
              <div v-if="previewSeason === 'winter' && snowEnabled && masterEnabled" class="preview-snow-container">
                <div v-for="i in 20" :key="'snow-' + i" class="preview-snowflake" :style="getSnowflakeStyle(i)">❄</div>
              </div>
              
              <!-- Preview Summer Effect (Fireflies) -->
              <div v-if="previewSeason === 'summer' && summerEnabled && masterEnabled" class="preview-summer-container">
                <div v-for="i in 15" :key="'firefly-' + i" class="preview-firefly" :style="getFireflyStyle(i)">✨</div>
                <div class="preview-sun-rays"></div>
              </div>
              
              <!-- Preview Rain Effect -->
              <div v-if="previewSeason === 'rainy' && rainEnabled && masterEnabled" class="preview-rain-container">
                <div v-for="i in 30" :key="'rain-' + i" class="preview-raindrop" :style="getRaindropStyle(i)"></div>
              </div>
              
              <!-- Chatbot Window Preview -->
              <div class="preview-chatbot-window">
                <!-- Header -->
                <div class="preview-chat-header">
                  <div class="preview-avatar" :class="{ 'no-animation': !animationEnabled || !masterEnabled }">
                    <span class="avatar-emoji">🤖</span>
                  </div>
                  <div class="preview-header-text">
                    <span class="preview-bot-name">PCRU Chatbot</span>
                    <span class="preview-bot-status">● ออนไลน์</span>
                  </div>
                  <div class="preview-close-btn" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled }">✕</div>
                </div>
                
                <!-- Messages -->
                <div class="preview-messages">
                  <div class="preview-msg bot" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled, 'no-animation': !animationEnabled || !masterEnabled }">
                    <span>สวัสดีครับ! 👋 มีอะไรให้ช่วยไหมครับ?</span>
                  </div>
                  <div class="preview-msg user" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled, 'no-animation': !animationEnabled || !masterEnabled }">
                    <span>สอบถามเรื่องการลงทะเบียน</span>
                  </div>
                  <div class="preview-msg bot" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled, 'no-animation': !animationEnabled || !masterEnabled }">
                    <span>การลงทะเบียนสามารถทำได้ที่สำนักทะเบียนครับ 📚</span>
                  </div>
                </div>
                
                <!-- Input Area -->
                <div class="preview-input-area">
                  <div class="preview-input" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled }">
                    <span class="preview-placeholder">พิมพ์ข้อความ...</span>
                  </div>
                  <div class="preview-send-btn" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled, 'no-animation': !animationEnabled || !masterEnabled }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- FAB Button Preview -->
              <div class="preview-fab" :class="{ 'no-shadow': !shadowEnabled || !masterEnabled, 'no-animation': !animationEnabled || !masterEnabled }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z" fill="white"/>
                </svg>
              </div>
              
              <!-- Master Off Overlay -->
              <transition name="fade">
                <div v-if="!masterEnabled" class="preview-disabled-overlay">
                  <div class="disabled-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M4 4l16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="disabled-text">เอฟเฟกต์ถูกปิด</span>
                </div>
              </transition>
            </div>
            <div class="device-home-indicator"></div>
          </div>
          
          <!-- Current Preview Info -->
          <div class="preview-current-info">
            <div class="current-season-display">
              <span class="current-label">กำลังแสดง:</span>
              <span class="current-value" v-if="previewSeason === 'winter'">❄️ ฤดูหนาว</span>
              <span class="current-value" v-else-if="previewSeason === 'summer'">☀️ ฤดูร้อน</span>
              <span class="current-value" v-else-if="previewSeason === 'rainy'">🌧️ ฤดูฝน</span>
              <span class="current-value" v-else>🚫 ไม่มีเอฟเฟกต์ฤดูกาล</span>
            </div>
          </div>
          
          <!-- Effect Status Indicators -->
          <div class="preview-status-grid">
            <div class="status-item" :class="{ active: masterEnabled }">
              <span class="status-dot"></span>
              <span class="status-label">Master</span>
            </div>
            <div class="status-item" :class="{ active: snowEnabled && masterEnabled, previewing: previewSeason === 'winter' }">
              <span class="status-dot snow"></span>
              <span class="status-label">❄️ Snow</span>
            </div>
            <div class="status-item" :class="{ active: summerEnabled && masterEnabled, previewing: previewSeason === 'summer' }">
              <span class="status-dot summer"></span>
              <span class="status-label">☀️ Summer</span>
            </div>
            <div class="status-item" :class="{ active: rainEnabled && masterEnabled, previewing: previewSeason === 'rainy' }">
              <span class="status-dot rain"></span>
              <span class="status-label">🌧️ Rain</span>
            </div>
            <div class="status-item" :class="{ active: shadowEnabled && masterEnabled }">
              <span class="status-dot"></span>
              <span class="status-label">Shadow</span>
            </div>
            <div class="status-item" :class="{ active: animationEnabled && masterEnabled }">
              <span class="status-dot"></span>
              <span class="status-label">Animation</span>
            </div>
          </div>
        </div>
      </div>
      <!-- End Preview Panel -->
    </div>
    <!-- End Split Layout -->

    <!-- Info Card -->
    <div class="info-card">
      <div class="info-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="info-text">
        <h4 class="info-title">ข้อมูลเพิ่มเติม</h4>
        <ul class="info-list">
          <li>
            <strong>เอฟเฟกต์ทั้งหมด (Master):</strong> สวิตช์หลักในการควบคุมเอฟเฟกต์ทั้งหมด เมื่อปิดจะทำให้ไม่สามารถเปิดเอฟเฟกต์อื่นได้ และจะปิดเอฟเฟกต์การเคลื่อนไหวทุกประเภทพร้อมกัน รวมถึงปุ่มต่างๆ, การเคลื่อนไหวของ Avatar และ Animation ทั้งหมด เหมาะสำหรับอุปกรณ์ที่ต้องการประหยัดพลังงานหรือเพิ่มประสิทธิภาพสูงสุด
          </li>
          <li>
            <strong>เอฟเฟกต์หิมะ (Snow):</strong> แสดงหิมะตกลงมาในหน้า Chatbot โดยปกติจะแสดงเฉพาะช่วงฤดูหนาวในประเทศไทย (เดือนพฤศจิกายน - กุมภาพันธ์) สามารถเปิด-ปิดได้ตามต้องการโดยไม่ขึ้นกับฤดูกาล ช่วยสร้างบรรยากาศที่สนุกสนานและเป็นมิตรในการใช้งาน
          </li>
          <li>
            <strong>เอฟเฟกต์ฤดูร้อน (Summer):</strong> แสดงประกายแสงจากแสงแดดและไฟลุ่มเพิ่มขึ้นในหน้า Chatbot โดยปกติจะแสดงเฉพาะช่วงฤดูร้อนในประเทศไทย (เดือนมีนาคม - พฤษภาคม) ช่วยสร้างบรรยากาศที่อบอุ่นและสดใสในช่วงแดดร้อนของปี เหมาะสำหรับเพิ่มความเป็นมิตรและอาหารแสงสว่างในการใช้งาน
          </li>
          <li>
            <strong>เอฟเฟกต์ฤดูฝน (Rain):</strong> แสดงเสียงฝนและการเคลื่อนไหวของหยดน้ำในหน้า Chatbot โดยปกติจะแสดงเฉพาะช่วงฤดูฝนในประเทศไทย (เดือนมิถุนายน - ตุลาคม) ช่วยสร้างบรรยากาศที่เย็นสบายและเป็นธรรมชาติในช่วงหน้าฝนของปี สร้างความสุขสันต์และเพิ่มความสมจริงในการแชท
          </li>
          <li>
            <strong>เงา (Box Shadow):</strong> เปิด-ปิดเงาของปุ่ม การ์ด และองค์ประกอบต่างๆ ในหน้า Chatbot การปิดเงาจะช่วยลดภาระการประมวลผลกราฟิกและทำให้หน้าจอดูแบนราบ เหมาะสำหรับผู้ที่ชอบ Flat Design หรือต้องการเพิ่มความเร็วในการแสดงผล
          </li>
          <li>
            <strong>แอนิเมชันทั้งหมด:</strong> ควบคุมการเคลื่อนไหวพิเศษต่างๆ รวมถึง Fade Effect, Slide Animation และเอฟเฟกต์การเปลี่ยนหน้าต่างๆ การปิดจะช่วยเพิ่มประสิทธิภาพการทำงานบนอุปกรณ์ที่มีสเปคต่ำ ลดการใช้แบตเตอรี่ และทำให้การตอบสนองเร็วขึ้น เหมาะสำหรับผู้ใช้ที่ต้องการประสิทธิภาพสูงสุด
          </li>
        </ul>
        <p class="info-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>หมายเหตุ:</strong> การเปลี่ยนแปลงการตั้งค่าจะมีผลทันทีหลังจากกดปุ่ม "บันทึกการตั้งค่า" และจะบันทึกลงในอุปกรณ์ของคุณ ไม่จำเป็นต้อง Refresh หน้าเว็บ</span>
        </p>
      </div>
    </div>

    <!-- Apple-style Alert Modal -->
    <transition name="apple-alert-fade">
      <div v-if="showAlert" class="apple-alert-backdrop" @click="closeAlert">
        <div class="apple-alert-container" @click.stop>
          <div class="apple-alert-icon">
            <svg v-if="alertType === 'success'" class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-check" fill="none" d="M14 27l7.5 7.5L38 18"/>
            </svg>
            <svg v-else class="alert-icon-svg" viewBox="0 0 52 52">
              <circle class="alert-icon-circle-error" cx="26" cy="26" r="25" fill="none"/>
              <path class="alert-icon-x" fill="none" d="M16 16l20 20M36 16L16 36"/>
            </svg>
          </div>
          <h3 class="apple-alert-title">{{ alertTitle }}</h3>
          <p class="apple-alert-text">{{ alertText }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { Tooltip } from 'bootstrap'

// Get global properties
const { appContext } = getCurrentInstance()
const { $axios, $swal } = appContext.config.globalProperties

// Loading states
const isSaving = ref(false)

// Apple alert states
const showAlert = ref(false)
const alertType = ref('success')
const alertTitle = ref('')
const alertText = ref('')
let alertTimeout = null

// Effect states
const masterEnabled = ref(true)
const snowEnabled = ref(false)
const summerEnabled = ref(true)
const rainEnabled = ref(true)

// Preview season selector (for preview panel only)
const previewSeason = ref('winter')

// Active season override ('auto' means use natural season based on date)
const activeSeason = ref('auto')
const shadowEnabled = ref(true)
const animationEnabled = ref(true)

// Original states for comparison
const originalMaster = ref(true)
const originalSnow = ref(false)
const originalSummer = ref(true)
const originalRain = ref(true)
const originalShadow = ref(true)
const originalAnimation = ref(true)

// Check if there are unsaved changes
const hasChanges = computed(() => {
  return (
    masterEnabled.value !== originalMaster.value ||
    snowEnabled.value !== originalSnow.value ||
    summerEnabled.value !== originalSummer.value ||
    rainEnabled.value !== originalRain.value ||
    shadowEnabled.value !== originalShadow.value ||
    animationEnabled.value !== originalAnimation.value
  )
})

// Preview computed classes
const previewClasses = computed(() => ({
  'no-effects': !masterEnabled.value,
  'no-shadows': !shadowEnabled.value || !masterEnabled.value,
  'no-animations': !animationEnabled.value || !masterEnabled.value
}))

// Season helper functions
const getSeasonName = (season) => {
  const names = {
    winter: 'หนาว',
    summer: 'ร้อน',
    rainy: 'ฝน',
    none: 'ไม่มี',
    auto: 'อัตโนมัติ'
  }
  return names[season] || season
}

const getSeasonEmoji = (season) => {
  const emojis = {
    winter: '❄️',
    summer: '☀️',
    rainy: '🌧️',
    none: '🚫',
    auto: '🔄'
  }
  return emojis[season] || '🔄'
}

// Apply season override
const applySeasonOverride = () => {
  if (previewSeason.value === 'none') return
  
  activeSeason.value = previewSeason.value
  localStorage.setItem('chatbot_active_season', previewSeason.value)
  
  showAppleAlert('success', 'ใช้งานฤดูกาลสำเร็จ', `เปลี่ยนเป็นฤดู${getSeasonName(previewSeason.value)}แล้ว`, 2000)
}

// Reset to auto season
const resetSeasonToAuto = () => {
  activeSeason.value = 'auto'
  localStorage.removeItem('chatbot_active_season')
  
  showAppleAlert('success', 'รีเซ็ตสำเร็จ', 'กลับไปใช้ฤดูกาลอัตโนมัติตามวันที่', 2000)
}

// Preview helper functions
const getSnowflakeStyle = (index) => {
  const left = (index * 5) % 100
  const delay = (index * 0.3) % 3
  const duration = 3 + (index % 3)
  const size = 8 + (index % 8)
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}px`,
    opacity: 0.3 + (index % 5) * 0.15
  }
}

const getFireflyStyle = (index) => {
  const left = 5 + (index * 6) % 90
  const top = 10 + (index * 7) % 80
  const delay = (index * 0.5) % 4
  const duration = 2 + (index % 3)
  return {
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getRaindropStyle = (index) => {
  const left = (index * 3.3) % 100
  const delay = (index * 0.15) % 2
  const duration = 0.8 + (index % 3) * 0.2
  const height = 10 + (index % 10)
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    height: `${height}px`
  }
}

// Load settings from localStorage or API
const loadSettings = () => {
  try {
    // Load from localStorage
    const savedMaster = localStorage.getItem('chatbot_master_enabled')
    const savedSnow = localStorage.getItem('chatbot_snow_enabled')
    const savedSummer = localStorage.getItem('chatbot_summer_enabled')
    const savedRain = localStorage.getItem('chatbot_rain_enabled')
    const savedShadow = localStorage.getItem('chatbot_shadow_enabled')
    const savedAnimation = localStorage.getItem('chatbot_animation_enabled')
    const savedActiveSeason = localStorage.getItem('chatbot_active_season')

    if (savedMaster !== null) {
      masterEnabled.value = savedMaster === 'true'
      originalMaster.value = savedMaster === 'true'
    }

    if (savedSnow !== null) {
      snowEnabled.value = savedSnow === 'true'
      originalSnow.value = savedSnow === 'true'
    }

    if (savedSummer !== null) {
      summerEnabled.value = savedSummer === 'true'
      originalSummer.value = savedSummer === 'true'
    }

    if (savedRain !== null) {
      rainEnabled.value = savedRain === 'true'
      originalRain.value = savedRain === 'true'
    }

    if (savedShadow !== null) {
      shadowEnabled.value = savedShadow === 'true'
      originalShadow.value = savedShadow === 'true'
    }

    if (savedAnimation !== null) {
      animationEnabled.value = savedAnimation === 'true'
      originalAnimation.value = savedAnimation === 'true'
    }
    
    // Load active season override
    if (savedActiveSeason !== null) {
      activeSeason.value = savedActiveSeason
      previewSeason.value = savedActiveSeason // Set preview to match active
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// Apple alert functions
const showAppleAlert = (type, title, text, duration = 2000) => {
  alertType.value = type
  alertTitle.value = title
  alertText.value = text
  showAlert.value = true
  
  if (alertTimeout) clearTimeout(alertTimeout)
  alertTimeout = setTimeout(() => {
    closeAlert()
  }, duration)
}

const closeAlert = () => {
  showAlert.value = false
  if (alertTimeout) {
    clearTimeout(alertTimeout)
    alertTimeout = null
  }
}

// Toggle functions
const toggleMaster = (event) => {
  masterEnabled.value = event.target.checked
  // When master is turned off, turn off all effects
  if (!event.target.checked) {
    snowEnabled.value = false
    summerEnabled.value = false
    rainEnabled.value = false
    shadowEnabled.value = false
    animationEnabled.value = false
  }
}

const toggleSnow = (event) => {
  snowEnabled.value = event.target.checked
}

const toggleSummer = (event) => {
  summerEnabled.value = event.target.checked
}

const toggleRain = (event) => {
  rainEnabled.value = event.target.checked
}

const toggleShadow = (event) => {
  shadowEnabled.value = event.target.checked
}

const toggleAnimation = (event) => {
  animationEnabled.value = event.target.checked
}

// Save settings
const saveSettings = async () => {
  try {
    isSaving.value = true

    // Save to localStorage
    localStorage.setItem('chatbot_master_enabled', masterEnabled.value.toString())
    localStorage.setItem('chatbot_snow_enabled', snowEnabled.value.toString())
    localStorage.setItem('chatbot_summer_enabled', summerEnabled.value.toString())
    localStorage.setItem('chatbot_rain_enabled', rainEnabled.value.toString())
    localStorage.setItem('chatbot_shadow_enabled', shadowEnabled.value.toString())
    localStorage.setItem('chatbot_animation_enabled', animationEnabled.value.toString())

    // Update original values
    originalMaster.value = masterEnabled.value
    originalSnow.value = snowEnabled.value
    originalSummer.value = summerEnabled.value
    originalRain.value = rainEnabled.value
    originalShadow.value = shadowEnabled.value
    originalAnimation.value = animationEnabled.value

    // Apply or remove no-effects class based on master toggle
    if (masterEnabled.value) {
      document.body.classList.remove('no-effects')
    } else {
      document.body.classList.add('no-effects')
    }

    // Apply or remove no-shadows class based on shadow toggle
    if (shadowEnabled.value && masterEnabled.value) {
      document.body.classList.remove('no-shadows')
    } else {
      document.body.classList.add('no-shadows')
    }

    // Optional: Save to backend
    try {
      await $axios.post('/api/chatbot-settings', {
        snow_enabled: snowEnabled.value,
        animation_enabled: animationEnabled.value
      })
    } catch (apiError) {
      console.warn('Could not save to backend:', apiError)
    }

    // Broadcast settings change for other components (so preview updates immediately)
    try {
      window.dispatchEvent(new CustomEvent('chatbot-settings-changed', {
        detail: {
          masterEnabled: masterEnabled.value,
          snowEnabled: snowEnabled.value,
          shadowEnabled: shadowEnabled.value,
          animationEnabled: animationEnabled.value
        }
      }))
    } catch (e) { /* ignore */ }

    // Show success message - Apple style
    showAppleAlert('success', 'บันทึกสำเร็จ', 'การตั้งค่าเอฟเฟกต์ถูกบันทึกแล้ว', 2000)

  } catch (error) {
    console.error('Error saving settings:', error)
    showAppleAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้', 3000)
  } finally {
    isSaving.value = false
  }
}

// Reset settings to original
const resetSettings = () => {
  snowEnabled.value = originalSnow.value
  animationEnabled.value = originalAnimation.value
}

// Load settings on mount
const initTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((el) => new Tooltip(el))
}

onMounted(() => {
  loadSettings()
  initTooltips()
})
</script>

<style scoped>
.effects-section {
  margin-top: 2rem;
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.effects-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(139, 92, 184, 0.1);
  box-shadow: 
    0 8px 32px rgba(139, 92, 184, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.effects-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 48px rgba(139, 92, 184, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

.effects-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.05) 0%, rgba(167, 139, 250, 0.03) 100%);
  border-bottom: 1px solid rgba(139, 92, 184, 0.08);
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
  flex-shrink: 0;
}

.card-icon {
  filter: drop-shadow(0 2px 4px rgba(139, 92, 184, 0.2));
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.effects-card-body {
  padding: 28px;
}

.effect-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(249, 250, 251, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 16px;
}

.effect-item:last-of-type {
  margin-bottom: 24px;
}

.effect-item:hover {
  background: rgba(139, 92, 184, 0.05);
  transform: translateX(4px);
}

.effect-item.master-toggle {
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.1) 0%, rgba(107, 44, 145, 0.08) 100%);
  border: 2px solid rgba(139, 92, 184, 0.2);
  margin-bottom: 24px;
}

.effect-item.master-toggle:hover {
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.15) 0%, rgba(107, 44, 145, 0.12) 100%);
  border-color: rgba(139, 92, 184, 0.3);
}

.effect-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.effect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.effect-item:hover .effect-icon {
  transform: scale(1.1) rotate(5deg);
}

.master-icon {
  background: linear-gradient(135deg, #8B4CB8 0%, #6B2C91 100%);
  color: white;
}

.snow-icon {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  color: white;
}

.summer-icon {
  background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
  color: white;
}

.rain-icon {
  background: linear-gradient(135deg, #6EE7B7 0%, #10B981 100%);
  color: white;
}

.shadow-icon {
  background: linear-gradient(135deg, #64748B 0%, #475569 100%);
  color: white;
}

.animation-icon {
  background: linear-gradient(135deg, #F472B6 0%, #EC4899 100%);
  color: white;
}

.effect-text {
  flex: 1;
}

.effect-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.effect-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.effect-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 34px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-status {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  min-width: 32px;
  transition: color 0.3s;
}

.toggle-status.active {
  color: #8B4CB8;
}

.effects-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-save-effects,
.btn-reset-effects {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.btn-save-effects {
  flex: 1;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 76, 184, 0.3);
}

.btn-save-effects:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 76, 184, 0.4);
}

.btn-save-effects:active:not(:disabled) {
  transform: translateY(0);
}

.btn-save-effects:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-reset-effects {
  padding: 12px 20px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.btn-reset-effects:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.15);
  color: #4b5563;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Info Card */
.info-card {
  margin-top: 16px;
  padding: 20px 24px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  display: flex;
  gap: 16px;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-icon {
  flex-shrink: 0;
  color: #3b82f6;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.8;
}

.info-list li {
  margin-bottom: 12px;
}

.info-list li:last-child {
  margin-bottom: 0;
}

.info-list strong {
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.info-note {
  margin: 16px 0 0 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-left: 3px solid #f59e0b;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
}

.info-note svg {
  flex-shrink: 0;
  color: #f59e0b;
  margin-top: 1px;
}

.info-note strong {
  color: #78350f;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .effects-card-header {
    padding: 20px;
  }

  .effects-card-body {
    padding: 20px;
  }

  .effect-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .effect-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .effects-actions {
    flex-direction: column;
  }

  .btn-save-effects,
  .btn-reset-effects {
    width: 100%;
  }

  .info-card {
    flex-direction: column;
    gap: 12px;
  }
}

/* Apple-style Alert Modal */
.apple-alert-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.apple-alert-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 40px 32px 32px;
  max-width: 340px;
  width: 100%;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  text-align: center;
  animation: appleAlertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes appleAlertSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.apple-alert-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.alert-icon-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.alert-icon-circle {
  stroke: #34D399;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: alertCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.1s;
}

.alert-icon-check {
  stroke: #34D399;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: alertCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.4s;
}

.alert-icon-circle-error {
  stroke: #EF4444;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: alertCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.1s;
}

.alert-icon-x {
  stroke: #EF4444;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 54;
  stroke-dashoffset: 54;
  animation: alertCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.4s;
}

@keyframes alertCircle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes alertCheck {
  to {
    stroke-dashoffset: 0;
  }
}

.apple-alert-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.apple-alert-text {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Fade transition */
.apple-alert-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-alert-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.apple-alert-fade-enter-from {
  opacity: 0;
}

.apple-alert-fade-leave-to {
  opacity: 0;
}

.apple-alert-fade-enter-from .apple-alert-container {
  transform: scale(0.92) translateY(12px);
}

.apple-alert-fade-leave-to .apple-alert-container {
  transform: scale(0.96);
}

/* ===== Apple-style Split Layout & Preview Panel ===== */
.effects-split-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}

.effects-settings-panel {
  min-width: 0;
}

.effects-preview-panel {
  position: sticky;
  top: 24px;
}

.preview-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(139, 92, 184, 0.1);
  box-shadow: 
    0 8px 32px rgba(139, 92, 184, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.preview-card-header {
  padding: 24px 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(139, 92, 184, 0.08);
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.03) 0%, rgba(167, 139, 250, 0.02) 100%);
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.preview-badge-dot {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.preview-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* Season Selector */
.season-selector {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(139, 92, 184, 0.08);
  background: rgba(249, 250, 251, 0.5);
}

.season-selector-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 10px;
  text-align: center;
}

.season-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.season-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.season-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.season-btn.active {
  border-color: #8B4CB8;
  background: linear-gradient(135deg, rgba(139, 76, 184, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%);
  box-shadow: 0 4px 16px rgba(139, 76, 184, 0.2);
}

.season-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.season-icon {
  font-size: 20px;
  line-height: 1;
}

.season-name {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.season-btn.active .season-name {
  color: #8B4CB8;
}

/* Season-specific screen backgrounds */
.device-screen.season-winter {
  background: linear-gradient(180deg, #a8c8e8 0%, #d4e5f7 50%, #e8f1fa 100%);
}

.device-screen.season-summer {
  background: linear-gradient(180deg, #ffecd2 0%, #fcb69f 50%, #ff9a56 100%);
}

.device-screen.season-rainy {
  background: linear-gradient(180deg, #667eea 0%, #5a6794 50%, #4b5563 100%);
}

.device-screen.season-none {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #6B73FF 100%);
}

/* Device Frame - iPhone Style */
.preview-device-frame {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-notch {
  width: 140px;
  height: 26px;
  background: #1f2937;
  border-radius: 0 0 20px 20px;
  margin-bottom: -26px;
  z-index: 10;
  position: relative;
}

.device-notch::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 4px;
  background: #374151;
  border-radius: 2px;
}

.device-screen {
  width: 240px;
  max-width: 300px;
  height: 480px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #6B73FF 100%);
  border-radius: 32px;
  border: 6px solid #1f2937;
  overflow: hidden;
  position: relative;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.device-home-indicator {
  width: 80px;
  height: 4px;
  background: #ffffff;
  border-radius: 2px;
  margin-top: -14px;
  z-index: 10;
  position: relative
}

/* Preview Snow Effect */
.preview-snow-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

.preview-snowflake {
  position: absolute;
  top: -20px;
  color: white;
  animation: snowfall linear infinite;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

@keyframes snowfall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(500px) rotate(360deg);
  }
}

/* Preview Summer Effect */
.preview-summer-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

.preview-firefly {
  position: absolute;
  font-size: 10px;
  animation: firefly-float ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.8));
}

@keyframes firefly-float {
  0%, 100% {
    opacity: 0.3;
    transform: translate(0, 0) scale(0.8);
  }
  25% {
    opacity: 1;
    transform: translate(10px, -15px) scale(1.2);
  }
  50% {
    opacity: 0.6;
    transform: translate(-5px, 10px) scale(1);
  }
  75% {
    opacity: 1;
    transform: translate(15px, 5px) scale(1.1);
  }
}

.preview-sun-rays {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  animation: sun-pulse 3s ease-in-out infinite;
}

@keyframes sun-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* Preview Rain Effect */
.preview-rain-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

.preview-raindrop {
  position: absolute;
  top: -20px;
  width: 2px;
  background: linear-gradient(180deg, transparent 0%, rgba(174, 194, 224, 0.8) 50%, rgba(174, 194, 224, 0.3) 100%);
  border-radius: 0 0 2px 2px;
  animation: rainfall linear infinite;
}

@keyframes rainfall {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(500px);
    opacity: 0;
  }
}

/* Chatbot Window Preview */
.preview-chatbot-window {
  position: absolute;
  bottom: 70px;
  left: 12px;
  right: 12px;
  height: 340px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.preview-chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  color: white;
}

.preview-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: avatar-pulse 2s ease-in-out infinite;
}

.preview-avatar.no-animation {
  animation: none;
}

.preview-avatar img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.avatar-emoji {
  font-size: 22px;
  line-height: 1;
}

@keyframes avatar-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.preview-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-bot-name {
  font-size: 13px;
  font-weight: 600;
}

.preview-bot-status {
  font-size: 10px;
  opacity: 0.9;
}

.preview-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preview-close-btn.no-shadow {
  box-shadow: none;
}

/* Messages */
.preview-messages {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.preview-msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 12px;
  line-height: 1.4;
  animation: msg-slide-in 0.3s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-msg.no-shadow {
  box-shadow: none;
}

.preview-msg.no-animation {
  animation: none;
}

@keyframes msg-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-msg.bot {
  align-self: flex-start;
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.preview-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

/* Input Area */
.preview-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.preview-input {
  flex: 1;
  height: 36px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-input.no-shadow {
  box-shadow: none;
}

.preview-placeholder {
  color: #9ca3af;
  font-size: 12px;
}

.preview-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4CB8 0%, #A78BFA 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(139, 76, 184, 0.3);
}

.preview-send-btn.no-shadow {
  box-shadow: none;
}

.preview-send-btn.no-animation:hover {
  transform: none;
}

/* FAB Button Preview */
.preview-fab {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4CB8 0%, #6B2C91 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(107, 44, 145, 0.4);
  animation: fab-bounce 2s ease-in-out infinite;
  z-index: 3;
}

.preview-fab.no-shadow {
  box-shadow: none;
}

.preview-fab.no-animation {
  animation: none;
}

@keyframes fab-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Disabled Overlay */
.preview-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 100;
}

.disabled-icon {
  color: rgba(255, 255, 255, 0.8);
  animation: disabled-pulse 2s ease-in-out infinite;
}

@keyframes disabled-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.disabled-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

/* Current Preview Info */
.preview-current-info {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(139, 92, 184, 0.05) 0%, rgba(167, 139, 250, 0.03) 100%);
  border-top: 1px solid rgba(139, 92, 184, 0.08);
}

.current-season-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.current-label {
  font-size: 12px;
  color: #6b7280;
}

.current-value {
  font-size: 14px;
  font-weight: 600;
  color: #8B4CB8;
}

/* Status Grid */
.preview-status-grid {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(139, 92, 184, 0.08);
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(156, 163, 175, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.status-item.active {
  background: rgba(34, 197, 94, 0.1);
}

.status-item.previewing {
  border: 2px solid #8B4CB8;
  animation: preview-glow 1.5s ease-in-out infinite;
}

@keyframes preview-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 76, 184, 0.3); }
  50% { box-shadow: 0 0 8px 2px rgba(139, 76, 184, 0.4); }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  transition: all 0.3s ease;
}

.status-item.active .status-dot {
  background: #10B981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

/* Seasonal status dot colors */
.status-item.active .status-dot.snow {
  background: #3B82F6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.status-item.active .status-dot.summer {
  background: #F59E0B;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.status-item.active .status-dot.rain {
  background: #10B981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-item.active .status-label {
  color: #059669;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive - Preview Panel */
@media (max-width: 1100px) {
  .effects-split-layout {
    grid-template-columns: 1fr;
  }
  
  .effects-preview-panel {
    position: static;
    order: -1;
  }
  
  .preview-card {
    margin-bottom: 24px;
  }
  
  .preview-device-frame {
    padding: 16px;
  }
  
  .device-screen {
    max-width: 260px;
    height: 475px;
  }
  
  .preview-chatbot-window {
    height: 300px;
    bottom: 60px;
  }
}

@media (max-width: 480px) {
  .device-screen {
    max-width: 240px;
    height: 445px;
  }
  
  .preview-chatbot-window {
    height: 260px;
    bottom: 50px;
    left: 8px;
    right: 8px;
  }
  
  .preview-status-grid {
    gap: 8px;
    padding: 12px;
  }
  
  .status-item {
    padding: 4px 8px;
  }
  
  .status-label {
    font-size: 10px;
  }
}

/* Season Override Buttons */
.season-apply-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.03) 100%);
  border-top: 1px solid rgba(16, 185, 129, 0.12);
}

.btn-apply-season {
  padding: 6px 16px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-apply-season:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.btn-apply-season:active {
  transform: scale(0.95);
}

.btn-reset-season {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-reset-season:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.02);
}

/* Active Season Info */
.active-season-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%);
  border-top: 1px solid rgba(16, 185, 129, 0.15);
}

.active-season-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-radius: 24px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.active-season-badge.winter {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
  border-color: rgba(59, 130, 246, 0.25);
}

.active-season-badge.summer {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%);
  border-color: rgba(245, 158, 11, 0.25);
}

.active-season-badge.rainy {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: rgba(16, 185, 129, 0.25);
}

.active-season-badge.none {
  background: rgba(107, 114, 128, 0.1);
  border-color: rgba(107, 114, 128, 0.2);
}

.active-badge-emoji {
  font-size: 18px;
}

.active-badge-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.active-badge-label {
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.active-badge-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

/* Dark mode support for season buttons */
:root[data-theme="dark"] .btn-reset-season {
  background: rgba(239, 68, 68, 0.15);
  color: #F87171;
  border-color: rgba(239, 68, 68, 0.3);
}

:root[data-theme="dark"] .active-season-info {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

:root[data-theme="dark"] .active-badge-label {
  color: #9ca3af;
}

:root[data-theme="dark"] .active-badge-value {
  color: #e5e7eb;
}

@media (max-width: 480px) {
  .active-season-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-apply-season,
  .btn-reset-season {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>
