<template>
  <BaseModal 
    :show="show"
    :title="title"
    :is-danger="true"
    :is-confirmation="true"
    :loading="processing"
    @close="$emit('close')"
    @primary-action="$emit('confirm')"
  >
    <template #icon-path>
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </template>
    
    <template #primary-text>{{ buttonText }}</template>
    <template #loading-text>Processing...</template>
    
    <p>{{ message }}</p>
  </BaseModal>
</template>

<script>
import BaseModal from '../ui/BaseModal.vue';

export default {
  name: 'CircleConfirmModal',
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