<template>
  <div class="page-layout">
    <!-- Left sidebar for members and invitations -->
    <div class="members-sidebar" v-if="!loading && !error">
      <!-- Admin Actions -->
      <div v-if="circle.isAdmin" class="sidebar-section admin-actions">
        <div class="sidebar-actions">
          <button class="invite-btn" @click="showInviteModal = true">
            <i class="fas fa-user-plus"></i> Invite Members
          </button>
          <button class="delete-btn" @click="confirmDelete">
            <i class="fas fa-trash-alt"></i> Delete Circle
          </button>
        </div>
      </div>
      
      <!-- Members Section -->
      <div class="sidebar-section members-section">
        <h2>Members ({{ circle.members.length }})</h2>
        
        <div class="members-list">
          <div v-for="member in circle.members" :key="member.id" class="member-card">
            <div class="member-avatar">
              <img v-if="member.picture" :src="member.picture" :alt="member.name">
              <div v-else class="default-avatar">
                {{ getInitials(member.name) }}
              </div>
            </div>
            
            <div class="member-details">
              <div class="member-name-wrapper">
                <span class="member-name">{{ member.name }}</span>
                <span v-if="member.isAdmin" class="admin-badge" title="Circle Admin">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
              <div class="member-email">{{ member.email }}</div>
            </div>
            
            <!-- Member actions -->
            <div class="member-actions" v-if="circle.isAdmin && !isCurrentUser(member.id)">
              <button 
                v-if="!member.isAdmin" 
                class="action-btn make-admin-btn" 
                @click="makeAdmin(member.id)"
                title="Make Admin"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                class="action-btn remove-btn" 
                @click="confirmRemoveMember(member)"
                title="Remove from Circle"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="member-actions self-actions" v-else-if="isCurrentUser(member.id)">
              <span class="self-label">You</span>
              
              <button 
                v-if="canLeaveCircle()" 
                class="action-btn leave-btn" 
                @click="confirmLeave()"
                title="Leave Circle"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                   <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pending Invitations Section -->
      <div v-if="circle.isAdmin && circle.invitations && circle.invitations.length > 0" class="sidebar-section pending-invitations">
        <h2>Pending Invitations</h2>
        
        <div class="invitations-list">
          <div v-for="(invitation, index) in circle.invitations" :key="index" class="invitation-item">
            <div class="invitation-icon">
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div class="invitation-details">
              <span class="invitation-email">{{ invitation.email }}</span>
              <small class="invitation-date">Invited {{ formatDate(invitation.invitedAt) }}</small>
            </div>
            
            <button 
              class="action-btn cancel-invite-btn" 
              @click="cancelInvitation(invitation)" 
              title="Cancel Invitation"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="circle-view-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading circle details...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3>Error Loading Circle</h3>
        <p>{{ error }}</p>
        <button class="secondary-btn" @click="$router.push('/circles')">
          Back to Circles
        </button>
      </div>
      
      <div v-else class="circle-details">
        <div class="circle-header">
          <div class="title-section">
            <h1>
              {{ circle.name }}
              <button v-if="circle.isAdmin" class="edit-circle-btn" @click="openEditCircleModal" title="Edit Circle Name & Description">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                <span class="edit-label">Edit Circle</span>
              </button>
            </h1>
            <div class="description-container">
              <div class="description-text">
                <p v-if="circle.description" class="description">
                  {{ circle.description }}
                </p>
                <p v-else class="no-description">
                  No description provided
                </p>
              </div>
            </div>
          </div>
          
          <!-- Circle content actions -->
          <div class="circle-actions">
            <button class="action-button upload-button">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload
            </button>
            <button class="action-button share-button">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share Album
            </button>
          </div>
        </div>
        
        <div class="circle-content">
          <div class="welcome-message">
            <h3>Welcome to {{ circle.name }}</h3>
            <p>This is a private circle where you can connect and share with trusted members.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Invite to {{ circle.name }}</h2>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="invite-email">Email Address <span class="required">*</span></label>
            <input 
              id="invite-email" 
              v-model="inviteEmail" 
              type="email" 
              placeholder="Enter email address to invite"
              :class="{ 'error': inviteError }"
            >
            <p v-if="inviteError" class="error-text">{{ inviteError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-btn" @click="showInviteModal = false">Cancel</button>
          <button 
            class="primary-btn" 
            @click="sendInvitation"
            :disabled="inviting || !inviteEmail"
          >
            <span v-if="inviting">Sending...</span>
            <span v-else>Send Invitation</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Circle Modal -->
    <div v-if="showEditCircleModal" class="modal-overlay" @click.self="showEditCircleModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Circle Details</h2>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="circle-name">Name <span class="required">*</span> <span class="max-chars">(Max 50 characters)</span></label>
            <input 
              id="circle-name" 
              v-model="editedName" 
              type="text" 
              placeholder="Enter circle name"
              :class="{ 'error': nameError || editedName.length > 50 }"
              @input="validateName"
            >
            <div class="form-feedback">
              <p v-if="nameError" class="error-text">{{ nameError }}</p>
              <p class="char-counter" :class="{ 'warning': editedName.length > 40, 'error': editedName.length > 50 }">
                {{ editedName.length }}/50
              </p>
            </div>
          </div>
          
          <div class="form-group">
            <label for="circle-description">Description <span class="max-chars">(Max 150 characters)</span></label>
            <textarea 
              id="circle-description" 
              v-model="editedDescription" 
              rows="5" 
              placeholder="Describe the purpose of this circle"
              :class="{ 'error': editedDescription.length > 150 }"
              @input="validateDescription"
            ></textarea>
            <div class="form-feedback">
              <p v-if="descriptionError" class="error-text">{{ descriptionError }}</p>
              <p class="char-counter" :class="{ 'warning': editedDescription.length > 130, 'error': editedDescription.length > 150 }">
                {{ editedDescription.length }}/150
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-btn" @click="showEditCircleModal = false">Cancel</button>
          <button 
            class="primary-btn" 
            @click="updateCircleDetails"
            :disabled="updating || editedDescription.length > 150 || !editedName.trim() || editedName.length > 50"
          >
            <span v-if="updating">Updating...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelConfirmation">
      <div class="modal-content confirmation-modal">
        <div class="modal-header">
          <h2>{{ confirmTitle }}</h2>
        </div>
        
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-btn" @click="cancelConfirmation">Cancel</button>
          <button 
            class="danger-btn" 
            @click="processConfirmation"
            :disabled="processing"
          >
            <span v-if="processing">Processing...</span>
            <span v-else>{{ confirmButtonText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../services/circlesService';
import { format } from 'date-fns';
import authStore from '../store/authStore';

export default {
  name: 'CircleView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      circle: {
        name: '',
        description: '',
        members: [],
        isAdmin: false,
        invitations: []
      },
      loading: true,
      error: null,
      
      // Invite modal
      showInviteModal: false,
      inviteEmail: '',
      inviteError: '',
      inviting: false,
      
      // Edit circle modal
      showEditCircleModal: false,
      editedName: '',
      nameError: '',
      editedDescription: '',
      descriptionError: '',
      updating: false,
      
      // Confirmation modal
      showConfirmModal: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: 'Confirm',
      confirmAction: null,
      confirmData: null,
      processing: false
    };
  },
  async created() {
    try {
      await this.loadCircleDetails();
    } catch (error) {
      this.error = 'Failed to load circle details. The circle may not exist or you might not have permission to view it.';
      console.error('Error loading circle:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadCircleDetails() {
      const response = await circlesService.getCircleById(this.id);
      this.circle = response;
      
      // Initialize edited values with current circle details
      this.editedName = this.circle.name || '';
      this.editedDescription = this.circle.description || '';
      
      // Reset error states
      this.nameError = '';
      this.descriptionError = '';
    },
    
    async updateCircleDetails() {
      // Validate inputs
      if (!this.editedName.trim()) {
        this.nameError = 'Circle name is required';
        return;
      }
      
      if (this.editedName.length > 50) {
        this.nameError = 'Name must be 50 characters or less';
        return;
      }
      
      if (this.editedDescription.length > 150) {
        this.descriptionError = 'Description must be 150 characters or less';
        return;
      }
      
      try {
        this.updating = true;
        
        await circlesService.updateCircle(this.id, {
          name: this.editedName.trim(),
          description: this.editedDescription.trim()
        });
        
        // Update the local circle object
        this.circle.name = this.editedName.trim();
        this.circle.description = this.editedDescription.trim();
        
        // Close modal
        this.showEditCircleModal = false;
      } catch (error) {
        console.error('Error updating circle details:', error);
        // Check for specific error messages from API
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('Failed to update circle details. Please try again.');
        }
      } finally {
        this.updating = false;
      }
    },
    
    validateName() {
      if (!this.editedName.trim()) {
        this.nameError = 'Circle name is required';
      } else if (this.editedName.length > 50) {
        this.nameError = 'Name must be 50 characters or less';
      } else {
        this.nameError = '';
      }
    },
    
    validateDescription() {
      if (this.editedDescription.length > 150) {
        this.descriptionError = 'Description must be 150 characters or less';
      } else {
        this.descriptionError = '';
      }
    },
    
    openEditCircleModal() {
      // Reset to current circle details
      this.editedName = this.circle.name || '';
      this.editedDescription = this.circle.description || '';
      
      // Reset error states
      this.nameError = '';
      this.descriptionError = '';
      
      // Show modal
      this.showEditCircleModal = true;
    },
    
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return format(date, 'MMM d, yyyy');
      } catch (error) {
        return 'Unknown date';
      }
    },
    
    isCurrentUser(userId) {
      // Get the current user from auth store
      const currentUser = authStore.state.user;
      if (!currentUser) return false;
      
      // Compare the member ID with the current user's ID
      return userId === currentUser.id;
    },
    
    canLeaveCircle() {
      // Can leave if not the last admin
      const adminCount = this.circle.members.filter(m => m.isAdmin).length;
      return !this.circle.isAdmin || adminCount > 1;
    },
    
    async sendInvitation() {
      if (!this.inviteEmail || !this.inviteEmail.includes('@')) {
        this.inviteError = 'Please enter a valid email address';
        return;
      }
      
      this.inviteError = '';
      this.inviting = true;
      
      try {
        await circlesService.inviteUser(this.id, this.inviteEmail);
        
        // Reset form
        this.inviteEmail = '';
        this.showInviteModal = false;
        
        // Reload circle details to show updated invitations
        await this.loadCircleDetails();
        
        // Notify user
        alert('Invitation sent successfully!');
      } catch (error) {
        console.error('Error sending invitation:', error);
        
        // Extract error message from response if available
        if (error.response && error.response.data && error.response.data.message) {
          this.inviteError = error.response.data.message;
        } else {
          this.inviteError = 'Failed to send invitation. Please try again.';
        }
      } finally {
        this.inviting = false;
      }
    },
    
    async makeAdmin(userId) {
      try {
        await circlesService.makeAdmin(this.id, userId);
        await this.loadCircleDetails();
        alert('User is now an admin of this Circle.');
      } catch (error) {
        console.error('Error making user admin:', error);
        alert('Failed to update admin status. Please try again.');
      }
    },
    
    confirmRemoveMember(member) {
      this.confirmTitle = 'Remove Member';
      this.confirmMessage = `Are you sure you want to remove ${member.name} from this Circle?`;
      this.confirmButtonText = 'Remove';
      this.confirmAction = this.removeMember;
      this.confirmData = member.id;
      this.showConfirmModal = true;
    },
    
    async removeMember(userId) {
      try {
        this.processing = true;
        await circlesService.removeUser(this.id, userId);
        await this.loadCircleDetails();
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      } finally {
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    confirmLeave() {
      this.confirmTitle = 'Leave Circle';
      this.confirmMessage = 'Are you sure you want to leave this Circle? You will need to be invited again to rejoin.';
      this.confirmButtonText = 'Leave';
      this.confirmAction = this.leaveCircle;
      this.showConfirmModal = true;
    },
    
    async leaveCircle() {
      try {
        this.processing = true;
        // Leave circle is the same as removing yourself
        await circlesService.removeUser(this.id, 'me'); // Server side will use the authenticated user
        // Redirect back to circles listing
        this.$router.push('/circles');
      } catch (error) {
        console.error('Error leaving circle:', error);
        alert('Failed to leave circle. Please try again.');
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    confirmDelete() {
      this.confirmTitle = 'Delete Circle';
      this.confirmMessage = 'Are you sure you want to delete this Circle? This action cannot be undone.';
      this.confirmButtonText = 'Delete';
      this.confirmAction = this.deleteCircle;
      this.showConfirmModal = true;
    },
    
    async deleteCircle() {
      try {
        this.processing = true;
        await circlesService.deleteCircle(this.id);
        // Redirect back to circles listing
        this.$router.push('/circles');
      } catch (error) {
        console.error('Error deleting circle:', error);
        alert('Failed to delete circle. Please try again.');
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    cancelInvitation(invitation) {
      // This would require a new API endpoint to cancel invitations
      console.log('Would cancel invitation for:', invitation.email);
      alert('This feature is not yet implemented.');
    },
    
    processConfirmation() {
      if (this.confirmAction) {
        this.confirmAction(this.confirmData);
      }
    },
    
    cancelConfirmation() {
      this.showConfirmModal = false;
      this.confirmAction = null;
      this.confirmData = null;
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape') {
        if (this.showEditCircleModal) {
          this.showEditCircleModal = false;
        } else if (this.showInviteModal) {
          this.showInviteModal = false;
        } else if (this.showConfirmModal) {
          this.cancelConfirmation();
        }
      }
    },
    handleModalVisibilityChange(newValue) {
      if (newValue) {
        // Add event listener when modal is opened
        document.addEventListener('keydown', this.handleEscKey);
      } else {
        // Remove event listener when modal is closed
        document.removeEventListener('keydown', this.handleEscKey);
      }
    }
  },
  watch: {
    showEditCircleModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    },
    showInviteModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    },
    showConfirmModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    }
  },
  beforeUnmount() {
    // Clean up event listener if component is unmounted while modal is open
    document.removeEventListener('keydown', this.handleEscKey);
  }
};
</script>

<style scoped>
/* Page-level layout */
.page-layout {
  display: flex;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

/* Left sidebar styles */
.members-sidebar {
  flex: 0 0 380px;
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

/* Main container styles */
.circle-view-container {
  flex: 1;
  min-width: 0; /* Prevent flex items from overflowing */
  max-width: 1100px;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
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

.error-icon {
  font-size: 4rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-container h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.error-container p {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-muted);
}

.circle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.title-section {
  flex: 1;
  padding-right: 100px;
}

.title-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.description-container {
  display: flex;
  width: 100%;
  margin-top: 0.5rem;
}

.description-text {
  width: 100%;
}

.description, .no-description {
  position: relative;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  display: inline;
}

.no-description {
  font-style: italic;
  opacity: 0.7;
  color: var(--color-text-secondary);
}

.edit-circle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 106, 222, 0.1);
  border: 1px solid rgba(156, 106, 222, 0.3);
  border-radius: 30px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px 12px;
  font-size: 0.8rem;
  vertical-align: middle;
  margin-left: 8px;
  gap: 6px;
}

.edit-circle-btn:hover {
  background-color: rgba(156, 106, 222, 0.2);
  border-color: #9c6ade;
  color: #9c6ade;
  transform: translateY(-1px);
}

.edit-circle-btn svg {
  color: #9c6ade;
}

.edit-label {
  font-weight: 500;
  font-size: 0.75rem;
  color: inherit;
  font-family: inherit;
}

.actions {
  display: flex;
  gap: 1rem;
}

.invite-btn, .delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.invite-btn {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
}

.invite-btn:hover {
  opacity: 0.9;
}

.delete-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* Content area */
.circle-content {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.welcome-message {
  text-align: center;
  padding: 2rem;
}

.welcome-message h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-message p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Sidebar sections */
.sidebar-section {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-section h2 {
  font-size: 1.3rem;
  margin: 0 0 1.2rem 0;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--color-border);
}

/* Members list */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: box-shadow 0.2s ease;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.1);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lumia-gradient);
  color: white;
  font-weight: 600;
}

