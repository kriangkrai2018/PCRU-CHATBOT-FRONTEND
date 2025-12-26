<template>
  <div class="">
    <div class="card p-4 bg-light shadow-sm mb-4 rounded-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-5 mb-0">
          <i class="bi bi-shield-check me-2"></i>
          Chatbot Quality Report
        </h3>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-primary" @click="fetchQualityReport" :disabled="loading">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
      
      <div class="alert alert-info alert-dismissible fade show py-2 px-3 small" role="alert">
        <i class="bi bi-info-circle me-1"></i>
        <strong>หมายเหตุ:</strong> รายงานนี้แสดงคุณภาพการตอบคำถามของ Chatbot เพื่อช่วยในการปรับปรุงระบบ
        <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        <p class="mt-2">Loading quality report...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Error: {{ error }}
      </div>
      
      <div v-else-if="report">
        <!-- Quality Score Overview -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="quality-card text-center p-4 rounded-3" :class="qualityScoreClass">
              <div class="quality-score-circle mb-2">
                <span class="fs-1 fw-bold">{{ report.qualityScore }}</span>
              </div>
              <div class="quality-label">Quality Score</div>
              <div class="quality-period text-muted small">{{ report.period }}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-white p-4 rounded-3 shadow-sm h-100">
              <div class="stat-icon text-primary mb-2">
                <i class="bi bi-chat-dots fs-2"></i>
              </div>
              <div class="stat-value fs-3 fw-bold">{{ report.totalResponses }}</div>
              <div class="stat-label text-muted">Total Responses</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card bg-white p-4 rounded-3 shadow-sm h-100">
              <div class="stat-icon text-danger mb-2">
                <i class="bi bi-hand-thumbs-down fs-2"></i>
              </div>
              <div class="stat-value fs-3 fw-bold">{{ report.negativeFeedbacks }}</div>
              <div class="stat-label text-muted">Negative Feedbacks</div>
            </div>
          </div>
        </div>
        
        <!-- Verification Summary -->
        <div class="row mb-4" v-if="report.verification && report.verification.summary">
          <div class="col-12">
            <h5 class="mb-3"><i class="bi bi-check-circle me-2"></i>Verification Summary</h5>
            <div class="row">
              <div class="col-md-4" v-for="stat in report.verification.summary" :key="stat.VerificationResult">
                <div class="verification-card p-3 rounded-3 mb-2" :class="getVerificationClass(stat.VerificationResult)">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="verification-label">{{ formatVerificationResult(stat.VerificationResult) }}</span>
                    <span class="verification-count fs-4 fw-bold">{{ stat.Count }}</span>
                  </div>
                  <div class="verification-avg small text-muted">
                    Avg Score: {{ (stat.AvgScore * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Calibration by Confidence Bucket -->
        <div class="row mb-4" v-if="report.calibration && report.calibration.byConfidenceBucket && report.calibration.byConfidenceBucket.length">
          <div class="col-12">
            <h5 class="mb-3"><i class="bi bi-speedometer2 me-2"></i>Confidence Calibration</h5>
            <div class="table-responsive">
              <table class="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Confidence Level</th>
                    <th>Avg Confidence</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bucket in report.calibration.byConfidenceBucket" :key="bucket.ConfidenceBucket">
                    <td>
                      <span class="badge" :class="getConfidenceBadgeClass(bucket.ConfidenceBucket)">
                        {{ bucket.ConfidenceBucket }}
                      </span>
                    </td>
                    <td>{{ (bucket.AvgConfidence * 100).toFixed(1) }}%</td>
                    <td class="text-success">{{ bucket.CorrectCount }}</td>
                    <td class="text-danger">{{ bucket.IncorrectCount }}</td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div class="progress-bar" :class="getAccuracyBarClass(bucket)" :style="{ width: getAccuracy(bucket) + '%' }">
                          {{ getAccuracy(bucket).toFixed(1) }}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Bad Responses by Reason -->
        <div class="row mb-4" v-if="report.badResponses && report.badResponses.byReason && report.badResponses.byReason.length">
          <div class="col-12">
            <h5 class="mb-3"><i class="bi bi-exclamation-triangle me-2"></i>Bad Responses by Reason</h5>
            <div class="row">
              <div class="col-md-6 col-lg-4" v-for="reason in report.badResponses.byReason" :key="reason.FailureReason">
                <div class="reason-card bg-white p-3 rounded-3 shadow-sm mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="reason-label">{{ formatFailureReason(reason.FailureReason) }}</span>
                    <span class="badge bg-danger">{{ reason.Count }}</span>
                  </div>
                  <div class="reason-confidence small text-muted mt-1">
                    Avg Confidence: {{ (reason.AvgConfidence * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Problematic Queries -->
        <div class="row mb-4" v-if="report.badResponses && report.badResponses.problematicQueries && report.badResponses.problematicQueries.length">
          <div class="col-12">
            <h5 class="mb-3"><i class="bi bi-question-circle me-2"></i>Problematic Queries (Repeated Failures)</h5>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>Fail Count</th>
                    <th>First Fail</th>
                    <th>Last Fail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in report.badResponses.problematicQueries.slice(0, 10)" :key="q.UserQuery">
                    <td class="text-truncate" style="max-width: 300px;" :title="q.UserQuery">{{ q.UserQuery }}</td>
                    <td><span class="badge bg-warning text-dark">{{ q.FailCount }}</span></td>
                    <td class="small">{{ formatDateTime(q.FirstFail) }}</td>
                    <td class="small">{{ formatDateTime(q.LastFail) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Recent Negative Feedbacks -->
        <div class="row mb-4" v-if="report.negativeFeedbackSamples && report.negativeFeedbackSamples.length">
          <div class="col-12">
            <h5 class="mb-3"><i class="bi bi-chat-left-text me-2"></i>Recent Negative Feedbacks</h5>
            <div class="feedback-list">
              <div class="feedback-item bg-white p-3 rounded-3 shadow-sm mb-2" v-for="fb in report.negativeFeedbackSamples" :key="fb.FeedbackID">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="feedback-content flex-grow-1">
                    <div class="user-query mb-2">
                      <strong class="text-primary">User:</strong> {{ fb.UserMessage || '-' }}
                    </div>
                    <div class="bot-response text-muted small">
                      <strong>Bot:</strong> {{ truncateText(fb.BotResponse, 150) || '-' }}
                    </div>
                  </div>
                  <div class="feedback-time small text-muted ms-3">
                    {{ formatRelativeTime(fb.Timestamp) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary" @click="triggerLearning" :disabled="learningInProgress">
                <i class="bi bi-lightbulb me-2" :class="{ 'spin': learningInProgress }"></i>
                {{ learningInProgress ? 'Learning...' : 'Trigger Learning' }}
              </button>
              <button class="btn btn-outline-secondary" @click="runMaintenance" :disabled="maintenanceInProgress">
                <i class="bi bi-gear me-2" :class="{ 'spin': maintenanceInProgress }"></i>
                {{ maintenanceInProgress ? 'Running...' : 'Run Maintenance' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center text-muted py-5">
        <i class="bi bi-clipboard-data fs-1 mb-3 d-block"></i>
        <p>No quality report data available</p>
        <button class="btn btn-primary" @click="fetchQualityReport">Load Report</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/formatTime';
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const error = ref(null)
const report = ref(null)
const learningInProgress = ref(false)
const maintenanceInProgress = ref(false)

// Computed: quality score class based on score
const qualityScoreClass = computed(() => {
  if (!report.value || !report.value.qualityScore) return 'bg-secondary'
  const score = parseFloat(report.value.qualityScore)
  if (score >= 80) return 'quality-high'
  if (score >= 60) return 'quality-medium'
  return 'quality-low'
})

// Fetch quality report from backend
async function fetchQualityReport() {
  loading.value = true
  error.value = null
  
  try {
    const res = await proxy.$axios.get('/admin/chatbot/quality-report', {
      params: { days: 7 }
    })
    
    if (res.data && res.data.success) {
      report.value = res.data.report
    } else {
      error.value = res.data?.message || 'Failed to load quality report'
    }
  } catch (err) {
    console.error('Quality report error:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load quality report'
  } finally {
    loading.value = false
  }
}

// Trigger learning from history
async function triggerLearning() {
  learningInProgress.value = true
  
  try {
    const res = await proxy.$axios.post('/admin/chatbot/learn-from-history')
    
    if (res.data && res.data.success) {
      alert('✅ Learning completed successfully!')
      fetchQualityReport() // Refresh report
    } else {
      alert('❌ Learning failed: ' + (res.data?.message || 'Unknown error'))
    }
  } catch (err) {
    console.error('Learning error:', err)
    alert('❌ Learning failed: ' + (err.response?.data?.message || err.message))
  } finally {
    learningInProgress.value = false
  }
}

// Run maintenance tasks
async function runMaintenance() {
  maintenanceInProgress.value = true
  
  try {
    const res = await proxy.$axios.post('/admin/chatbot/run-maintenance')
    
    if (res.data && res.data.success) {
      alert('✅ Maintenance completed!\n' + JSON.stringify(res.data.results, null, 2))
      fetchQualityReport() // Refresh report
    } else {
      alert('❌ Maintenance failed: ' + (res.data?.message || 'Unknown error'))
    }
  } catch (err) {
    console.error('Maintenance error:', err)
    alert('❌ Maintenance failed: ' + (err.response?.data?.message || err.message))
  } finally {
    maintenanceInProgress.value = false
  }
}

// Helpers
function formatVerificationResult(result) {
  const map = {
    'passed': '✅ Passed',
    'failed': '❌ Failed',
    'warning': '⚠️ Warning'
  }
  return map[result] || result
}

function getVerificationClass(result) {
  const map = {
    'passed': 'bg-success-subtle text-success',
    'failed': 'bg-danger-subtle text-danger',
    'warning': 'bg-warning-subtle text-warning'
  }
  return map[result] || 'bg-secondary-subtle'
}

function getConfidenceBadgeClass(bucket) {
  const map = {
    'high': 'bg-success',
    'medium': 'bg-primary',
    'low': 'bg-warning text-dark',
    'very_low': 'bg-danger'
  }
  return map[bucket] || 'bg-secondary'
}

function getAccuracy(bucket) {
  const total = (bucket.CorrectCount || 0) + (bucket.IncorrectCount || 0)
  if (total === 0) return 0
  return (bucket.CorrectCount / total) * 100
}

function getAccuracyBarClass(bucket) {
  const accuracy = getAccuracy(bucket)
  if (accuracy >= 80) return 'bg-success'
  if (accuracy >= 60) return 'bg-primary'
  if (accuracy >= 40) return 'bg-warning'
  return 'bg-danger'
}

function formatFailureReason(reason) {
  const map = {
    'low_confidence': 'Low Confidence',
    'verification_failed': 'Verification Failed',
    'user_negative_feedback': 'User Negative Feedback',
    'admin_marked_incorrect': 'Admin Marked Incorrect',
    'domain_mismatch': 'Domain Mismatch'
  }
  return map[reason] || reason
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// Using shared Thai relative time formatter
// formatRelativeTime imported from '@/utils/formatTime';


function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  fetchQualityReport()
})
</script>

<style scoped>
.quality-card {
  transition: all 0.3s ease;
}

.quality-high {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
}

.quality-medium {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
}

.quality-low {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
}

.quality-score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.verification-card {
  transition: all 0.2s ease;
}

.verification-card:hover {
  transform: scale(1.02);
}

.reason-card {
  border-left: 4px solid #dc3545;
}

.feedback-item {
  border-left: 4px solid #6c757d;
  transition: all 0.2s ease;
}

.feedback-item:hover {
  border-left-color: #0d6efd;
  background: #f8f9fa !important;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress {
  background: #e9ecef;
}
</style>
