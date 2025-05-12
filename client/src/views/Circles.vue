<template>
  <div class="circles-container">
    <div class="circles-header">
      <div>
      <h1>Your Trusted Circles</h1>
        <p class="circles-description">Create and manage shared spaces for your friends, family, or teams.</p>
      </div>
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
      <div class="empty-icon-container">
        <!-- Replace with a relevant SVG, similar to albums-empty.svg -->
        <svg class="empty-icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M32,10A12,12,0,1,0,44,22,12,12,0,0,0,32,10Zm0,20a8,8,0,1,1,8-8A8,8,0,0,1,32,30Z"/>
          <path d="M51,34H49A15,15,0,0,0,34,19V17a15,15,0,0,0-2-7.82,12,12,0,0,0-19.42,12.4A10,10,0,0,0,11,42H21a1,1,0,0,0,0-2H11a8,8,0,0,1-.12-16,1,1,0,0,0,.75-.92,10,10,0,0,1,18.74-4.12A1,1,0,0,0,31,19.05v2a1,1,0,0,0,.5.86A13,13,0,0,1,49,32h2a1,1,0,0,0,0-2Z"/>
          <path d="M23,34H21A15,15,0,0,0,6,49v2a15,15,0,0,0,13.18,14.9A12,12,0,0,0,42.6,53.58,10,10,0,0,0,53,44V42H43a1,1,0,0,0,0,2h10v2a8,8,0,0,1-16,.12,1,1,0,0,0-.92-.75,10,10,0,0,1-4.12-18.74A1,1,0,0,0,30.95,21H29a1,1,0,0,0-.86-.5A13,13,0,0,1,17,32v2A13,13,0,0,1,30,47V45a1,1,0,0,0-2,0v2A11,11,0,0,1,8,36a13,13,0,0,1,13-13h2a1,1,0,0,0,0-2Z"/>
        </svg>
      </div>
      <h3>No Circles Found</h3>
      <p>You haven't created or joined any Trusted Circles yet.</p>
      <button class="create-album-btn" @click="showCreateModal = true">
         <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
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
        <div class="circle-card-icon-wrapper">
          <svg class="circle-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span v-if="circle.isAdmin" class="admin-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2L9.16 8.65L2 9.24L7.29 14.1L5.82 21L12 17.31L18.18 21L16.71 14.1L22 9.24L14.84 8.65L12 2Z"></path>            
            </svg>
          </span>
        </div>
        <div class="circle-info">
          <h3>{{ circle.name }}</h3>
          <p v-if="circle.description" class="circle-description-text">{{ circle.description }}</p>
          <p v-else class="no-description">No description</p>
          <div class="circle-meta">
            <span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg> 
              {{ circle.memberCount }} members
            </span>
            <span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ formatDate(circle.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Invitations Section -->
    <div class="invitations-section" v-if="!loadingInvitations && invitations.length > 0">
      <div class="section-header">
        <h2>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.75rem;">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
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
          <div class="invitation-card-icon-wrapper">
            <svg class="invitation-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div class="invitation-content">
            <h3>{{ invitation.circleName }}</h3>
            <p class="invitation-date">Invited on {{ formatDate(invitation.invitedAt) }}</p>
          </div>
          <div class="invitation-actions">
            <button 
              class="btn btn-primary btn-sm accept-btn" 
              @click.stop="acceptInvitation(invitation.token)"
              :disabled="processingInvitation === invitation.token"
            >
              <span v-if="processingInvitation === invitation.token">
                <svg class="spinner-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"> <circle cx="12" cy="12" r="10" stroke-dasharray="25 100" /> </svg> Accepting...
              </span>
              <span v-else>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="20 6 9 17 4 12"></polyline> </svg> Accept
              </span>
            </button>
            <button 
              class="btn btn-secondary btn-sm decline-btn" 
              @click.stop="showDeclineConfirmation(invitation)"
              :disabled="processingInvitation === invitation.token"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> Decline
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Circle Modal -->
    <BaseModal
      :show="showCreateModal"
      title="Create Trusted Circle"
      :primary-disabled="!newCircle.name.trim() || creating"
      :loading="creating"
      @close="showCreateModal = false"
      @primary-action="createNewCircle"
    >
      <template #icon-path>
        <circle cx="12" cy="12" r="9"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M6.5 18.2c1.2-1.5 3.3-2.5 5.5-2.5s4.3 1 5.5 2.5"></path>
      </template>
      
      <template #primary-text>Create Circle</template>
      <template #loading-text>Creating...</template>
      
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
    </BaseModal>

    <!-- Decline Invitation Confirmation Modal -->
    <ConfirmationDialog
      :show="showDeclineModal"
      :message="`Are you sure you want to decline the invitation to join ${selectedInvitation ? selectedInvitation.circleName : ''}?`"
      @confirm="declineInvitation"
      @cancel="closeDeclineModal"
    />
  </div>
</template>

<script>
import circlesService from '../services/circlesService';
import { format } from 'date-fns';
import BaseModal from '../components/ui/BaseModal.vue';
import ConfirmationDialog from '../components/ConfirmationDialog.vue';

export default {
  name: 'Circles',
  components: {
    BaseModal,
    ConfirmationDialog
  },
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
/* General Page Styles */
.circles-container {
  padding: 24px;
  background-color: var(--color-background);
  min-height: calc(100vh - var(--header-height)); /* Assuming var(--header-height) is defined globally */
  box-sizing: border-box;
  max-width: 1280px; /* Retain max-width for centered content */
  margin: 0 auto; /* Center the container */
}

.circles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px; /* Increased margin */
  padding: 0 16px; /* Consistent with albums */
}

.circles-header h1 {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 4px;
}

.circles-description {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Create Button (reusing .create-album-btn from Albums.vue) */
.create-album-btn {
  background: var(--lumia-gradient, linear-gradient(45deg, #9c6ade, #1dd1a1));
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: var(--lumia-shadow, 0 4px 12px rgba(156, 106, 222, 0.25));
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 10px 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 18px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border-light, rgba(156, 106, 222, 0.25));
  border-radius: 50%;
  border-top-color: var(--lumia-primary, #9c6ade);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px dashed var(--color-border-dashed, rgba(156, 106, 222, 0.5));
  margin: 32px 16px;
}

.empty-icon-container {
  margin-bottom: 24px;
}

.empty-icon-svg {
  width: 100px;
  height: 100px;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

/* Circles Grid */
.circles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Slightly larger min-width */
  gap: 24px; /* Consistent gap */
  padding: 0 16px; /* Consistent with albums */
}

.circle-card {
  background-color: var(--color-card-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column; /* Changed to column for better icon placement */
  padding: 20px;
}

.circle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--lumia-primary, #9c6ade);
}

.circle-card-icon-wrapper {
  display: flex;
  align-items: center; /* Center admin badge vertically if needed */
  justify-content: space-between; /* Pushes admin badge to the right */
  margin-bottom: 16px;
  color: var(--lumia-primary, #9c6ade);
}

.circle-card-icon {
  width: 40px; /* Larger icon */
  height: 40px;
}

.admin-badge {
  background-color: var(--lumia-primary, #9c6ade);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px; /* For inner SVG */
}

.admin-badge svg {
  width: 14px;
  height: 14px;
}

.circle-info h3 {
  font-size: 1.15rem; /* Slightly adjusted */
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.circle-description-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.7rem; /* Approx 2 lines height */
}

.no-description {
  font-style: italic;
  opacity: 0.7;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
  min-height: 2.7rem;
}

.circle-meta {
  display: flex;
  flex-direction: column; /* Stack meta items */
  gap: 6px; /* Space between meta items */
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin-top: auto; /* Pushes meta to the bottom of the card */
}

.circle-meta span {
  display: flex;
  align-items: center;
}

.circle-meta svg {
  margin-right: 8px; /* Increased gap for SVG */
  color: var(--color-text-tertiary); /* Softer color for meta icons */
}

/* Invitations Section */
.invitations-section {
  margin-top: 40px;
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
  padding-left: 16px; /* Consistent padding */
  padding-right: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  font-size: 1.75rem; /* Slightly larger */
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.section-header h2 svg {
  color: var(--lumia-primary, #9c6ade); /* Use brand color for icon */
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px; /* Slightly larger */
  height: 24px;
  padding: 0.25rem 0.6rem;
  margin-left: 12px;
  background-color: var(--lumia-primary, #9c6ade);
  color: white;
  border-radius: 12px; /* More pill-like */
  font-size: 0.875rem;
  font-weight: 600;
}

.invitations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Responsive grid */
  gap: 20px;
}

.invitation-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px; /* Softer radius */
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.invitation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
  border-color: var(--lumia-accent, #1dd1a1);
}

.invitation-card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-right: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.15), rgba(29, 209, 161, 0.15));
  color: var(--lumia-accent, #1dd1a1);
}

.invitation-card-icon {
  width: 22px;
  height: 22px;
}

.invitation-content {
  flex: 1;
}

.invitation-content h3 {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.invitation-date {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.invitation-actions {
  display: flex;
  gap: 8px;
}

/* Shared button styles for invitations for consistency with BaseModal buttons */
.btn {
  padding: 0.6rem 1rem; /* Standardized padding */
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-sm {
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: var(--lumia-gradient, linear-gradient(45deg, #9c6ade, #1dd1a1));
  color: white;
  box-shadow: var(--lumia-shadow-sm, 0 2px 8px rgba(156, 106, 222, 0.2));
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--lumia-shadow-hover, 0 4px 12px rgba(156, 106, 222, 0.3));
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-hover);
  border-color: var(--color-border-medium);
  color: var(--color-text-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

/* Specific styles for accept/decline buttons, can be further customized */
.accept-btn {
  /* Uses .btn and .btn-primary */
}

.decline-btn {
  /* Uses .btn and .btn-secondary */
}

/* Modal Form Styles (if not already covered by BaseModal or global styles) */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error, #ef4444);
  margin-left: 2px;
}

input[type="text"],
textarea {
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

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: var(--lumia-primary, #9c6ade);
  box-shadow: 0 0 0 3px rgba(156, 106, 222, 0.2);
}

input.error,
textarea.error {
  border-color: var(--color-error, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-text {
  color: var(--color-error, #ef4444);
  font-size: 0.875rem;
  margin-top: 0.5rem;
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
  color: #f59e0b; /* Example warning color */
}

.char-counter.error {
  color: var(--color-error, #ef4444);
}


/* Loading state for invitations list */
.loading-invitations {
  display: flex;
  align-items: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
  margin-right: 1rem;
  margin-bottom: 0;
}

/* Dark mode support (Ensure these complement global dark mode variables) */
@media (prefers-color-scheme: dark) {
  .circle-card {
    background-color: var(--color-bg-secondary); /* Darker card for dark mode */
    border-color: rgba(156, 106, 222, 0.25);
  }
  
  .invitation-card {
    background-color: var(--color-bg-tertiary); /* Slightly different for invitations */
    border-color: rgba(156, 106, 222, 0.2);
  }

  .btn-secondary {
    background-color: var(--color-bg-primary-dark); /* Adjust for dark mode */
    color: var(--color-text-light);
    border-color: rgba(156, 106, 222, 0.4);
  }
  
  .btn-secondary:hover {
    background-color: rgba(156, 106, 222, 0.2);
    border-color: rgba(156, 106, 222, 0.5);
    color: var(--color-text-primary-dark-hover, #fff);
  }
  
  input[type="text"],
  textarea {
    background-color: var(--color-bg-primary); /* Match BaseModal dark inputs */
    border-color: rgba(156, 106, 222, 0.3);
  }
}

/* Media Queries for responsiveness */
@media screen and (max-width: 768px) {
  .circles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .circles-grid,
  .invitations-list {
    grid-template-columns: 1fr; /* Single column on smaller screens */
    padding: 0 8px;
  }
  
  .invitation-actions {
    flex-direction: column; /* Stack buttons on small screens */
    align-items: stretch;
    width: 100%; /* Make buttons full width in column */
  }
  .invitation-actions .btn {
    width: 100%;
    margin-top: 8px;
  }
  .invitation-actions .btn:first-child {
    margin-top: 0;
}
}

</style> 