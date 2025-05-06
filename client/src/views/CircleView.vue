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
                aria-label="Make this member an admin of the circle"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M12 1l3.22 6.52 7.2.62-5.2 5.07 1.22 7.13L12 16.77l-6.44 3.57 1.22-7.13-5.2-5.07 7.2-.62L12 1z"/>
                </svg>
              </button>
              
              <button 
                class="action-btn remove-btn" 
                @click="confirmRemoveMember(member)"
                title="Remove from Circle"
                aria-label="Remove this member from the circle"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
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
                aria-label="Leave this circle"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
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
              aria-label="Cancel invitation for this email address"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
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
          <div v-if="sharedAlbums.length === 0 && sharedFiles.length === 0 && timeline.length === 0" class="welcome-message">
            <h3>Welcome to {{ circle.name }}</h3>
            <p>This is a private circle where you can connect and share with trusted members.</p>
            <p>No content has been shared with this circle yet.</p>
          </div>
          
          <!-- Timeline Section -->
          <div v-if="timeline.length > 0" class="timeline-container">
            <h3 class="section-title">Recent Activity</h3>
            
            <div v-if="loadingTimeline" class="loading-indicator">
              <div class="loading-spinner"></div>
              <p>Loading timeline...</p>
            </div>
            
            <div v-else class="timeline">
              <div v-for="(activity, index) in timeline" :key="index" class="timeline-item">
                <div class="timeline-header">
                  <div class="user-avatar">
                    <img v-if="activity.owner.picture" :src="activity.owner.picture" :alt="activity.owner.name">
                    <div v-else class="default-avatar">
                      {{ getInitials(activity.owner.name) }}
                    </div>
                  </div>
                  
                  <div class="activity-info">
                    <div class="activity-title">
                      <span class="username">{{ activity.owner.name }}</span>
                      <span v-if="activity.type === 'file'">
                        shared {{ activity.items.length > 1 ? `${activity.items.length} files` : 'a file' }}
                      </span>
                      <span v-else-if="activity.type === 'album'">
                        added new media to {{ activity.items.length > 1 ? 'albums' : 'an album' }}
                      </span>
                    </div>
                    <div class="activity-time">
                      {{ formatTimeAgo(activity.createdAt) }}
                    </div>
                  </div>
                </div>
                
                <!-- File activity content -->
                <div v-if="activity.type === 'file'" class="activity-content files-grid">
                  <div 
                    v-for="file in activity.items" 
                    :key="file.id"
                    class="file-card"
                    @click="viewFile(file.id)"
                  >
                    <div class="file-thumbnail">
                      <img 
                        :src="`${apiBaseUrl}/thumbnails/${file.thumbnailId}.jpg`" 
                        :alt="file.originalName" 
                        class="file-thumbnail-image"
                      />
                    </div>
                    
                    <div class="file-info">
                      <h4 class="file-name" :title="file.originalName">{{ file.originalName }}</h4>
                      <p class="file-meta">{{ formattedFileSize(file.size) }} · {{ fileTypeFormatted(file.mimetype) }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Album activity content -->
                <div v-else-if="activity.type === 'album'" class="activity-content">
                  <div 
                    v-for="album in activity.items" 
                    :key="album.id"
                    class="album-activity"
                  >
                    <div class="album-header">
                      <h4 class="album-name">{{ album.name }}</h4>
                      <span class="album-count">{{ album.fileCount }} items</span>
                      <button 
                        class="view-album-btn"
                        @click="viewAlbum(album.id)"
                      >
                        View Album
                      </button>
                    </div>
                    
                    <div class="album-previews" v-if="album.previewFiles && album.previewFiles.length > 0">
                      <div 
                        v-for="preview in album.previewFiles" 
                        :key="preview.id"
                        class="album-preview-thumbnail"
                      >
                        <img 
                          :src="`${apiBaseUrl}/thumbnails/${preview.id}.jpg`" 
                          :alt="preview.originalName"
                        />
                      </div>
                    </div>
                    <div v-else class="album-no-previews">
                      <p>No items in this album yet</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Pagination controls -->
              <div v-if="timelineData.totalPages > 1" class="pagination">
                <button 
                  class="pagination-btn"
                  :disabled="timelineData.page === 1"
                  @click="changePage(timelineData.page - 1)"
                >
                  Previous
                </button>
                <span class="page-info">
                  Page {{ timelineData.page }} of {{ timelineData.totalPages }}
                </span>
                <button 
                  class="pagination-btn"
                  :disabled="timelineData.page === timelineData.totalPages"
                  @click="changePage(timelineData.page + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="sharedAlbums.length > 0" class="albums-container">
            <h3 class="section-title">Shared Albums</h3>
            <div class="albums-grid">
              <div 
                v-for="album in sharedAlbums" 
                :key="album._id"
                class="album-card"
                @click="viewAlbum(album._id)"
              >
                <div class="album-thumbnail">
                  <div v-if="!album.thumbnailId" class="album-placeholder">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="2.5"></circle>
                      <path d="m21 15-5-5L5 21"></path>
                    </svg>
                  </div>
                  <img 
                    v-else 
                    :src="`${apiBaseUrl}/thumbnails/${album.thumbnailId}.jpg`" 
                    alt="Album thumbnail" 
                    class="album-thumbnail-image"
                  />
                </div>
                
                <div class="album-info">
                  <h4 class="album-name">{{ album.name }}</h4>
                  <p class="album-meta">{{ album.fileCount || 0 }} items</p>
                  <p class="album-owner">Shared by: {{ getOwnerName(album.userId) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Shared Files Section -->
          <div v-if="sharedFiles.length > 0" class="files-container">
            <h3 class="section-title">Shared Files</h3>
            <div v-if="loadingFiles" class="loading-indicator">
              <div class="loading-spinner"></div>
              <p>Loading shared files...</p>
            </div>
            <div v-else class="files-grid">
              <div 
                v-for="file in sharedFiles" 
                :key="file._id"
                class="file-card"
                @click="viewFile(file._id)"
              >
                <div class="file-thumbnail">
                  <img 
                    :src="`${apiBaseUrl}/thumbnails/${file._id}.jpg`" 
                    :alt="file.originalName" 
                    class="file-thumbnail-image"
                  />
                </div>
                
                <div class="file-info">
                  <h4 class="file-name" :title="file.originalName">{{ file.originalName }}</h4>
                  <p class="file-meta">{{ formattedFileSize(file.size) }} · {{ fileTypeFormatted(file.mimetype) }}</p>
                  <p class="file-owner">Shared by: {{ getOwnerName(file.userId) }}</p>
                </div>
              </div>
            </div>
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
import albumsService from '../services/albumsService';

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
      sharedAlbums: [],
      loading: true,
      error: null,
      
      // Shared files related data
      sharedFiles: [],
      loadingFiles: false,
      
      // Timeline related data
      timeline: [],
      loadingTimeline: false,
      timelineData: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0
      },
      
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
      processing: false,
      
      // API URL
      apiBaseUrl: 'http://localhost:3000/api'
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
  async created() {
    try {
      await this.loadCircleDetails();
      await this.loadSharedAlbums();
      await this.loadSharedFiles();
      await this.loadTimeline();
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
    
    async loadSharedAlbums() {
      try {
        // Get all albums shared with this circle using the service
        this.sharedAlbums = await albumsService.getAlbumsSharedWithCircle(this.id);
      } catch (error) {
        console.error('Error loading shared albums:', error);
      }
    },
    
    async loadSharedFiles() {
      try {
        this.loadingFiles = true;
        // Get all files shared with this circle using the service
        this.sharedFiles = await circlesService.getCircleSharedFiles(this.id);
      } catch (error) {
        console.error('Error loading shared files:', error);
      } finally {
        this.loadingFiles = false;
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
    },
    async loadTimeline() {
      try {
        this.loadingTimeline = true;
        
        const response = await circlesService.getCircleTimeline(this.id, { 
          page: this.timelineData.page,
          limit: this.timelineData.limit
        });
        
        this.timeline = response.timeline;
        this.timelineData = {
          page: response.page,
          limit: response.limit,
          totalItems: response.totalItems,
          totalPages: response.totalPages
        };
      } catch (error) {
        console.error('Error loading timeline:', error);
      } finally {
        this.loadingTimeline = false;
      }
    },
    
    changePage(page) {
      this.timelineData.page = page;
      this.loadTimeline();
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

.make-admin-btn {
  color: #f6b93b;
}

.make-admin-btn:hover {
  color: #f6b93b;
  background-color: rgba(246, 185, 59, 0.1);
  transform: scale(1.1);
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

/* Albums section */
.albums-container {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.album-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.album-thumbnail {
  height: 150px;
  overflow: hidden;
  position: relative;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-thumbnail-image {
  transform: scale(1.05);
}

.album-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.album-info {
  padding: 1.2rem;
}

.album-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin: 0 0 0.3rem 0;
}

.album-owner {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Shared Files Section */
.files-container {
  margin-top: 2rem;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.file-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.file-thumbnail {
  height: 150px;
  overflow: hidden;
  position: relative;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.file-card:hover .file-thumbnail-image {
  transform: scale(1.05);
}

.file-info {
  padding: 1.2rem;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin: 0 0 0.3rem 0;
}

.file-owner {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Timeline Component Styles */
.timeline-container {
  margin-bottom: 2rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--primary-color);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.username {
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.activity-content {
  padding: 1.5rem;
}

.album-activity {
  margin-bottom: 1.5rem;
}

.album-activity:last-child {
  margin-bottom: 0;
}

.album-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.album-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  margin-right: 1rem;
}

.album-count {
  font-size: 0.875rem;
  color: var(--primary-color);
  margin-right: auto;
}

.view-album-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.album-previews {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.album-preview-thumbnail {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.album-preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-preview-thumbnail:hover img {
  transform: scale(1.05);
}

.album-no-previews {
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.pagination-btn {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: var(--color-hover);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-info {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style> 