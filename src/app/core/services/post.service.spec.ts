import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { PostService } from './post.service';
import { AuthService } from './auth.service';
import { FIREBASE_CONFIG, type FirebaseConfig } from '../config/firebase.config';
import type { FirebaseUser } from '../types/user.model';
import type { EditedPost, FirebasePost, NewPost, Post } from '../types/post.model';

// ─── HELPERS ──────────────────────────────────────────────────────────

const TEST_DB_URL = 'https://test-db.firebaseio.com';

const testFirebaseConfig: FirebaseConfig = {
  apiKey: 'test-api-key',
  databaseURL: TEST_DB_URL,
};

function createFirebaseUser(overrides: Partial<FirebaseUser> = {}): FirebaseUser {
  return {
    localId: 'uid-123',
    email: 'test@example.com',
    idToken: 'token-abc',
    expirationDate: new Date(Date.now() + 3600_000),
    ...overrides,
  };
}

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    title: 'Test post',
    description: 'A description',
    content: 'Some content',
    created_at: '2025-06-01T12:00:00.000Z',
    commentsCount: 0,
    likesCount: 0,
    userId: 'uid-123',
    userUsername: 'testuser',
    userFirstName: 'Test',
    userLastName: 'User',
    userIsVerified: false,
    ...overrides,
  };
}

function createFirebaseResponse(posts: Post[]): { [key: string]: FirebasePost } {
  const res: { [key: string]: FirebasePost } = {};
  for (const p of posts) {
    const { id, ...rest } = p;
    res[id] = rest;
  }
  return res;
}

