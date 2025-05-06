<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content confirmation-modal">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      
      <div class="modal-footer">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="danger-btn" 
          @click="$emit('confirm')"
          :disabled="processing"
        >
          <span v-if="processing">Processing...</span>
          <span v-else>{{ buttonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleConfirmModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      default: 'Are you sure you want to perform this action?'
    },
    buttonText: {
      type: String,
      default: 'Confirm'
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'confirm']
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.confirmation-modal .modal-body {
  padding: 2rem 1.5rem;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.modal-body p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.secondary-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.danger-btn {
  background-color: var(--error-color);
  border: none;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  background-color: var(--error-color-dark, #c0392b);
}

.danger-btn:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}
</style> 