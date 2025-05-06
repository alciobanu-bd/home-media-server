<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Invite to {{ circleName }}</h2>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="invite-email">Email Address <span class="required">*</span></label>
          <input 
            id="invite-email" 
            v-model="email" 
            type="email" 
            placeholder="Enter email address to invite"
            :class="{ 'error': error }"
          >
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="primary-btn" 
          @click="sendInvitation"
          :disabled="inviting || !email"
        >
          <span v-if="inviting">Sending...</span>
          <span v-else>Send Invitation</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../../services/circlesService';

export default {
  name: 'CircleInviteModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    circleId: {
      type: String,
      required: true
    },
    circleName: {
      type: String,
      required: true
    }
  },
  
  emits: ['close', 'invited'],
  
  data() {
    return {
      email: '',
      error: '',
      inviting: false
    };
  },
  
  methods: {
    async sendInvitation() {
      if (!this.email || !this.email.includes('@')) {
        this.error = 'Please enter a valid email address';
        return;
      }
      
      this.error = '';
      this.inviting = true;
      
      try {
        await circlesService.inviteUser(this.circleId, this.email);
        
        // Reset form
        this.email = '';
        
        // Emit success event
        this.$emit('invited');
        this.$emit('close');
      } catch (error) {
        console.error('Error sending invitation:', error);
        
        // Extract error message from response if available
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Failed to send invitation. Please try again.';
        }
      } finally {
        this.inviting = false;
      }
    }
  },
  
  watch: {
    show(newValue) {
      if (newValue) {
        this.email = '';
        this.error = '';
      }
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
  max-width: 500px;
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

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(156, 106, 222, 0.2);
}

.form-group input.error {
  border-color: var(--error-color);
}

.error-text {
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
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