.member-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.member-name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2px;
}

.member-name {
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-badge {
  color: #f6b93b;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.admin-badge svg {
  display: block;
}

.member-email {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.action-btn:hover {
  background-color: var(--color-hover);
  color: var(--color-text-primary);
}

.make-admin-btn:hover {
  color: #f6b93b;
  background-color: rgba(246, 185, 59, 0.1);
}

.remove-btn:hover, .leave-btn:hover {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

.self-actions {
  justify-content: flex-end;
  gap: 0.5rem;
}

.self-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

/* Invitations */
.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.invitation-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.invitation-item:hover {
  background-color: var(--color-hover);
}

.invitation-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  color: var(--lumia-purple);
  display: flex;
  align-items: center;
}

.invitation-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.invitation-email {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.invitation-date {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.cancel-invite-btn {
  margin-left: auto;
}

.cancel-invite-btn:hover {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

/* Responsive adjustments */
@media (min-width: 1800px) {
  .page-layout {
    max-width: 1800px;
  }
  
  .circle-view-container {
    max-width: 1300px;
  }
}

@media (max-width: 1200px) {
  .members-sidebar {
    flex-basis: 340px;
  }
}

@media (max-width: 992px) {
  .page-layout {
    flex-direction: column-reverse;
    padding: 1rem;
  }
  
  .members-sidebar {
    flex-basis: auto;
    position: static;
    max-height: none;
    width: 100%;
  }
  
  .circle-view-container {
    max-width: 100%;
  }
  
  .circle-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .title-section {
    padding-right: 0;
    width: 100%;
  }
  
  .actions {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    gap: 0.8rem;
  }
}

/* Modal styling is unchanged */
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

.confirmation-modal {
  max-width: 400px;
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

.danger-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.danger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
}

.danger-btn:disabled {
  background: #f87171;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

/* Admin actions in sidebar */
.admin-actions {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.08), rgba(29, 209, 161, 0.08));
  border: 1px solid rgba(156, 106, 222, 0.2);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.invite-btn, .delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.invite-btn {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.2);
}

.invite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.3);
}

.delete-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  transform: translateY(-2px);
}

/* Circle actions */
.circle-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.share-button {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.share-button:hover {
  background: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
  color: #9c6ade;
  transform: translateY(-2px);
}
</style> 