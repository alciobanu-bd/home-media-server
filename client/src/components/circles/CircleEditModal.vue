<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Circle Details</h2>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="circle-name">Name <span class="required">*</span> <span class="max-chars">(Max 50 characters)</span></label>
          <input 
            id="circle-name" 
            v-model="name" 
            type="text" 
            placeholder="Enter circle name"
            :class="{ 'error': nameError || name.length > 50 }"
            @input="validateName"
          >
          <div class="form-feedback">
            <p v-if="nameError" class="error-text">{{ nameError }}</p>
            <p class="char-counter" :class="{ 'warning': name.length > 40, 'error': name.length > 50 }">
              {{ name.length }}/50
            </p>
          </div>
        </div>
        
        <div class="form-group">
          <label for="circle-description">Description <span class="max-chars">(Max 150 characters)</span></label>
          <textarea 
            id="circle-description" 
            v-model="description" 
            rows="5" 
            placeholder="Describe the purpose of this circle"
            :class="{ 'error': descriptionError || description.length > 150 }"
            @input="validateDescription"
          ></textarea>
          <div class="form-feedback">
            <p v-if="descriptionError" class="error-text">{{ descriptionError }}</p>
            <p class="char-counter" :class="{ 'warning': description.length > 130, 'error': description.length > 150 }">
              {{ description.length }}/150
            </p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="primary-btn" 
          @click="updateCircle"
          :disabled="updating || description.length > 150 || !name.trim() || name.length > 50"
        >
          <span v-if="updating">Updating...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../../services/circlesService';

export default {
  name: 'CircleEditModal',
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
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
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

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.max-chars {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--color-text-secondary);
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  resize: vertical;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(156, 106, 222, 0.2);
}

.form-group input.error, .form-group textarea.error {
  border-color: var(--error-color);
}

.form-feedback {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.error-text {
  color: var(--error-color);
  font-size: 0.9rem;
  margin: 0;
}

.char-counter {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.char-counter.warning {
  color: var(--warning-color);
}

.char-counter.error {
  color: var(--error-color);
}

.required {
  color: var(--error-color);
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

.primary-btn {
  background-color: var(--primary-color);
  border: none;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background-color: var(--primary-color-dark);
}

.primary-btn:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}
</style> 