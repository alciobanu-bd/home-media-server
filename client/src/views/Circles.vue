<template>
  <div class="circles-container">
    <div class="circles-header">
      <h1>Your Trusted Circles</h1>
      <button class="create-album-btn" @click="showCreateModal = true">
        <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Create Circle
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your circles...</p>
    </div>
    
    <div v-else-if="circles.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-users-slash"></i>
      </div>
      <h3>No Circles Found</h3>
      <p>You haven't created or joined any Trusted Circles yet.</p>
      <button class="primary-btn" @click="showCreateModal = true">
        Create Your First Circle
      </button>
    </div>
    
    <div v-else class="circles-grid">
      <div 
        v-for="circle in circles" 
        :key="circle.id" 
        class="circle-card"
        @click="navigateToCircle(circle.id)"
      >
        <div class="circle-icon" :class="{ 'admin-circle': circle.isAdmin }">
          <i class="fas fa-users"></i>
          <span v-if="circle.isAdmin" class="admin-badge">
            <i class="fas fa-crown"></i>
          </span>
        </div>
        <div class="circle-info">
          <h3>{{ circle.name }}</h3>
          <p v-if="circle.description">{{ circle.description }}</p>
          <p v-else class="no-description">No description</p>
          <div class="circle-meta">
            <span><i class="fas fa-user-friends"></i> {{ circle.memberCount }} members</span>
            <span><i class="fas fa-calendar-alt"></i> {{ formatDate(circle.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Circle Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Trusted Circle</h2>
          <button class="close-btn" @click="showCreateModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="circle-name">Circle Name <span class="required">*</span></label>
            <input 
              id="circle-name" 
              v-model="newCircle.name" 
              type="text" 
              placeholder="Enter a name for your Circle"
              :class="{ 'error': validationErrors.name }"
            >
            <p v-if="validationErrors.name" class="error-text">{{ validationErrors.name }}</p>
          </div>
          
          <div class="form-group">
            <label for="circle-description">Description (Optional)</label>
            <textarea 
              id="circle-description" 
              v-model="newCircle.description" 
              rows="3" 
              placeholder="Describe the purpose of this Circle"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="showCreateModal = false">Cancel</button>
          <button 
            class="primary-btn" 
            @click="createNewCircle"
            :disabled="creating"
          >
            <span v-if="creating">Creating...</span>
            <span v-else>Create Circle</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../services/circlesService';
import { format } from 'date-fns';

export default {
  name: 'Circles',
  data() {
    return {
      circles: [],
      loading: true,
      error: null,
      showCreateModal: false,
      creating: false,
      newCircle: {
        name: '',
        description: ''
      },
      validationErrors: {
        name: ''
      }
    };
  },
  async created() {
    try {
      await this.loadCircles();
    } catch (error) {
      this.error = 'Failed to load circles. Please try again later.';
      console.error('Error loading circles:', error);
    } finally {
      this.loading = false;
    }
  },
  watch: {
    showCreateModal(newValue) {
      if (newValue) {
        // Add event listener when modal is opened
        document.addEventListener('keydown', this.handleEscKey);
      } else {
        // Remove event listener when modal is closed
        document.removeEventListener('keydown', this.handleEscKey);
      }
    }
  },
  beforeUnmount() {
    // Clean up event listener if component is unmounted while modal is open
    document.removeEventListener('keydown', this.handleEscKey);
  },
  methods: {
    async loadCircles() {
      const response = await circlesService.getUserCircles();
      this.circles = response.circles || [];
    },
    navigateToCircle(id) {
      this.$router.push(`/circles/${id}`);
    },
    handleEscKey(event) {
      // Close modal when ESC key is pressed
      if (event.key === 'Escape' && this.showCreateModal) {
        this.showCreateModal = false;
      }
    },
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return format(date, 'MMM d, yyyy');
      } catch (error) {
        return 'Unknown date';
      }
    },
    validateCircleForm() {
      let isValid = true;
      this.validationErrors = { name: '' };
      
      if (!this.newCircle.name || this.newCircle.name.trim() === '') {
        this.validationErrors.name = 'Circle name is required';
        isValid = false;
      }
      
      return isValid;
    },
    async createNewCircle() {
      if (!this.validateCircleForm()) {
        return;
      }
      
      try {
        this.creating = true;
        
        await circlesService.createCircle({
          name: this.newCircle.name.trim(),
          description: this.newCircle.description.trim()
        });
        
        // Reset form
        this.newCircle = { name: '', description: '' };
        this.showCreateModal = false;
        
        // Reload circles
        await this.loadCircles();
        
      } catch (error) {
        console.error('Error creating circle:', error);
        alert('Failed to create circle. Please try again.');
      } finally {
        this.creating = false;
      }
    }
  }
};
</script>

<style scoped>
:root {
  --lumia-primary: #9c6ade; /* Purple */
  --lumia-accent: #1dd1a1; /* Green */
}

.circles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.circles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.circles-header h1 {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.create-album-btn {
  background: var(--lumia-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: var(--lumia-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 10px 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-album-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.create-album-btn:hover:before {
  opacity: 1;
}

.create-album-btn .btn-icon {
  stroke: currentColor;
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.create-album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.create-album-btn:hover .btn-icon {
  transform: translateY(-2px);
}

/* Dark mode enhancements for create-album-btn */
@media (prefers-color-scheme: dark) {
  .create-album-btn {
    box-shadow: 0 4px 15px rgba(156, 106, 222, 0.4);
  }
  
  .create-album-btn:hover {
    box-shadow: 0 6px 20px rgba(156, 106, 222, 0.5);
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  border: 3px solid rgba(156, 106, 222, 0.1);
  border-radius: 50%;
  border-top: 3px solid #9c6ade;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 2rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 12px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #9c6ade;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  max-width: 400px;
}

.circles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.circle-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid var(--color-border);
}

.circle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(156, 106, 222, 0.15);
  border-color: rgba(156, 106, 222, 0.3);
}

.circle-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  position: relative;
  margin-right: 1.5rem;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.1), rgba(29, 209, 161, 0.1));
  color: #9c6ade;
}

.admin-circle {
  background: linear-gradient(135deg, #9c6ade, #1dd1a1);
  color: white;
}

.admin-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: #feca57;
  color: white;
  width: 22px;
  height: 22px;
  font-size: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.circle-info {
  flex: 1;
  min-width: 0;
}

.circle-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.circle-info p {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.no-description {
  color: var(--color-text-secondary);
  opacity: 0.75;
  font-style: italic;
}

.circle-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.circle-meta i {
  margin-right: 0.25rem;
  color: #9c6ade;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: rgba(156, 106, 222, 0.1);
  color: #9c6ade;
}

.modal-body {
  padding: 1.5rem;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
  gap: 1rem;
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required {
  color: #ef4444;
}

input, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: inherit;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #9c6ade;
  box-shadow: 0 0 0 3px rgba(156, 106, 222, 0.2);
}

input.error, textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.primary-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-btn {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.secondary-btn:hover {
  background: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
  color: #9c6ade;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .circle-card {
    background-color: var(--color-bg-primary);
    border-color: rgba(156, 106, 222, 0.2);
  }
  
  .circle-icon {
    background: linear-gradient(135deg, rgba(156, 106, 222, 0.2), rgba(29, 209, 161, 0.2));
  }
  
  .empty-state {
    background-color: rgba(156, 106, 222, 0.05);
  }
  
  input, textarea {
    background-color: var(--color-bg-primary);
    border-color: rgba(156, 106, 222, 0.3);
  }
  
  .secondary-btn {
    border-color: rgba(156, 106, 222, 0.3);
  }
}
</style> 