<template>
  <BaseModal 
    :show="show"
    :title="`Invite to ${circleName}`"
    :subtitle="'Add new members to this circle'"
    :loading="sending"
    :primary-disabled="sending || !email"
    @close="$emit('close')"
    @primary-action="sendInvitation"
  >
    <template #icon-path>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </template>
    
    <template #primary-text>Send Invitation</template>
    <template #loading-text>Sending...</template>
    
    <div class="form-group">
      <label for="invite-email">Email Address <span class="required">*</span></label>
      <div class="input-wrapper">
        <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <input 
          id="invite-email" 
          v-model="email" 
          type="email" 
          placeholder="Enter email address to invite"
          :class="{ 'error': error }"
        >
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </BaseModal>
</template>

<script>
import circlesService from '../../services/circlesService';
import BaseModal from '../ui/BaseModal.vue';

export default {
  name: 'CircleInviteModal',
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
      sending: false
    };
  },
  
  methods: {
    async sendInvitation() {
      if (!this.email || !this.email.includes('@')) {
        this.error = 'Please enter a valid email address';
        return;
      }
      
      this.error = '';
      this.sending = true;
      
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
        this.sending = false;
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
.form-group {
  margin-bottom: 1.5rem;
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
}

.form-group input[type="email"] {
  width: 100%;
  padding: 0.8rem 1rem;
  padding-left: 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-group input[type="email"]:focus {
  outline: none;
  border-color: var(--lumia-primary, #9c6ade);
  box-shadow: 0 0 0 3px rgba(156, 106, 222, 0.25);
}

.form-group input[type="email"].error {
  border-color: var(--color-error, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-text {
  color: var(--color-error, #ef4444);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* Dark mode specific overrides */
[data-theme="dark"] .form-group label {
  color: var(--color-text-light, #f0f0f0);
}

[data-theme="dark"] .form-group input[type="email"] {
  background-color: var(--color-bg-primary-dark, #2d3748);
  border-color: var(--color-border-dark, #4a5568);
  color: var(--color-text-primary-dark, #e2e8f0);
}

[data-theme="dark"] .form-group input[type="email"]:focus {
  border-color: var(--lumia-primary-dark, #a881e3);
  box-shadow: 0 0 0 3px rgba(168, 129, 227, 0.3);
}

[data-theme="dark"] .form-group input[type="email"].error {
  border-color: var(--color-error-dark, #f56565);
}

[data-theme="dark"] .input-icon {
  color: var(--color-text-secondary-dark, #a0aec0);
}
</style> 