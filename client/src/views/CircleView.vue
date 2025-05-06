<template>
  <div class="page-layout">
    <!-- Left sidebar for members and invitations -->
    <CircleMembers
      v-if="!loading && !error"
      :members="circle.members"
      :invitations="circle.invitations"
      :isAdmin="circle.isAdmin"
      :currentUserId="currentUserId"
      @invite="showInviteModal = true"
      @delete-circle="confirmDelete"
      @make-admin="makeAdmin"
      @remove-member="confirmRemoveMember"
      @leave-circle="confirmLeave"
      @cancel-invitation="cancelInvitation"
    />
    
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
        <CircleHeader
          :name="circle.name"
          :description="circle.description"
          :isAdmin="circle.isAdmin"
          @edit="openEditCircleModal"
          @upload="uploadMedia"
          @share-album="shareAlbum"
        />
        
        <div class="circle-content">
          <div v-if="sharedAlbums.length === 0 && sharedFiles.length === 0 && timeline.length === 0" class="welcome-message">
            <h3>Welcome to {{ circle.name }}</h3>
            <p>This is a private circle where you can connect and share with trusted members.</p>
            <p>No content has been shared with this circle yet.</p>
          </div>
          
          <div v-else>
            <CircleTabs v-model="activeTab" />
            
            <div class="tab-content">
              <!-- Timeline Tab -->
              <CircleTimeline
                v-if="activeTab === 'timeline'"
                :timeline="timeline"
                :loading="loadingTimeline"
                :loadingMore="loadingMore" 
                :nextPageTimestamp="nextPageTimestamp"
                :circleId="circleId"
                :apiBaseUrl="apiBaseUrl"
                @load-more="loadMoreTimelineItems"
                @view-album="viewAlbum"
                @view-file="viewFile"
              />
              
              <!-- Albums Tab -->
              <CircleAlbums
                v-if="activeTab === 'albums'"
                :albums="sharedAlbums"
                :loading="loadingAlbums"
                :circleId="circleId"
                :ownerMap="ownerMap"
                :apiBaseUrl="apiBaseUrl"
                @view-album="viewAlbum"
              />
              
              <!-- Files Tab -->
              <CircleFiles
                v-if="activeTab === 'files'"
                :files="sharedFiles"
                :loading="loadingFiles"
                :circleId="circleId"
                :ownerMap="ownerMap"
                :apiBaseUrl="apiBaseUrl"
                @view-file="viewFile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <CircleInviteModal
      :show="showInviteModal"
      :circleId="circleId"
      :circleName="circle.name"
      @close="showInviteModal = false"
      @invited="loadCircleData"
    />
    
    <CircleEditModal
      :show="showEditCircleModal"
      :circleId="circleId" 
      :initialName="circle.name"
      :initialDescription="circle.description"
      @close="showEditCircleModal = false"
      @updated="handleCircleUpdated"
    />
    
    <CircleConfirmModal
      :show="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      :buttonText="confirmButtonText"
      :processing="processing"
      @close="cancelConfirmation"
      @confirm="processConfirmation"
    />
  </div>
</template>

<script>
import authStore from '../store/authStore';
import circlesService from '../services/circlesService';
import { format } from 'date-fns';

// Import components
import CircleMembers from '../components/circles/CircleMembers.vue';
import CircleHeader from '../components/circles/CircleHeader.vue';
import CircleTabs from '../components/circles/CircleTabs.vue';
import CircleTimeline from '../components/circles/CircleTimeline.vue';
import CircleAlbums from '../components/circles/CircleAlbums.vue';
import CircleFiles from '../components/circles/CircleFiles.vue';
import CircleInviteModal from '../components/circles/CircleInviteModal.vue';
import CircleEditModal from '../components/circles/CircleEditModal.vue';
import CircleConfirmModal from '../components/circles/CircleConfirmModal.vue';

