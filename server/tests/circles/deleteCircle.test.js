/**
 * Tests for DELETE /api/circles/:id endpoint
 * Verifies that circle IDs are properly removed from albums when a circle is deleted
 */

const tap = require('tap');
const { build } = require('../helper');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../../routes/utils/db');

// Mock user data for authentication
const mockUser = {
    _id: new ObjectId(),
    email: 'test@example.com',
    name: 'Test User'
};

// Mock circle data
const mockCircle = {
    _id: new ObjectId(),
    name: 'Test Circle',
    description: 'A test circle',
    adminIds: [mockUser._id],
    memberIds: [mockUser._id],
    invitations: []
};

// Mock album data with reference to the circle
const mockAlbum = {
    _id: new ObjectId(),
    name: 'Test Album',
    userId: mockUser._id.toString(),
    circleIds: [mockCircle._id.toString()]
};

tap.test('DELETE /api/circles/:id - Circle deletion with album cleanup', async (t) => {
    // Build the app with authentication mocked
    const app = await build(t, {
        auth: {
            verify: () => Promise.resolve(mockUser)
        }
    });

    // Insert test data directly into the database
    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const circlesCollection = getCollection(db, 'circles');
    
        await circlesCollection.insertOne(mockCircle);
        await albumsCollection.insertOne(mockAlbum);
    
        // Make the request to delete the circle
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/circles/${mockCircle._id}`,
            headers: {
                authorization: 'Bearer valid-token'
            }
        });
    
        // Check the response
        t.equal(response.statusCode, 200);
        t.match(JSON.parse(response.payload), {
            success: true,
            affectedAlbums: 1
        });
    
        // Verify the circle is deleted
        const deletedCircle = await circlesCollection.findOne({ _id: mockCircle._id });
        t.equal(deletedCircle, null, 'Circle should be deleted');
    
        // Verify the album no longer references the circle
        const updatedAlbum = await albumsCollection.findOne({ _id: mockAlbum._id });
        t.equal(updatedAlbum.circleIds.includes(mockCircle._id.toString()), false, 'Album should not reference the deleted circle');
        t.equal(updatedAlbum.circleIds.length, 0, 'CircleIds array should be empty');
    
    } catch (error) {
        t.error(error);
    }
}); 