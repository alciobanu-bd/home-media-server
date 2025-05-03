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

    <!-- Pending Invitations Section -->
    <div class="invitations-section" v-if="!loadingInvitations && invitations.length > 0">
      <div class="section-header">
        <h2>
          <i class="fas fa-envelope"></i>
          Pending Invitations
          <span class="badge">{{ invitations.length }}</span>
        </h2>
      </div>
      
      <div v-if="loadingInvitations" class="loading-invitations">
        <div class="loading-spinner small"></div>
        <p>Loading invitations...</p>
      </div>
      
      <div class="invitations-list">
        <div 
          v-for="invitation in invitations" 
          :key="invitation.token" 
          class="invitation-card"
        >
          <div class="invitation-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="invitation-content">
            <h3>{{ invitation.circleName }}</h3>
            <p class="invitation-date">Invited on {{ formatDate(invitation.invitedAt) }}</p>
          </div>
          <div class="invitation-actions">
            <button 
              class="accept-btn" 
              @click.stop="acceptInvitation(invitation.token)"
              :disabled="processingInvitation === invitation.token"
            >
              <span v-if="processingInvitation === invitation.token">
                <i class="fas fa-spinner fa-spin"></i> Accepting...
              </span>
              <span v-else>
                <i class="fas fa-check"></i> Accept
              </span>
            </button>
            <button 
              class="decline-btn" 
              @click.stop="showDeclineConfirmation(invitation)"
              :disabled="processingInvitation === invitation.token"
            >
              <i class="fas fa-times"></i> Decline
            </button>
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
            <label for="circle-description">Description (Optional) <span class="max-chars">(Max 150 characters)</span></label>
            <textarea 
              id="circle-description" 
              v-model="newCircle.description" 
              rows="3" 
              placeholder="Describe the purpose of this Circle"
              :class="{ 'error': validationErrors.description }"
              @input="validateDescription"
            ></textarea>
            <div class="form-feedback">
              <p v-if="validationErrors.description" class="error-text">{{ validationErrors.description }}</p>
              <p class="char-counter" :class="{ 'warning': newCircle.description.length > 130, 'error': newCircle.description.length > 150 }">
                {{ newCircle.description.length }}/150
              </p>
            </div>
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

    <!-- Decline Invitation Confirmation Modal -->
    <div v-if="showDeclineModal" class="modal-overlay" @click.self="closeDeclineModal">
      <div class="modal-content decline-modal">
        <div class="modal-header">
          <h2>Decline Invitation</h2>
          <button class="close-btn" @click="closeDeclineModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to decline the invitation to join <strong>{{ selectedInvitation.circleName }}</strong>?</p>
          <p class="warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="closeDeclineModal">Cancel</button>
          <button 
            class="danger-btn" 
            @click="declineInvitation"
            :disabled="processingDecline"
          >
            <span v-if="processingDecline">Declining...</span>
            <span v-else>Decline Invitation</span>
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
      invitations: [],
      loading: true,
      loadingInvitations: false,
      error: null,
      showCreateModal: false,
      showDeclineModal: false,
      creating: false,
      processingInvitation: null,
      processingDecline: false,
      selectedInvitation: null,
      newCircle: {
        name: '',
        description: ''
      },
      validationErrors: {
        name: '',
        description: ''
      }
    };
  },
  async created() {
    try {
      await this.loadCircles();
      await this.loadInvitations();
    } catch (error) {
      this.error = 'Failed to load data. Please try again later.';
      console.error('Error loading data:', error);
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
    },
    showDeclineModal(newValue) {
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
    async loadInvitations() {
      this.loadingInvitations = true;
      try {
        const response = await circlesService.getUserInvitations();
        this.invitations = response.invitations || [];
      } catch (error) {
        console.error('Error loading invitations:', error);
      } finally {
        this.loadingInvitations = false;
      }
    },
    navigateToCircle(id) {
      this.$router.push(`/circles/${id}`);
    },
    handleEscKey(event) {
      // Close modal when ESC key is pressed
      if (event.key === 'Escape') {
        if (this.showCreateModal) {
          this.showCreateModal = false;
        }
        if (this.showDeclineModal) {
          this.closeDeclineModal();
        }
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
      this.validationErrors = { name: '', description: '' };
      
      if (!this.newCircle.name || this.newCircle.name.trim() === '') {
        this.validationErrors.name = 'Circle name is required';
        isValid = false;
      }
      
      if (this.newCircle.description.length > 150) {
        this.validationErrors.description = 'Description exceeds 150 characters';
        isValid = false;
      }
      
      return isValid;
    },
    validateDescription() {
      if (this.newCircle.description.length > 150) {
        this.validationErrors.description = 'Description exceeds 150 characters';
      } else {
        this.validationErrors.description = '';
      }
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
    },
    async acceptInvitation(token) {
      this.processingInvitation = token;
      try {
        await circlesService.acceptInvitation(token);
        // Remove the invitation from the list
        this.invitations = this.invitations.filter(inv => inv.token !== token);
        // Reload circles to show the newly joined circle
        await this.loadCircles();
        // Show success message
        alert('You have successfully joined the circle');
      } catch (error) {
        console.error('Error accepting invitation:', error);
        alert('Failed to accept invitation. Please try again.');
      } finally {
        this.processingInvitation = null;
      }
    },
    showDeclineConfirmation(invitation) {
      this.selectedInvitation = invitation;
      this.showDeclineModal = true;
    },
    closeDeclineModal() {
      this.showDeclineModal = false;
      this.selectedInvitation = null;
      this.processingDecline = false;
    },
    async declineInvitation() {
      if (!this.selectedInvitation) return;
      
      this.processingDecline = true;
      try {
        await circlesService.declineInvitation(this.selectedInvitation.token);
        
        // Remove the invitation from the list
        this.invitations = this.invitations.filter(inv => inv.token !== this.selectedInvitation.token);
        
        // Show success message
        alert('You have declined the circle invitation');
        
        // Close the modal
        this.closeDeclineModal();
      } catch (error) {
        console.error('Error declining invitation:', error);
        alert('Failed to decline invitation. Please try again.');
        this.processingDecline = false;
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
  max-width: 1280px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.create-album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(156, 106, 222, 0.25);
  border-radius: 50%;
  border-top-color: #9c6ade;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px dashed rgba(156, 106, 222, 0.5);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: rgba(156, 106, 222, 0.5);
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: var(--color-text-secondary);
}

.circles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.circle-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.circle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.circle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.1), rgba(29, 209, 161, 0.1));
  color: #9c6ade;
  font-size: 1.75rem;
  position: relative;
}

.admin-circle {
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.2), rgba(29, 209, 161, 0.2));
  color: #9c6ade;
}

