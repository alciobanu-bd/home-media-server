<template>
  <div class="auth-guard">
    <div v-if="authStore.state.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
    <div v-else-if="!authStore.state.isAuthenticated" class="not-authenticated">
      <h2>Authentication Required</h2>
      <p>Please log in to view this page</p>
      <button @click="authStore.loginWithGoogle" class="login-btn">Sign in with Google</button>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import authStore from '../store/authStore';

export default {
  name: 'AuthGuard',
  setup() {
    onMounted(async () => {
      await authStore.checkAuth();
    });

    return {
      authStore
    };
  }
};
</script>

<style scoped>
.auth-guard {
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: var(--color-text-secondary);
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.not-authenticated {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  padding: 1rem;
}

.login-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.login-btn:hover {
  opacity: 0.8;
}
</style> 