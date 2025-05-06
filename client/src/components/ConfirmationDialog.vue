<template>
  <BaseModal
    :show="show"
    title="Confirm Action"
    :is-danger="true"
    :is-confirmation="true"
    @close="$emit('cancel')"
    @primary-action="$emit('confirm')"
  >
    <template #icon-path>
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </template>
    
    <template #primary-text>Confirm</template>
    
    <p>{{ message }}</p>
  </BaseModal>
</template>

<script>
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'ConfirmationDialog',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    }
  },
  emits: ['confirm', 'cancel']
};
</script>

<style scoped>
/* Styling handled by BaseModal */
</style> 