export default {
  name: 'CircleView',
  components: {
    CircleMembers,
    CircleHeader,
    CircleTabs,
    CircleTimeline,
    CircleAlbums,
    CircleFiles,
    CircleInviteModal,
    CircleEditModal,
    CircleConfirmModal
  },
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
      sharedAlbums: [],
      loading: true,
      error: null,
      
      // Shared files related data
      sharedFiles: [],
      loadingFiles: false,
      
      // Timeline related data
      timeline: [],
      loadingTimeline: false,
      loadingMore: false,
      nextPageTimestamp: null,
      
      // Tab control
      activeTab: 'timeline',
      
      // Circle ID from route params
      circleId: this.$route.params.id,
      
      // API base URL for thumbnails
      apiBaseUrl: 'http://localhost:3000/api',
      
      // Loading state for albums
      loadingAlbums: false,
      
      // Current user ID
      currentUserId: authStore.state.user ? authStore.state.user.id : null,
      
      // Owner mapping for user details
      ownerMap: {},
      
      // Modal visibility states
      showInviteModal: false,
      showEditCircleModal: false,
      showConfirmModal: false,
      
      // Confirmation modal data
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: 'Confirm',
      confirmAction: null,
      confirmData: null,
      processing: false,
    };
  },
  computed: {
    formattedFileSize() {
      return (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
    },
    fileTypeFormatted() {
      return (mimetype) => {
        if (!mimetype) return 'File';
        
        if (mimetype.startsWith('image/')) {
          return 'Image';
        } else if (mimetype.startsWith('video/')) {
          return 'Video';
        } else if (mimetype.startsWith('audio/')) {
          return 'Audio';
        } else if (mimetype.includes('pdf')) {
          return 'PDF';
        } else if (mimetype.includes('document') || mimetype.includes('word')) {
          return 'Document';
        } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
          return 'Spreadsheet';
        } else {
          return 'File';
        }
      };
    }
  },
  async mounted() {
    // Load the circle data, timeline and shared albums
    try {
      this.loading = true;
      
      // Load all data in parallel to improve performance
      await Promise.all([
        this.loadCircleData(),
        this.loadTimeline(),
        this.loadSharedAlbums()  // Always load albums on initial load
      ]);
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading circle data:', error);
      this.error = 'Failed to load circle data. Please try again.';
      this.loading = false;
    }
  },
  methods: {
    /**
     * Load all circle details
     */
    async loadCircleData() {
      try {
        // Get circle details using the existing method
        const response = await circlesService.getCircleById(this.circleId);
        this.circle = response;
      } catch (error) {
        console.error('Error loading circle details:', error);
        this.error = 'Failed to load circle details. The circle may not exist or you might not have permission to view it.';
      }
    },

    /**
     * Load shared albums for this circle
     */
    async loadSharedAlbums() {
      try {
        this.loadingAlbums = true;
        // Use the dedicated albums endpoint instead of the shared files endpoint
        const response = await circlesService.getCircleSharedAlbums(this.circleId);
        // Extract albums array from the response
        this.sharedAlbums = (response && response.albums) || [];
        this.loadingAlbums = false;
      } catch (error) {
        console.error('Error loading shared albums:', error);
        this.loadingAlbums = false;
      }
    },

    /**
     * Load shared files for the circle
     */
    async loadSharedFiles() {
      try {
        this.loadingFiles = true;
        const response = await circlesService.getCircleSharedFiles(this.circleId);
        this.sharedFiles = (response && response.files) || [];
        this.loadingFiles = false;
      } catch (error) {
        console.error('Error loading shared files:', error);
        this.loadingFiles = false;
      }
    },

    /**
     * Load timeline items for the circle
     */
    async loadTimeline() {
      try {
        this.loadingTimeline = true;
        
        // No timestamp for first page
        const options = {};
        
        const response = await circlesService.getCircleTimeline(this.circleId, options);
        
        if (response) {
          this.timeline = response.timeline || [];
          this.nextPageTimestamp = response.nextPageTimestamp;
        } else {
          this.timeline = [];
          this.nextPageTimestamp = null;
        }
        
        this.loadingTimeline = false;
      } catch (error) {
        console.error('Error loading timeline:', error);
        this.timeline = [];
        this.nextPageTimestamp = null;
        this.loadingTimeline = false;
      }
    },

    /**
     * Load more timeline items when pagination button is clicked
     */
    async loadMoreTimelineItems() {
      try {
        this.loadingMore = true;
        
        // Use the nextPageTimestamp to get older items
        const options = {
          timestamp: this.nextPageTimestamp
        };
        
        const response = await circlesService.getCircleTimeline(this.circleId, options);
        
        // Add the new items to the timeline
        this.timeline = [...this.timeline, ...(response.timeline || [])];
        
        // Update the nextPageTimestamp for the next pagination
        this.nextPageTimestamp = response.nextPageTimestamp;
        
        this.loadingMore = false;
      } catch (error) {
        console.error('Error loading more timeline items:', error);
        this.loadingMore = false;
      }
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
    
    async makeAdmin(userId) {
      try {
        await circlesService.makeAdmin(this.id, userId);
        await this.loadCircleData();
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
        await this.loadCircleData();
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
    },
    formatTimeAgo(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
          return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
          return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
      } catch (error) {
        return 'unknown time';
      }
    },
    getOwnerName(userId) {
      // Find the member with this userId
      const member = this.circle.members.find(member => member.id === userId);
      return member ? member.name : 'Unknown';
    },
    viewAlbum(albumId) {
      this.$router.push(`/albums/${albumId}`);
    },
    viewFile(fileId) {
      this.$router.push(`/view/${fileId}`);
    },
    handleCircleUpdated(updatedData) {
      // Update the circle with the new data from the edit modal
      this.circle.name = updatedData.name;
      this.circle.description = updatedData.description;
    },
    openEditCircleModal() {
      // Show modal
      this.showEditCircleModal = true;
    },
    uploadMedia() {
      // Placeholder for upload functionality
      alert('Upload functionality not yet implemented');
    },
    shareAlbum() {
      // Placeholder for sharing album functionality
      alert('Share album functionality not yet implemented');
    },
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
    },
    // Watch for changes in the active tab
    activeTab(newTab) {
      if (newTab === 'files' && this.sharedFiles.length === 0 && !this.loadingFiles) {
        this.loadSharedFiles();
      }
      
      // Load albums when switching to albums tab if they're not already loaded or loading
      if (newTab === 'albums' && this.sharedAlbums.length === 0 && !this.loadingAlbums) {
        this.loadSharedAlbums();
      }
    }
  },
  beforeUnmount() {
    // Clean up event listener if component is unmounted while modal is open
    document.removeEventListener('keydown', this.handleEscKey);
  },
  created() {
    // Make sure we have the circle ID from the route
    if (!this.circleId && this.id) {
      this.circleId = this.id;
    } else if (!this.circleId && this.$route.params.id) {
      this.circleId = this.$route.params.id;
    }

    if (!this.circleId) {
      this.error = 'No circle ID provided';
      console.error('Circle ID not found in props or route params');
    }
  },
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

/* Basic button styles that might be needed across components */
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

/* Responsive adjustments for main layout */
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
}
</style> 