.admin-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background-color: #9c6ade;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 2px solid var(--color-bg-secondary);
}

.circle-info {
  flex: 1;
}

.circle-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.circle-info p {
  margin: 0 0 0.75rem 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.no-description {
  font-style: italic;
  opacity: 0.6;
}

.circle-meta {
  display: flex;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.circle-meta span {
  display: flex;
  align-items: center;
}

.circle-meta i {
  margin-right: 0.35rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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

.max-chars {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--color-text-secondary);
  opacity: 0.8;
  margin-left: 0.5rem;
}

.form-feedback {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-counter {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: right;
}

.char-counter.warning {
  color: #f59e0b;
}

.char-counter.error {
  color: #ef4444;
}

/* Invitation styles */
.invitations-section {
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  margin: 0;
}

.section-header h2 i {
  margin-right: 0.75rem;
  color: #9c6ade;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0.25rem 0.5rem;
  margin-left: 0.75rem;
  background-color: #9c6ade;
  color: white;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.invitations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.invitation-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.invitation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.invitation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #9c6ade, #1dd1a1);
  color: white;
  font-size: 1.25rem;
}

.invitation-content {
  flex: 1;
}

.invitation-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
}

.invitation-date {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.invitation-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn, .decline-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.accept-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
}

.accept-btn:hover {
  box-shadow: 0 2px 8px rgba(156, 106, 222, 0.4);
}

.decline-btn {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.decline-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.accept-btn i, .decline-btn i {
  margin-right: 0.35rem;
}

.accept-btn:disabled, .decline-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.decline-modal {
  max-width: 450px;
}

.warning-text {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 6px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.warning-text i {
  margin-right: 0.5rem;
}

.danger-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.danger-btn:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.danger-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  
  .invitation-card {
    background-color: var(--color-bg-primary);
  }
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .invitations-list {
    grid-template-columns: 1fr;
  }
  
  .invitation-actions {
    flex-direction: column;
  }
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
  margin-right: 1rem;
  margin-bottom: 0;
}

.loading-invitations {
  display: flex;
  align-items: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.empty-invitations {
  padding: 1.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
}
</style> 