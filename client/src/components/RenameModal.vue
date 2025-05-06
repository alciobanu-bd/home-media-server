<template>
  <BaseModal
    :show="show"
    :title="title"
    :primary-disabled="!inputValue.trim() || isProcessing"
    :loading="isProcessing"
    @close="$emit('cancel')"
    @primary-action="submit"
  >
    <template #primary-text>{{ submitText }}</template>
    <template #loading-text>{{ processingText }}</template>
    <template #icon-path>
      <path d="M17 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H7"></path>
      <path d="M10 11L12 13L18 7"></path>
      <path d="M15 3v4h4"></path>
      <path d="M12 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"></path>
    </template>
    
    <div class="form-group">
      <label :for="inputId">{{ label }}</label>
      <div class="input-wrapper">
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
    </div>
  </BaseModal>
</template>

<script>
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'RenameModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
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
  watch: {
    initialValue(newValue) {
      this.inputValue = newValue;
    },
    show(newValue) {
      if (newValue) {
        // Reset the input value when modal is shown
        this.inputValue = this.initialValue;
      }
    }
  },
  methods: {
    submit() {
      if (!this.inputValue.trim()) return;
      this.$emit('submit', this.inputValue.trim());
    }
  }
};
</script>

<style scoped>
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

.input-wrapper {
  position: relative;
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

/* Dark mode overrides */
[data-theme="dark"] .form-group label {
  color: var(--color-text-light);
}

[data-theme="dark"] .form-control {
  background-color: var(--color-bg-secondary);
  border-color: rgba(156, 106, 222, 0.3);
  color: var(--color-text-primary);
}

[data-theme="dark"] .form-control:focus {
  box-shadow: 0 0 0 3px rgba(156, 106, 222, 0.3);
}
</style> 