<template>
  <div class="confirmation-overlay">
    <div class="confirmation-dialog">
      <p class="message">{{ message }}</p>
      <div class="actions">
        <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
        <button class="confirm-btn" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
import '../styles/ConfirmationDialog.css';

export default {
  name: 'ConfirmationDialog',
  props: {
    message: {
      type: String,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.$emit('cancel');
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
  }
};
</script>

<style scoped>
/* CSS moved to external file */
</style> 