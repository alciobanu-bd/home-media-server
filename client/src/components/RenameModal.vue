<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label :for="inputId">{{ label }}</label>
          <input
            :id="inputId"
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            required
            class="form-control"
            autofocus
          />
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('cancel')">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="!inputValue.trim() || isProcessing">
            <span v-if="isProcessing">{{ processingText }}</span>
            <span v-else>{{ submitText }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RenameModal',
  props: {
    title: {
      type: String,
      default: 'Rename'
    },
    label: {
      type: String,
      default: 'Name'
    },
    placeholder: {
      type: String,
      default: 'Enter name'
    },
    initialValue: {
      type: String,
      default: ''
    },
    isProcessing: {
      type: Boolean,
      default: false
    },
    processingText: {
      type: String,
      default: 'Processing...'
    },
    submitText: {
      type: String,
      default: 'Save'
    },
    inputId: {
      type: String,
      default: 'rename-input'
    }
  },
  emits: ['cancel', 'submit'],
  data() {
    return {
      inputValue: this.initialValue
    };
  },
  created() {
    // Listen for ESC key to close the modal
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.$emit('cancel');
      }
    },
    submit() {
      if (!this.inputValue.trim()) return;
      this.$emit('submit', this.inputValue.trim());
    }
  }
};
</script>

<style scoped>
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: var(--color-card-background);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-border);
}

.modal-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
}

.cancel-btn, .submit-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  text-align: center;
  min-width: calc(50% - 6px); /* Half of container minus half of gap */
  box-sizing: border-box;
}

.cancel-btn {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.cancel-btn:hover {
  background-color: var(--color-hover);
}

.submit-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  font-weight: 600;
}

.submit-btn:hover {
  background-color: var(--color-primary-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 