<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      <p>Please sign in to access Lumia</p>
      
      <div v-if="authStore.state.error" class="error-message">
        {{ authStore.state.error }}
      </div>
      
      <button 
        class="google-btn" 
        @click="loginWithGoogle" 
        :disabled="authStore.state.isLoading"
      >
        <img src="/google-icon.svg" alt="Google" class="google-icon" />
        Sign in with Google
      </button>
    </div>
  </div>
</template>

<script>
import authStore from '../store/authStore';

export default {
  name: 'LoginView',
  setup() {
    const loginWithGoogle = () => {
      authStore.loginWithGoogle();
    };

    return {
      authStore,
      loginWithGoogle
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
}

.login-card {
  background-color: var(--color-card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.google-btn:hover {
  background-color: #f1f1f1;
}

.google-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style> 