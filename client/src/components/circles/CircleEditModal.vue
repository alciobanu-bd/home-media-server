<template>
  <BaseModal 
    :show="show"
    title="Edit Circle Details"
    subtitle="Update information for this circle"
    :loading="updating"
    :primary-disabled="updating || description.length > 150 || !name.trim() || name.length > 50"
    @close="$emit('close')"
    @primary-action="updateCircle"
  >
    <template #icon-path>
      <circle cx="12" cy="8" r="7"/>
      <path d="M12 15a7 7 0 0 0-7 7M12 15a7 7 0 0 1 7 7"/>
    </template>
    
    <template #primary-text>Save Changes</template>
    <template #loading-text>Updating...</template>
    
    <div class="form-group">
      <label for="circle-name">Circle Name <span class="required">*</span> <span class="max-chars">(Max 50 characters)</span></label>
      <div class="input-wrapper">
        <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="7"/>
          <path d="M12 15a7 7 0 0 0-7 7M12 15a7 7 0 0 1 7 7"/>
        </svg>
        <input 
          id="circle-name" 
          v-model="name" 
          type="text" 
          placeholder="Enter circle name"
          :class="{ 'error': nameError || name.length > 50 }"
          @input="validateName"
        >
      </div>
      <div class="form-feedback">
        <p v-if="nameError" class="error-text">{{ nameError }}</p>
        <p class="char-counter" :class="{ 'warning': name.length > 40, 'error': name.length > 50 }">
          {{ name.length }}/50
        </p>
      </div>
    </div>
    
    <div class="form-group">
      <label for="circle-description">Circle Description <span class="max-chars">(Max 150 characters)</span></label>
      <div class="input-wrapper textarea-wrapper">
        <svg class="input-icon textarea-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="21" y1="6" x2="3" y2="6"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
          <line x1="17" y1="18" x2="3" y2="18"/>
        </svg>
        <textarea 
          id="circle-description" 
          v-model="description" 
          rows="5" 
          placeholder="Describe the purpose of this circle"
          :class="{ 'error': descriptionError || description.length > 150 }"
          @input="validateDescription"
        ></textarea>
      </div>
      <div class="form-feedback">
        <p v-if="descriptionError" class="error-text">{{ descriptionError }}</p>
        <p class="char-counter" :class="{ 'warning': description.length > 130, 'error': description.length > 150 }">
          {{ description.length }}/150
        </p>
      </div>
    </div>
  </BaseModal>
</template>

<script>
import circlesService from '../../services/circlesService';
import BaseModal from '../ui/BaseModal.vue';