// ─── TEST SUITE ───────────────────────────────────────────────────────

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  let authUserSignal: ReturnType<typeof signal<FirebaseUser | null>>;

  beforeEach(() => {
    vi.useFakeTimers();
    authUserSignal = signal<FirebaseUser | null>(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { authenticatedUser: authUserSignal },
        },
        { provide: FIREBASE_CONFIG, useValue: testFirebaseConfig },
      ],
    });

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  //  Signal setters / updaters
  // ═══════════════════════════════════════════════════════════════

  describe('signal management', () => {
    it('setAuthUserPosts replaces the auth user posts signal', () => {
      const posts = [createPost({ id: 'a' }), createPost({ id: 'b' })];

      service.setAuthUserPosts(posts);

      expect(service.authUserPostsReadonly()).toEqual(posts);
    });

    it('updateAuthUserPosts applies an updater function', () => {
      service.setAuthUserPosts([createPost({ id: 'a' })]);

      service.updateAuthUserPosts((posts) => [...posts, createPost({ id: 'b' })]);

      expect(service.authUserPostsReadonly()).toHaveLength(2);
    });

    it('setUserPost sets a single post', () => {
      const post = createPost({ id: 'x' });

      service.setUserPost(post);

      expect(service.userPostReadonly()).toEqual(post);
    });

    it('setUserPost accepts null', () => {
      service.setUserPost(createPost());
      service.setUserPost(null);

      expect(service.userPostReadonly()).toBeNull();
    });

    it('setSavedPostsIds replaces the saved posts IDs', () => {
      service.setSavedPostsIds(['p1', 'p2']);

      expect(service.loadedSavedPostsIds()).toEqual(['p1', 'p2']);
    });

    it('setLikedPostsIds replaces the liked posts IDs', () => {
      service.setLikedPostsIds(['p3', 'p4']);

      expect(service.loadedLikedPostsIds()).toEqual(['p3', 'p4']);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  fetchAllPosts
  // ═══════════════════════════════════════════════════════════════

  describe('fetchAllPosts', () => {
    it('maps Firebase response to an array of Post objects', () => {
      const posts = [
        createPost({ id: 'p1', title: 'First' }),
        createPost({ id: 'p2', title: 'Second' }),
      ];

      let result: Post[] = [];
      service.fetchAllPosts().subscribe((p) => (result = p));

      const req = httpMock.expectOne(`${TEST_DB_URL}/posts.json`);
      expect(req.request.method).toBe('GET');
      req.flush(createFirebaseResponse(posts));
      vi.advanceTimersByTime(500);

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(result[0].title).toBe('First');
    });

    it('sets the allLoadedPosts signal after fetching', () => {
      const posts = [createPost({ id: 'p1' })];

      service.fetchAllPosts().subscribe();

      httpMock.expectOne(`${TEST_DB_URL}/posts.json`).flush(createFirebaseResponse(posts));
      vi.advanceTimersByTime(500);

      expect(service.allLoadedPosts()).toHaveLength(1);
      expect(service.allLoadedPosts()[0].id).toBe('p1');
    });

    it('returns an empty array when the response is null', () => {
      let result: Post[] | undefined;
      service.fetchAllPosts().subscribe((p) => (result = p));

      httpMock.expectOne(`${TEST_DB_URL}/posts.json`).flush(null);
      vi.advanceTimersByTime(500);

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  fetchPostsByUser
  // ═══════════════════════════════════════════════════════════════

  describe('fetchPostsByUser', () => {
    const userId = 'uid-456';
    const expectedUrl = `${TEST_DB_URL}/posts.json?orderBy="userId"&equalTo="${userId}"`;

    it('fetches posts filtered by user ID', () => {
      const posts = [createPost({ id: 'p1', userId })];

      let result: Post[] = [];
      service.fetchPostsByUser(userId).subscribe((p) => (result = p));

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(createFirebaseResponse(posts));
      vi.advanceTimersByTime(500);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
    });

    it('sorts posts newest first', () => {
      const older = createPost({ id: 'old', userId, created_at: '2025-01-01T00:00:00Z' });
      const newer = createPost({ id: 'new', userId, created_at: '2025-06-01T00:00:00Z' });

      let result: Post[] = [];
      service.fetchPostsByUser(userId).subscribe((p) => (result = p));

      httpMock.expectOne(expectedUrl).flush(createFirebaseResponse([older, newer]));
      vi.advanceTimersByTime(500);

      expect(result[0].id).toBe('new');
      expect(result[1].id).toBe('old');
    });

    it('sets genericUserPosts signal when isAuthUser is false', () => {
      service.fetchPostsByUser(userId, false).subscribe();

      httpMock.expectOne(expectedUrl).flush(createFirebaseResponse([createPost({ id: 'g1', userId })]));
      vi.advanceTimersByTime(500);

      expect(service.genericUserPostsReadonly()).toHaveLength(1);
    });

    it('sets authUserPosts signal when isAuthUser is true', () => {
      service.fetchPostsByUser(userId, true).subscribe();

      httpMock.expectOne(expectedUrl).flush(createFirebaseResponse([createPost({ id: 'a1', userId })]));
      vi.advanceTimersByTime(500);

      expect(service.authUserPostsReadonly()).toHaveLength(1);
    });

    it('returns empty array when response is null', () => {
      let result: Post[] | undefined;
      service.fetchPostsByUser(userId).subscribe((p) => (result = p));

      httpMock.expectOne(expectedUrl).flush(null);
      vi.advanceTimersByTime(500);

      expect(result).toEqual([]);
    });

    it('propagates a descriptive error on HTTP failure', () => {
      let error: Error | undefined;
      service.fetchPostsByUser(userId).subscribe({
        error: (e) => (error = e),
      });

      httpMock.expectOne(expectedUrl).error(new ProgressEvent('error'));

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toContain('Errore durante il caricamento dei post');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  fetchPost
  // ═══════════════════════════════════════════════════════════════

  describe('fetchPost', () => {
    const postId = 'post-42';
    const expectedUrl = `${TEST_DB_URL}/posts/${postId}.json`;

    it('fetches a single post and attaches the ID', () => {
      const { id, ...firebaseData } = createPost({ id: postId, title: 'My Post' });

      let result: Post | null | undefined;
      service.fetchPost(postId).subscribe((p) => (result = p));

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(firebaseData);
      vi.advanceTimersByTime(500);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(postId);
      expect(result!.title).toBe('My Post');
    });

    it('sets the userPost signal', () => {
      const { id, ...firebaseData } = createPost({ id: postId });

      service.fetchPost(postId).subscribe();
      httpMock.expectOne(expectedUrl).flush(firebaseData);
      vi.advanceTimersByTime(500);

      expect(service.userPostReadonly()?.id).toBe(postId);
    });

    it('returns null when response is null', () => {
      let result: Post | null | undefined = undefined;
      service.fetchPost(postId).subscribe((p) => (result = p));

      httpMock.expectOne(expectedUrl).flush(null);
      vi.advanceTimersByTime(500);

      expect(result).toBeNull();
    });

    it('propagates a descriptive error on HTTP failure', () => {
      let error: Error | undefined;
      service.fetchPost(postId).subscribe({ error: (e) => (error = e) });

      httpMock.expectOne(expectedUrl).error(new ProgressEvent('error'));

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toContain('Errore durante il caricamento dei post');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  createPost
  // ═══════════════════════════════════════════════════════════════

  describe('createPost', () => {
    const user = createFirebaseUser();
    const newPost: NewPost = {
      title: 'New Title',
      description: 'New Desc',
      content: 'New Content',
      created_at: '2025-06-01T12:00:00Z',
      userId: user.localId,
      userUsername: 'testuser',
      userFirstName: 'Test',
      userLastName: 'User',
      userIsVerified: false,
    };

    beforeEach(() => {
      authUserSignal.set(user);
    });

    it('returns EMPTY when user is not authenticated', () => {
      authUserSignal.set(null);
      let emitted = false;

      service.createPost(newPost).subscribe({ next: () => (emitted = true) });

      expect(emitted).toBe(false);
    });

    it('creates a post via POST then performs a multi-location PATCH', () => {
      const generatedId = '-NfakePostId';

      let result: Post | undefined;
      service.createPost(newPost).subscribe((p) => (result = p));

      const postReq = httpMock.expectOne(
        `${TEST_DB_URL}/posts.json?auth=${user.idToken}`,
      );
      expect(postReq.request.method).toBe('POST');
      postReq.flush({ name: generatedId });

      const patchReq = httpMock.expectOne(
        `${TEST_DB_URL}/.json?auth=${user.idToken}`,
      );
      expect(patchReq.request.method).toBe('PATCH');

      const body = patchReq.request.body;
      expect(body[`posts/${generatedId}`]).toBeDefined();
      expect(body[`user-posts/${user.localId}/${generatedId}`]).toBe(true);
      patchReq.flush({});
      vi.advanceTimersByTime(500);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(generatedId);
      expect(result!.title).toBe('New Title');
      expect(result!.likesCount).toBe(0);
      expect(result!.commentsCount).toBe(0);
    });

    it('updates allLoadedPosts and authUserPosts signals after creation', () => {
      service.createPost(newPost).subscribe();

      httpMock
        .expectOne(`${TEST_DB_URL}/posts.json?auth=${user.idToken}`)
        .flush({ name: '-Nid' });
      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .flush({});
      vi.advanceTimersByTime(500);

      expect(service.allLoadedPosts()).toHaveLength(1);
      expect(service.authUserPostsReadonly()).toHaveLength(1);
    });

    it('prepends the new post to existing posts', () => {
      const existing = createPost({ id: 'existing' });
      service.setAuthUserPosts([existing]);

      service.createPost(newPost).subscribe();

      httpMock
        .expectOne(`${TEST_DB_URL}/posts.json?auth=${user.idToken}`)
        .flush({ name: '-Nnew' });
      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .flush({});
      vi.advanceTimersByTime(500);

      expect(service.authUserPostsReadonly()[0].id).toBe('-Nnew');
      expect(service.authUserPostsReadonly()[1].id).toBe('existing');
    });

    it('propagates a descriptive error on HTTP failure', () => {
      let error: Error | undefined;
      service.createPost(newPost).subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/posts.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toContain('Errore durante la creazione del post');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  deletePost
  // ═══════════════════════════════════════════════════════════════

  describe('deletePost', () => {
    const user = createFirebaseUser();
    const postId = 'post-to-delete';

    beforeEach(() => {
      authUserSignal.set(user);
    });

    it('returns EMPTY when user is not authenticated', () => {
      authUserSignal.set(null);
      let emitted = false;

      service.deletePost(postId).subscribe({ next: () => (emitted = true) });

      expect(emitted).toBe(false);
    });

    it('sends a PATCH with null values to remove post and user-post entry', () => {
      service.deletePost(postId).subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.method).toBe('PATCH');

      const body = req.request.body;
      expect(body[`posts/${postId}`]).toBeNull();
      expect(body[`user-posts/${user.localId}/${postId}`]).toBeNull();
      req.flush({});
    });

    it('removes the post from allLoadedPosts and authUserPosts signals', () => {
      const post = createPost({ id: postId });
      const otherPost = createPost({ id: 'other' });

      service.setAuthUserPosts([post, otherPost]);

      service.deletePost(postId).subscribe();
      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);

      expect(service.authUserPostsReadonly().map((p) => p.id)).toEqual(['other']);
    });

    it('propagates a descriptive error on HTTP failure', () => {
      let error: Error | undefined;
      service.deletePost(postId).subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toContain("Errore durante l'eliminazione del post");
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  editPost
  // ═══════════════════════════════════════════════════════════════

  describe('editPost', () => {
    const user = createFirebaseUser();
    const postId = 'post-to-edit';
    const editedPost: EditedPost = {
      title: 'Updated Title',
      description: 'Updated Description',
      content: 'Updated Content',
    };

    beforeEach(() => {
      authUserSignal.set(user);
    });

    it('returns EMPTY when user is not authenticated', () => {
      authUserSignal.set(null);
      let emitted = false;

      service.editPost(postId, editedPost).subscribe({ next: () => (emitted = true) });

      expect(emitted).toBe(false);
    });

    it('sends a PATCH with per-field updates', () => {
      service.editPost(postId, editedPost).subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.method).toBe('PATCH');

      const body = req.request.body;
      expect(body[`posts/${postId}/title`]).toBe('Updated Title');
      expect(body[`posts/${postId}/description`]).toBe('Updated Description');
      expect(body[`posts/${postId}/content`]).toBe('Updated Content');
      req.flush({});
    });

    it('updates the post in authUserPosts signal after editing', () => {
      const original = createPost({ id: postId, title: 'Old Title' });
      service.setAuthUserPosts([original]);

      service.editPost(postId, editedPost).subscribe();
      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);

      const updated = service.authUserPostsReadonly().find((p) => p.id === postId);
      expect(updated?.title).toBe('Updated Title');
    });

    it('does not affect other posts in the signal', () => {
      const target = createPost({ id: postId, title: 'Old' });
      const other = createPost({ id: 'other', title: 'Untouched' });
      service.setAuthUserPosts([target, other]);

      service.editPost(postId, editedPost).subscribe();
      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);

      const otherPost = service.authUserPostsReadonly().find((p) => p.id === 'other');
      expect(otherPost?.title).toBe('Untouched');
    });

    it('propagates a descriptive error on HTTP failure', () => {
      let error: Error | undefined;
      service.editPost(postId, editedPost).subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toContain('Errore durante la modifica del post');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  savePostAction
  // ═══════════════════════════════════════════════════════════════

  describe('savePostAction', () => {
    const user = createFirebaseUser();
    const postId = 'post-to-save';

    beforeEach(() => {
      authUserSignal.set(user);
    });

    it('returns EMPTY when user has no token', () => {
      authUserSignal.set(null);
      let emitted = false;

      service.savePostAction(postId, 'save').subscribe({ next: () => (emitted = true) });

      expect(emitted).toBe(false);
    });

    it('sends a PATCH with true when saving a post', () => {
      service.savePostAction(postId, 'save').subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.body[`user-saved-posts/${user.localId}/${postId}`]).toBe(true);
      req.flush({});
    });

    it('sends a PATCH with null when unsaving a post', () => {
      service.savePostAction(postId, 'unsave').subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.body[`user-saved-posts/${user.localId}/${postId}`]).toBeNull();
      req.flush({});
    });

    it('adds the post ID to savedPostsIds signal on save', () => {
      service.savePostAction(postId, 'save').subscribe();
      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);

      expect(service.loadedSavedPostsIds()).toContain(postId);
    });

    it('removes the post ID from savedPostsIds signal on unsave', () => {
      service.setSavedPostsIds([postId, 'other']);

      service.savePostAction(postId, 'unsave').subscribe();
      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);

      expect(service.loadedSavedPostsIds()).not.toContain(postId);
      expect(service.loadedSavedPostsIds()).toContain('other');
    });

    it('propagates a descriptive error on save failure', () => {
      let error: Error | undefined;
      service.savePostAction(postId, 'save').subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(error!.message).toContain("Errore durante l'aggiunta del post ai preferiti");
    });

    it('propagates a descriptive error on unsave failure', () => {
      let error: Error | undefined;
      service.savePostAction(postId, 'unsave').subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(error!.message).toContain('Errore durante la rimozione del post dai preferiti');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  likePostAction
  // ═══════════════════════════════════════════════════════════════

  describe('likePostAction', () => {
    const user = createFirebaseUser();
    const postId = 'post-to-like';

    beforeEach(() => {
      authUserSignal.set(user);
    });

    it('returns EMPTY when user has no token', () => {
      authUserSignal.set(null);
      let emitted = false;

      service.likePostAction(postId, 'like').subscribe({ next: () => (emitted = true) });

      expect(emitted).toBe(false);
    });

    it('optimistically adds the post ID to likedPostsIds before HTTP completes', () => {
      service.likePostAction(postId, 'like').subscribe();

      expect(service.loadedLikedPostsIds()).toContain(postId);

      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);
    });

    it('optimistically removes the post ID from likedPostsIds before HTTP completes', () => {
      service.setLikedPostsIds([postId]);

      service.likePostAction(postId, 'unlike').subscribe();

      expect(service.loadedLikedPostsIds()).not.toContain(postId);

      httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`).flush({});
      vi.advanceTimersByTime(500);
    });

    it('sends a PATCH with true when liking', () => {
      service.likePostAction(postId, 'like').subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.body[`user-liked-posts/${user.localId}/${postId}`]).toBe(true);
      req.flush({});
    });

    it('sends a PATCH with null when unliking', () => {
      service.likePostAction(postId, 'unlike').subscribe();

      const req = httpMock.expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`);
      expect(req.request.body[`user-liked-posts/${user.localId}/${postId}`]).toBeNull();
      req.flush({});
    });

    it('rolls back likedPostsIds on like failure', () => {
      service.setLikedPostsIds([]);

      let error: Error | undefined;
      service.likePostAction(postId, 'like').subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(service.loadedLikedPostsIds()).not.toContain(postId);
      expect(error!.message).toContain('Errore imprevisto');
    });

    it('rolls back likedPostsIds on unlike failure', () => {
      service.setLikedPostsIds([postId]);

      let error: Error | undefined;
      service.likePostAction(postId, 'unlike').subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne(`${TEST_DB_URL}/.json?auth=${user.idToken}`)
        .error(new ProgressEvent('error'));

      expect(service.loadedLikedPostsIds()).toContain(postId);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  fetchSavedPostsIds
  // ═══════════════════════════════════════════════════════════════

  describe('fetchSavedPostsIds', () => {
    const user = createFirebaseUser();

    it('returns empty array and clears signal when user is not authenticated', () => {
      authUserSignal.set(null);
      service.setSavedPostsIds(['leftover']);

      let result: string[] | undefined;
      service.fetchSavedPostsIds().subscribe((ids) => (result = ids));

      expect(result).toEqual([]);
      expect(service.loadedSavedPostsIds()).toEqual([]);
    });

    it('fetches saved post IDs and sets the signal', () => {
      authUserSignal.set(user);

      service.fetchSavedPostsIds().subscribe();

      const req = httpMock.expectOne(
        `${TEST_DB_URL}/user-saved-posts/${user.localId}.json`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ 'post-a': true, 'post-b': true });

      expect(service.loadedSavedPostsIds()).toEqual(['post-a', 'post-b']);
    });

    it('returns empty array when Firebase returns null', () => {
      authUserSignal.set(user);

      let result: string[] | undefined;
      service.fetchSavedPostsIds().subscribe((ids) => (result = ids));

      httpMock
        .expectOne(`${TEST_DB_URL}/user-saved-posts/${user.localId}.json`)
        .flush(null);

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  fetchLikedPostsIds
  // ═══════════════════════════════════════════════════════════════

  describe('fetchLikedPostsIds', () => {
    const user = createFirebaseUser();

    it('returns empty array and clears signal when user is not authenticated', () => {
      authUserSignal.set(null);
      service.setLikedPostsIds(['leftover']);

      let result: string[] | undefined;
      service.fetchLikedPostsIds().subscribe((ids) => (result = ids));

      expect(result).toEqual([]);
      expect(service.loadedLikedPostsIds()).toEqual([]);
    });

    it('fetches liked post IDs and sets the signal', () => {
      authUserSignal.set(user);

      service.fetchLikedPostsIds().subscribe();

      const req = httpMock.expectOne(
        `${TEST_DB_URL}/user-liked-posts/${user.localId}.json`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ 'post-x': true, 'post-y': true });

      expect(service.loadedLikedPostsIds()).toEqual(['post-x', 'post-y']);
    });

    it('returns empty array when Firebase returns null', () => {
      authUserSignal.set(user);

      let result: string[] | undefined;
      service.fetchLikedPostsIds().subscribe((ids) => (result = ids));

      httpMock
        .expectOne(`${TEST_DB_URL}/user-liked-posts/${user.localId}.json`)
        .flush(null);

      expect(result).toEqual([]);
    });
  });
});
