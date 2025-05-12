<template>
  <div class="quota-info" v-if="quotaInfo" :class="{ 'no-border': !showBorder, 'compact': isCompact }">
    <div class="quota-header">{{ title || 'Storage Usage' }}</div>
    <div class="quota-tier" v-if="!isCompact">
      <span class="tier-badge">{{ quotaInfo.tierName }}</span>
    </div>
    <div class="quota-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: quotaInfo.usagePercentage + '%' }"></div>
      </div>
      <div class="quota-text">
        <span>{{ quotaInfo.totalSizeFormatted }} of {{ quotaInfo.storageLimitFormatted }}</span>
        <span v-if="!isCompact">{{ quotaInfo.totalFiles }} files</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../services/api';

export default {
  name: 'StorageQuota',
  props: {
    title: {
      type: String,
      default: 'Storage Usage'
    },
    showBorder: {
      type: Boolean,
      default: true
    },
    isCompact: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const quotaInfo = ref(null);
    
    const fetchQuotaInfo = async () => {
      try {
        const response = await api.get('/user/quota');
        quotaInfo.value = response.data;
      } catch (error) {
        console.error('Error fetching user quota:', error);
      }
    };
    
    onMounted(() => {
      fetchQuotaInfo();
    });
    
    return {
      quotaInfo
    };
  }
};
</script>

<style scoped>
.quota-info {
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary, #f8fafc);
  border-radius: 8px;
}

.no-border {
  border-bottom: none;
}

.compact {
  padding: 10px 15px;
}

.quota-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.compact .quota-header {
  font-size: 13px;
  margin-bottom: 6px;
}

.quota-tier {
  margin-bottom: 10px;
}

.tier-badge {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-white);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 12px;
}

.quota-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compact .quota-progress {
  gap: 4px;
}

.progress-bar {
  height: 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.compact .progress-bar {
  height: 4px;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-fill[style*="width: 90"] {
  background-color: var(--color-warning, #f59e0b);
}

.progress-fill[style*="width: 100"] {
  background-color: var(--color-danger, #ef4444);
}

.quota-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
}

.compact .quota-text {
  font-size: 11px;
  justify-content: flex-start;
}
</style> 