export default {
  name: 'CircleEditModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    circleId: {
      type: String,
      required: true
    },
    initialName: {
      type: String,
      default: ''
    },
    initialDescription: {
      type: String,
      default: ''
    }
  },
  
  emits: ['close', 'updated'],
  
  data() {
    return {
      name: this.initialName,
      description: this.initialDescription,
      nameError: '',
      descriptionError: '',
      updating: false
    };
  },
  
  methods: {
    validateName() {
      if (!this.name.trim()) {
        this.nameError = 'Circle name is required';
      } else if (this.name.length > 50) {
        this.nameError = 'Name must be 50 characters or less';
      } else {
        this.nameError = '';
      }
    },
    
    validateDescription() {
      if (this.description.length > 150) {
        this.descriptionError = 'Description must be 150 characters or less';
      } else {
        this.descriptionError = '';
      }
    },
    
    async updateCircle() {
      // Validate inputs
      if (!this.name.trim()) {
        this.nameError = 'Circle name is required';
        return;
      }
      
      if (this.name.length > 50) {
        this.nameError = 'Name must be 50 characters or less';
        return;
      }
      
      if (this.description.length > 150) {
        this.descriptionError = 'Description must be 150 characters or less';
        return;
      }
      
      try {
        this.updating = true;
        
        await circlesService.updateCircle(this.circleId, {
          name: this.name.trim(),
          description: this.description.trim()
        });
        
        // Emit updated event with new data
        this.$emit('updated', {
          name: this.name.trim(),
          description: this.description.trim()
        });
        
        // Close modal
        this.$emit('close');
      } catch (error) {
        console.error('Error updating circle details:', error);
        // Check for specific error messages from API
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('Failed to update circle details. Please try again.');
        }
      } finally {
        this.updating = false;
      }
    }
  },
  
  watch: {
    show(newValue) {
      if (newValue) {
        // Reset form with initial values when modal is shown
        this.name = this.initialName;
        this.description = this.initialDescription;
        this.nameError = '';
        this.descriptionError = '';
      }
    },
    initialName(newValue) {
      this.name = newValue;
    },
    initialDescription(newValue) {
      this.description = newValue;
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.75rem; /* Slightly more space for edit forms */
}

.form-group:last-of-type {
  margin-bottom: 1rem; /* Less space for the last group before modal actions */
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.required {
  color: var(--color-error, #ef4444);
  margin-left: 2px;
}

.max-chars {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  opacity: 0.9;
  margin-left: 0.3rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  opacity: 0.7;
  pointer-events: none; /* Ensure icon doesn't interfere with input focus */
}

.textarea-wrapper .textarea-icon {
  top: 0.9rem; /* Align with first line of text */
  transform: none;
}

.input-wrapper input[type="text"],
.input-wrapper textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  padding-left: 2.75rem; /* Space for the icon */
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.input-wrapper textarea {
  padding-top: 0.8rem; /* Consistent padding for textarea */
  resize: vertical;
  min-height: 80px; /* Minimum height for textarea */
}

.input-wrapper input[type="text"]:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: var(--lumia-primary, #9c6ade);
  box-shadow: 0 0 0 3px rgba(156, 106, 222, 0.25);
}

.input-wrapper input[type="text"].error,
.input-wrapper textarea.error {
  border-color: var(--color-error, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.form-feedback {
  display: flex;
  justify-content: space-between;
  align-items: baseline; /* Align baseline for cleaner look */
  margin-top: 0.5rem; /* Standard spacing */
  min-height: 1.2em; /* Prevent layout jump when error appears */
}

.error-text {
  color: var(--color-error, #ef4444);
  font-size: 0.85rem;
  margin: 0;
}

.char-counter {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 2px 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.char-counter.warning {
  color: var(--color-warning-text, #854d0e); /* Darker warning text for better contrast on light bg */
  background-color: var(--color-warning-bg, #fef3c7);
}

.char-counter.error {
  color: var(--color-error-text-light, white); /* Ensure contrast on error bg */
  background-color: var(--color-error, #ef4444);
}

/* Dark theme adjustments - ensure they align with global vars */
[data-theme="dark"] .form-group label {
  color: var(--color-text-light, #f0f0f0);
}

[data-theme="dark"] .max-chars {
  color: var(--color-text-secondary-dark, #a0aec0);
}

[data-theme="dark"] .input-wrapper input[type="text"],
[data-theme="dark"] .input-wrapper textarea {
  background-color: var(--color-bg-primary-dark, #2d3748);
  border-color: var(--color-border-dark, #4a5568);
  color: var(--color-text-primary-dark, #e2e8f0);
}

[data-theme="dark"] .input-wrapper input[type="text"]:focus,
[data-theme="dark"] .input-wrapper textarea:focus {
  border-color: var(--lumia-primary-dark, #a881e3);
  box-shadow: 0 0 0 3px rgba(168, 129, 227, 0.3);
}

[data-theme="dark"] .char-counter {
  background-color: var(--color-bg-tertiary-dark, #4a5568);
  color: var(--color-text-secondary-dark, #a0aec0);
}

[data-theme="dark"] .char-counter.warning {
  color: var(--color-warning-text-dark, #fde68a);
  background-color: var(--color-warning-bg-dark, #78350f); /* Darker bg for warning */
}

[data-theme="dark"] .char-counter.error {
  color: var(--color-error-text-light, white);
  background-color: var(--color-error-dark, #c53030);
}

[data-theme="dark"] .input-icon {
  color: var(--color-text-secondary-dark, #a0aec0);
}
</style> 