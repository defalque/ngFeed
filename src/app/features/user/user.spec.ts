import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { User } from './user';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';
import { ToastService } from '@/core/services/toast.service';
import { ModalService } from '@/core/services/modal.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import type { FirebaseUser } from '@/core/types/user.model';

/** Stub child component for the router outlet; avoids pulling in UserPosts and its dependencies */
@Component({ standalone: true, template: '' })
class StubOutletChild {}

describe('User', () => {
  let harness: RouterTestingHarness;
  let userService: UserService;

  /** Authenticated user fixture for tests that simulate visiting own profile vs another user's profile */
  const mockAuthUser: FirebaseUser = {
    localId: 'current-user-789',
    idToken: 'token',
    email: 'test@test.com',
    expirationDate: new Date(Date.now() + 3600000),
  };

  /** Auth service mock; component decides which fetch to call based on id vs authenticatedUser.localId */
  const mockAuthService = {
    authenticatedUser: signal<FirebaseUser | null>(null),
    isAuthenticated: signal(false),
  };

  /** User service mock with no preloaded user data; spies can verify fetchAuthUserInfo / fetchUserInfo calls */
  const mockUserService = {
    loadedCurrentUser: signal(null),
    loadedGenericUser: signal(null),
    loadedFollowedIds: signal([] as string[]),
    fetchAuthUserInfo: () => of(null),
    fetchUserInfo: () => of(null),
    followAction: () => of(null),
  };

  /** Route config: utente/:id binds the id param to the User component's input via withComponentInputBinding */
  const userRouteConfig = [
    {
      path: 'utente/:id',
      component: User,
      children: [{ path: '', pathMatch: 'full' as const, component: StubOutletChild }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [User, StubOutletChild],
      providers: [
        provideRouter(userRouteConfig, withComponentInputBinding()),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: ToastService, useValue: { show: () => {} } },
        { provide: ModalService, useValue: { openDialog: () => {} } },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    userService = TestBed.inject(UserService);
    harness = await RouterTestingHarness.create();
  });

  it('should create when navigating to user route', async () => {
    const component = await harness.navigateByUrl('/utente/user-123', User);
    expect(component).toBeTruthy();
  });

  /** Route param `id` comes from utente/:id and is bound via input.required<string>() */
  describe('route parameter (id)', () => {
    it('should receive and use the id route parameter from URL', async () => {
      const testId = 'abc123-user-id';
      const component = await harness.navigateByUrl(`/utente/${testId}`, User);

      expect(component.id()).toBe(testId);
    });

    it('should call loadUserInfo when id differs from authenticated user', async () => {
      // Visiting another user's profile: id !== auth localId → fetch generic user
      const otherUserId = 'other-user-456';
      mockAuthService.authenticatedUser.set(mockAuthUser);

      const fetchSpy = vi.spyOn(userService, 'fetchUserInfo').mockReturnValue(of(null));

      await harness.navigateByUrl(`/utente/${otherUserId}`, User);

      expect(fetchSpy).toHaveBeenCalledWith(otherUserId);
    });

    it('should call loadAuthUserInfo when id matches authenticated user', async () => {
      // Visiting own profile: id === auth localId → fetch authenticated user
      mockAuthService.authenticatedUser.set(mockAuthUser);

      const fetchSpy = vi.spyOn(userService, 'fetchAuthUserInfo').mockReturnValue(of(null));

      await harness.navigateByUrl(`/utente/${mockAuthUser.localId}`, User);

      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should update id when navigating to a different user', async () => {
      // Simulates navigating from /utente/first-id to /utente/second-id
      let component = await harness.navigateByUrl('/utente/first-id', User);
      expect(component.id()).toBe('first-id');

      component = await harness.navigateByUrl('/utente/second-id', User);
      expect(component.id()).toBe('second-id');
    });
  });
});
