<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div :class="['modal-content', { 'confirmation-modal': isConfirmation }]">
      <div class="modal-header" :class="headerClass">
        <div class="header-content">
          <div v-if="icon" class="header-icon" :class="iconClass">
            <slot name="icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <slot name="icon-path"></slot>
              </svg>
            </slot>
          </div>
          <div>
            <h2><slot name="title">{{ title }}</slot></h2>
            <p v-if="subtitle" class="modal-subtitle"><slot name="subtitle">{{ subtitle }}</slot></p>
          </div>
        </div>
      </div>
      
      <div class="modal-body">
        <slot></slot>
      </div>
      
      <div class="modal-footer" :class="footerClass">
        <slot name="footer">
          <button class="secondary-btn" @click="handleClose">
            <slot name="cancel-text">Cancel</slot>
          </button>
          <button 
            :class="[primaryButtonClass]" 
            @click="handlePrimaryAction"
            :disabled="primaryDisabled"
          >
            <span v-if="loading">
              <svg class="spinner" viewBox="0 0 24 24" width="18" height="18">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="30 100"/>
              </svg>
              <slot name="loading-text">Processing...</slot>
            </span>
            <span v-else>
              <slot name="primary-text">Confirm</slot>
            </span>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Modal'
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: Boolean,
      default: true
    },
    isConfirmation: {
      type: Boolean,
      default: false
    },
    isDanger: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    primaryDisabled: {
      type: Boolean,
      default: false
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['close', 'primary-action'],
  
  computed: {
    headerClass() {
      return {
        'danger-header': this.isDanger,
        'standard-header': !this.isDanger
      };
    },
    footerClass() {
      return {
        'danger-footer': this.isDanger,
        'standard-footer': !this.isDanger
      };
    },
    iconClass() {
      return {
        'danger-icon': this.isDanger,
        'standard-icon': !this.isDanger
      };
    },
    primaryButtonClass() {
      return this.isDanger ? 'danger-btn' : 'primary-btn';
    }
  },
  
  methods: {
    handleClose() {
      this.$emit('close');
    },
    
    handlePrimaryAction() {
      this.$emit('primary-action');
    },
    
    handleEscKey(event) {
      if (this.closeOnEsc && event.key === 'Escape' && this.show) {
        this.handleClose();
      }
    }
  },
  
  mounted() {
    if (this.closeOnEsc) {
      document.addEventListener('keydown', this.handleEscKey);
    }
  },
  
  unmounted() {
    document.removeEventListener('keydown', this.handleEscKey);
  }
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
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: slideIn 0.3s ease;
  transform-origin: center;
  border: 1px solid rgba(156, 106, 222, 0.2);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
}

.confirmation-modal {
  max-width: 500px;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.standard-header {
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.1), rgba(29, 209, 161, 0.1));
}

.danger-header {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(156, 106, 222, 0.1));
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--lumia-shadow);
}

.standard-icon {
  background: var(--lumia-gradient);
}

.danger-icon {
  background: linear-gradient(45deg, var(--color-error), var(--color-error-dark, #dc2626));
}

.modal-subtitle {
  margin: 0.5rem 0 0 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.standard-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: var(--lumia-gradient);
}

.danger-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: var(--color-error);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary);
  position: relative;
}

.modal-body {
  padding: 2rem;
  background-color: var(--color-bg-primary);
  overflow-y: auto;
  flex: 1;
  max-height: calc(70vh - 180px);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.standard-footer {
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.danger-footer {
  background: rgba(239, 68, 68, 0.05);
}

.secondary-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  position: relative;
  overflow: hidden;
}

.secondary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1));
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.secondary-btn:hover {
  background-color: var(--color-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.secondary-btn:hover::before {
  transform: translateX(100%);
}

.primary-btn {
  background: var(--lumia-gradient);
  border: none;
  color: white;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: var(--lumia-shadow);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2));
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(156, 106, 222, 0.35);
}

.primary-btn:hover::before {
  transform: translateX(100%);
}

.danger-btn {
  background: linear-gradient(45deg, var(--color-error), var(--color-error-dark, #dc2626));
  border: none;
  color: white;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.danger-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2));
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.danger-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.35);
}

.danger-btn:hover::before {
  transform: translateX(100%);
}

.primary-btn:disabled,
.danger-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  animation: spin 1.2s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark mode specific overrides */
[data-theme="dark"] .modal-content {
  background-color: var(--color-bg-primary);
  border-color: rgba(156, 106, 222, 0.4);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .standard-header {
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.2), rgba(29, 209, 161, 0.2));
}

[data-theme="dark"] .danger-header {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(156, 106, 222, 0.2));
}

[data-theme="dark"] .standard-footer {
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.1), rgba(29, 209, 161, 0.1));
}

[data-theme="dark"] .danger-footer {
  background: rgba(239, 68, 68, 0.1);
}

[data-theme="dark"] .secondary-btn {
  border-color: rgba(156, 106, 222, 0.3);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-light);
}

[data-theme="dark"] .secondary-btn:hover {
  background-color: rgba(156, 106, 222, 0.2);
  color: var(--color-primary-light);
}

[data-theme="dark"] .secondary-btn::before {
  background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.05));
}

[data-theme="dark"] .modal-subtitle {
  color: var(--color-text-light);
  opacity: 0.8;
}

[data-theme="dark"] .primary-btn:disabled,
[data-theme="dark"] .danger-btn:disabled {
  background-color: #475569;
  color: #94a3b8;
}
</style> 