# Software Testing Reference

A comprehensive, experience-driven guide for writing high-quality, maintainable, and effective tests in professional software development.

---

## Table of Contents

1. [Introduction to Software Testing](#1-introduction-to-software-testing)
2. [Testing Levels](#2-testing-levels)
3. [The Testing Pyramid](#3-the-testing-pyramid)
4. [Characteristics of "Perfect" Tests](#4-characteristics-of-perfect-tests)
5. [Writing High-Quality Unit Tests](#5-writing-high-quality-unit-tests)
6. [Test Doubles](#6-test-doubles)
7. [Testing Strategies](#7-testing-strategies)
8. [Flaky Tests](#8-flaky-tests)
9. [Test Architecture and Project Organization](#9-test-architecture-and-project-organization)
10. [CI/CD and Testing](#10-cicd-and-testing)
11. [Anti-Patterns in Testing](#11-anti-patterns-in-testing)
12. [Code Examples: Bad to Good](#12-code-examples-bad-to-good)
13. [Checklist: How to Evaluate If a Test Is "Perfect"](#13-checklist-how-to-evaluate-if-a-test-is-perfect)
14. [Summary of Key Principles](#14-summary-of-key-principles)
15. [Golden Rules of Testing](#15-golden-rules-of-testing)
16. [Incremental Improvement Roadmap](#16-incremental-improvement-roadmap)

---

## 1. Introduction to Software Testing

### 1.1 Why Testing Matters

Tests are not a tax on development — they are the **engineering specification** for your system. A test suite is the only artifact in your codebase that simultaneously documents intended behavior, verifies correctness, and protects against regression.

Code without tests is code that you are **afraid to change**. That fear slows teams, discourages refactoring, and causes technical debt to compound. Teams with strong test suites ship faster because they can change code with confidence rather than hope.

Testing matters because:

- **Correctness**: Tests prove that the code does what it should, catching defects before users do.
- **Regression safety**: When you modify one part of the system, tests in other parts tell you if something broke.
- **Documentation**: A well-named test is the most accurate spec — it never drifts out of sync with the code because it *runs* against the code.
- **Design feedback**: Code that is hard to test is usually poorly designed. Tests push you toward smaller functions, clearer interfaces, and better separation of concerns.

### 1.2 Cost of Bugs and Technical Debt

The IBM Systems Sciences Institute and multiple industry studies have consistently shown that the cost of fixing a defect increases **exponentially** the later it is caught:

| Phase Discovered  | Relative Cost |
|-------------------|---------------|
| During development (unit test) | 1x |
| During integration testing     | 5–10x |
| During system/QA testing       | 15–40x |
| In production                  | 50–150x |

A bug found by a unit test costs you minutes. The same bug found in production costs incident response time, customer trust, potential data corruption, rollback coordination, and a hotfix cycle that disrupts whatever your team was actually planning to work on.

Technical debt from inadequate testing accumulates silently. Each untested path is a landmine. Over months and years, teams without tests slow to a crawl — not because the developers are slow, but because every change requires manual verification and carries implicit risk.

### 1.3 Testing as Design Feedback

One of the most underappreciated benefits of writing tests is the feedback loop they provide about your code's **design quality**.

If you find yourself needing to:

- Mock 8 dependencies to test a single function → your function has too many responsibilities.
- Set up 50 lines of state before calling the function under test → your function depends on too much context.
- Reach into private internals to verify behavior → your public API doesn't express enough about what the code does.
- Write 30 tests for a single function → the function is doing too many things.

**Tests are the first client of your code.** If they struggle to use it, your real callers will too. Treat difficulty in testing as a design smell, not as a reason to skip tests.

---

## 2. Testing Levels

### 2.1 Unit Tests

**Scope**: A single function, method, class, or component in isolation.

**Purpose**: Verify that an individual unit of logic behaves correctly for given inputs. Unit tests are the most granular form of testing. They answer the question: "Does this piece of code do what it's supposed to do?"

**Characteristics**:
- Execute in milliseconds (a single unit test should be sub-10ms).
- No I/O, no network, no filesystem, no database.
- Dependencies are replaced with test doubles (see [Section 6](#6-test-doubles)).
- Typically the most numerous tests in a project.

```typescript
// Pure function — trivially testable
function calculateDiscount(price: number, discountPercent: number): number {
  if (price < 0 || discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid arguments');
  }
  return price * (1 - discountPercent / 100);
}

describe('calculateDiscount', () => {
  it('applies percentage discount correctly', () => {
    expect(calculateDiscount(100, 25)).toBe(75);
  });

  it('returns full price when discount is 0', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('returns 0 when discount is 100%', () => {
    expect(calculateDiscount(50, 100)).toBe(0);
  });

  it('throws on negative price', () => {
    expect(() => calculateDiscount(-10, 20)).toThrow('Invalid arguments');
  });
});
```

### 2.2 Integration Tests

**Scope**: The collaboration between two or more units — typically a service calling another service, a component interacting with a service, or application code interacting with a real database/API.

**Purpose**: Verify that units work correctly **together**. A passing unit test for module A and a passing unit test for module B does not guarantee that A and B communicate correctly. Integration tests catch interface mismatches, serialization issues, and assumption conflicts.

**Characteristics**:
- Slower than unit tests (hundreds of ms to seconds).
- May involve real I/O (an in-memory database, an HTTP test server, a filesystem).
- Use fewer test doubles — the point is to test the actual integration.

```typescript
// Integration: testing that UserService correctly interacts with HttpClient
describe('UserService (integration)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no unexpected HTTP calls were made
  });

  it('fetches a user by ID and maps the response', () => {
    const mockResponse = { id: '42', name: 'Alice', email: 'alice@example.com' };

    service.getUser('42').subscribe((user) => {
      expect(user.id).toBe('42');
      expect(user.name).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/users/42');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

### 2.3 End-to-End (E2E) Tests

**Scope**: The entire application from the user's perspective — browser, frontend, API, database.

**Purpose**: Verify that critical user journeys work from start to finish. E2E tests answer: "Can a user actually log in, create a post, and see it in their feed?"

**Characteristics**:
- The slowest and most expensive tests (seconds to minutes per test).
- Most brittle — they depend on the full stack being operational.
- Should cover **critical happy paths**, not every edge case.
- Tools: Playwright, Cypress, Puppeteer.

```typescript
// Playwright E2E example
test('user can log in and see their feed', async ({ page }) => {
  await page.goto('/auth');

  await page.getByLabel('Email').fill('alice@example.com');
  await page.getByLabel('Password').fill('securePassword123');
  await page.getByRole('button', { name: 'Accedi' }).click();

  await expect(page).toHaveURL('/per-te');
  await expect(page.getByText('Per te')).toBeVisible();
});
```

**Guideline**: If you have 500 unit tests, you might have 50 integration tests and 5–15 E2E tests. E2E tests exist to validate the glue, not to exhaustively test logic.

### 2.4 Contract Tests

**Scope**: The boundary between two services (typically a frontend and a backend, or two microservices).

**Purpose**: Verify that the consumer's expectations about an API match what the provider actually delivers — without requiring both services to be running simultaneously.

Contract tests are invaluable in microservice architectures. If Service A expects a `User` object with a `fullName` field and Service B renames it to `displayName`, contract tests catch this before deployment.

**Tools**: Pact, Spring Cloud Contract.

```typescript
// Consumer-side contract test (Pact-style)
describe('UserAPI contract', () => {
  it('expects GET /api/users/:id to return { id, name, email }', async () => {
    // The contract is defined as the expected request/response pair.
    // The Pact broker verifies it against the provider's actual behavior.
    await provider.addInteraction({
      state: 'user 42 exists',
      uponReceiving: 'a request for user 42',
      withRequest: { method: 'GET', path: '/api/users/42' },
      willRespondWith: {
        status: 200,
        body: {
          id: Matchers.string('42'),
          name: Matchers.string('Alice'),
          email: Matchers.email(),
        },
      },
    });
  });
});
```

### 2.5 Smoke Tests

**Scope**: A minimal, superficial check that the application is alive and its most critical paths are not catastrophically broken.

**Purpose**: Smoke tests are the first line of defense after a deployment. They verify that the app starts, renders, and can reach its critical dependencies (database, auth service, etc.). They are **not** thorough — they are fast.

Think of smoke tests as asking: "Is the building on fire?" not "Is every room clean?"

```typescript
describe('Smoke tests', () => {
  it('app component renders without crashing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

### 2.6 Regression Tests

**Scope**: Any test specifically written to prevent a **previously fixed bug** from reappearing.

**Purpose**: When a bug is reported and fixed, a regression test encodes that bug's exact scenario so that if the code ever regresses to the old behavior, the test catches it.

**Best practice**: Name the test after the bug ticket or describe the scenario explicitly.

```typescript
describe('PostService', () => {
  it('does not duplicate posts when refresh is called twice rapidly (BUG-1234)', () => {
    service.loadPosts();
    service.loadPosts(); // Rapid second call

    expect(service.posts().length).toBe(initialPosts.length);
  });
});
```

---

## 3. The Testing Pyramid

### 3.1 Concept and Rationale

The testing pyramid, introduced by Mike Cohn, is a model for balancing test types by cost and speed:

```
         /  E2E  \          ← Few: slow, expensive, brittle
        /----------\
       / Integration \      ← Some: moderate speed, real collaboration
      /----------------\
     /    Unit Tests     \  ← Many: fast, cheap, isolated
    /______________________\
```

The pyramid reflects a pragmatic reality:

- **Unit tests** are cheap to write, fast to run, and precise in locating failures. You want many of them.
- **Integration tests** validate that units work together. You need a moderate number.
- **E2E tests** are expensive and slow but ensure the system works end-to-end. You need only a few, covering critical journeys.

The shape is not aspirational — it is **economic**. Moving logic down the pyramid means faster feedback, cheaper maintenance, and easier debugging when something fails.

### 3.2 Trade-offs

| Property         | Unit Tests     | Integration Tests | E2E Tests        |
|-----------------|----------------|-------------------|------------------|
| Speed           | ms             | 100ms – seconds   | seconds – minutes|
| Cost to write   | Low            | Medium            | High             |
| Cost to maintain| Low            | Medium            | High             |
| Confidence      | Low–Medium     | Medium–High       | High             |
| Failure precision| Very high     | Medium            | Low              |
| Flakiness risk  | Very low       | Low–Medium        | High             |

No single level is sufficient. A system with only unit tests can have perfectly working parts that fail when composed. A system with only E2E tests is slow to run, hard to debug, and expensive to maintain.

### 3.3 Common Misinterpretations

**"We have 90% code coverage from E2E tests, so we're fine."**
No. E2E tests are too slow for rapid feedback, too coarse for precise failure diagnosis, and too brittle for reliable CI. Coverage percentage means nothing if the feedback loop is 30 minutes.

**"We should have zero E2E tests and rely entirely on unit tests."**
No. Unit tests cannot catch issues that emerge only from the interaction between components, configuration, routing, and real I/O. You need at least a handful of E2E tests for critical paths.

**"The pyramid must be followed exactly."**
No. The pyramid is a heuristic. Some systems (e.g., heavy UI applications with little business logic) may have a "trophy" shape with more integration tests. The key insight is: **push tests as low as possible** without losing confidence.

The **Testing Trophy** (coined by Kent C. Dodds) emphasizes integration tests as the sweet spot for frontend applications:

```
         /  E2E  \
        /----------\
       / Integration \      ← The "trophy" bulge
      /    (more)      \
     /------------------\
    /    Unit (fewer)     \
   /________________________\
        Static Analysis
```

For Angular apps with signals, services, and components, the trophy shape often fits better: test component+service interactions via integration tests, and reserve unit tests for pure logic.

---

## 4. Characteristics of "Perfect" Tests

A "perfect" test maximizes signal and minimizes noise. These are the qualities to aim for:

### 4.1 Deterministic

A test must produce the same result every time it runs, regardless of order, machine, or time of day. If a test passes 99 out of 100 runs, it is not 99% reliable — it is **0% trustworthy**, because you can never know if a failure is real or noise.

Common determinism killers: `Date.now()`, `Math.random()`, shared mutable state, race conditions, timeouts.

```typescript
// BAD: Non-deterministic
it('generates a recent timestamp', () => {
  const result = createEvent();
  expect(result.timestamp).toBeCloseTo(Date.now(), -2); // Flaky on slow machines
});

// GOOD: Deterministic via injection
it('uses the provided clock for timestamps', () => {
  const fixedNow = new Date('2025-06-15T12:00:00Z').getTime();
  const result = createEvent({ clock: () => fixedNow });
  expect(result.timestamp).toBe(fixedNow);
});
```

### 4.2 Fast

A unit test that takes 500ms is a slow unit test. In a suite of 500 tests, that's 4+ minutes — long enough for a developer to context-switch. Fast tests keep the feedback loop tight:

- **Unit tests**: < 10ms each.
- **Integration tests**: < 1 second each.
- **Total suite**: Should run in under 60 seconds locally, or developers will stop running it.

If your test needs `setTimeout` or `waitFor` with a large timeout, reconsider whether the design under test can be improved.

### 4.3 Isolated

Each test must stand on its own. It must not depend on the output of a previous test. It must not share mutable state with other tests. If you run tests in a random order and they all pass, your suite is properly isolated.

```typescript
// BAD: Shared mutable state
let counter = 0;

it('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});

it('checks counter', () => {
  expect(counter).toBe(1); // Fails if run order changes
});

// GOOD: Each test owns its state
it('increments counter', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

### 4.4 Readable

A test is read far more often than it is written. When a test fails, a developer who didn't write it should be able to understand:

1. What scenario is being tested (from the test name).
2. What the setup is (from the Arrange section).
3. What action is being performed (from the Act section).
4. What the expected outcome is (from the Assert section).

Prefer explicit values over abstractions in tests. Duplication in tests is often **preferable** to premature abstraction, because each test should tell a self-contained story.

### 4.5 Maintainable

A test is maintainable when:

- A legitimate refactor of the production code (changing *how* something works, not *what* it does) does not require updating the test.
- Adding a new field to a model does not break 50 unrelated tests.
- Changing a constructor parameter does not cascade through hundreds of test files.

Use factories and builders (see [Section 9](#9-test-architecture-and-project-organization)) to centralize object creation so that changes propagate from one place.

### 4.6 Focused on Behavior, Not Implementation

This is the single most important principle.

Tests that verify **what** the code does (behavior) survive refactoring. Tests that verify **how** the code does it (implementation) break on every refactor and provide little value.

```typescript
// BAD: Testing implementation details
it('calls Array.prototype.sort', () => {
  const spy = vi.spyOn(Array.prototype, 'sort');
  sortUsers(users);
  expect(spy).toHaveBeenCalled();
});

// GOOD: Testing behavior
it('returns users sorted by name alphabetically', () => {
  const users = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
  const result = sortUsers(users);
  expect(result.map((u) => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
});
```

### 4.7 Clear Arrange–Act–Assert Structure

Every test should follow the AAA pattern with visual separation:

```typescript
it('calculates total with tax', () => {
  // Arrange
  const items = [
    { name: 'Widget', price: 10, quantity: 2 },
    { name: 'Gadget', price: 25, quantity: 1 },
  ];
  const taxRate = 0.1;

  // Act
  const total = calculateTotal(items, taxRate);

  // Assert
  expect(total).toBe(49.5); // (10*2 + 25*1) * 1.1
});
```

One `Act` per test. If you have multiple `Act` steps, you probably have multiple tests merged into one.

---

## 5. Writing High-Quality Unit Tests

### 5.1 Naming Conventions

A test name should describe the **scenario** and the **expected outcome**. When a test fails in CI, its name is often the only thing a developer reads before deciding how to investigate.

**Patterns that work well**:

```
it('<does something> when <condition>')
it('<method/action> returns/throws <outcome> given <input/state>')
it('should <expected behavior> if <scenario>')
```

```typescript
// BAD: Vague
it('works correctly', () => { ... });
it('test 1', () => { ... });

// GOOD: Descriptive
it('returns an empty array when no posts match the filter', () => { ... });
it('throws AuthError when the token is expired', () => { ... });
it('disables the submit button while the form is invalid', () => { ... });
```

**Group related tests** with `describe` blocks that name the unit under test and, optionally, the scenario category:

```typescript
describe('PostService', () => {
  describe('deletePost', () => {
    it('removes the post from the local signal', () => { ... });
    it('sends a DELETE request to the API', () => { ... });
    it('throws NotFoundError if the post does not exist', () => { ... });
  });
});
```

### 5.2 Test Structure Patterns

#### One Concept Per Test

Each test should verify one logical behavior. This does not mean one `expect` — sometimes a single behavior requires checking multiple properties of the result.

```typescript
// GOOD: One concept (mapping), multiple related assertions
it('maps API response to User model', () => {
  const response = { id: '1', full_name: 'Alice Smith', is_verified: true };

  const user = mapToUser(response);

  expect(user.id).toBe('1');
  expect(user.name).toBe('Alice Smith');
  expect(user.verified).toBe(true);
});
```

#### Avoid Conditional Logic in Tests

Tests with `if`, `for`, `try/catch`, or complex logic are red flags. A test should be a straight line: set up, call, check.

```typescript
// BAD: Logic in test
it('handles all statuses', () => {
  for (const status of ['active', 'inactive', 'banned']) {
    const result = getStatusLabel(status);
    if (status === 'active') {
      expect(result).toBe('Active');
    } else if (status === 'inactive') {
      expect(result).toBe('Inactive');
    } else {
      expect(result).toBe('Banned');
    }
  }
});

// GOOD: Parameterized (see 5.5) or separate tests
it('returns "Active" for active status', () => {
  expect(getStatusLabel('active')).toBe('Active');
});

it('returns "Banned" for banned status', () => {
  expect(getStatusLabel('banned')).toBe('Banned');
});
```

### 5.3 Avoiding Logic Inside Tests

Your test should contain **zero** business logic. If your test duplicates the production code's logic to compute the expected value, you are testing that your copy of the algorithm matches the original — which proves nothing.

```typescript
// BAD: Duplicating production logic in the test
it('calculates the total', () => {
  const items = [{ price: 10, qty: 3 }, { price: 5, qty: 2 }];
  const expected = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Hard-coded expected value
it('calculates the total', () => {
  const items = [{ price: 10, qty: 3 }, { price: 5, qty: 2 }];
  expect(calculateTotal(items)).toBe(40);
});
```

### 5.4 Handling Edge Cases

Bugs cluster at boundaries. Systematically test:

- **Empty inputs**: empty arrays, empty strings, `null`, `undefined`.
- **Boundary values**: 0, 1, -1, `Number.MAX_SAFE_INTEGER`, maximum length.
- **Invalid inputs**: wrong types, malformed data, missing required fields.
- **State transitions**: first item, last item, transitioning from empty to non-empty.

```typescript
describe('paginate', () => {
  it('returns empty array for empty input', () => {
    expect(paginate([], 1, 10)).toEqual([]);
  });

  it('returns all items when total is less than page size', () => {
    expect(paginate([1, 2, 3], 1, 10)).toEqual([1, 2, 3]);
  });

  it('returns correct slice for middle page', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(paginate(items, 2, 3)).toEqual([4, 5, 6]);
  });

  it('returns remaining items on the last page', () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginate(items, 2, 3)).toEqual([4, 5]);
  });

  it('returns empty array for page beyond total', () => {
    expect(paginate([1, 2, 3], 5, 10)).toEqual([]);
  });
});
```

### 5.5 Parameterized Tests

When the same logic applies to multiple input/output pairs, use parameterized tests (called `it.each` in Vitest/Jest) to reduce duplication while maintaining clarity:

```typescript
describe('getStatusBadgeColor', () => {
  it.each([
    { status: 'active', expected: 'green' },
    { status: 'pending', expected: 'yellow' },
    { status: 'inactive', expected: 'gray' },
    { status: 'banned', expected: 'red' },
  ])('returns "$expected" for "$status" status', ({ status, expected }) => {
    expect(getStatusBadgeColor(status)).toBe(expected);
  });
});
```

**When to use**: Pure mapping functions, validators, formatters — anything where behavior is a table of inputs and outputs.

**When NOT to use**: Complex scenarios where each case has distinct setup. Parameterization should simplify, not obscure.

---

## 6. Test Doubles

Test doubles replace real dependencies to isolate the unit under test. Using the wrong type, or overusing them, is one of the most common sources of bad tests.

### 6.1 Stubs

A stub provides **canned answers** to calls made during the test. It does not verify that it was called — it simply returns what you tell it to.

**Use when**: You need a dependency to return specific data so the unit under test can proceed.

```typescript
// Stub: UserRepository always returns the same user
const userRepositoryStub = {
  findById: () => Promise.resolve({ id: '1', name: 'Alice' }),
};

it('returns the user profile', async () => {
  const service = new ProfileService(userRepositoryStub);
  const profile = await service.getProfile('1');
  expect(profile.name).toBe('Alice');
});
```

### 6.2 Mocks

A mock is pre-programmed with **expectations** — it verifies that it was called with the correct arguments, the correct number of times, and in the correct order. Mocks are about **behavior verification**.

**Use when**: The side effect *is* the behavior under test (e.g., "does this service send a notification?").

```typescript
it('sends a welcome email after registration', async () => {
  const emailService = { send: vi.fn().mockResolvedValue(undefined) };
  const service = new RegistrationService(emailService);

  await service.register({ email: 'alice@example.com', password: 'pass123' });

  expect(emailService.send).toHaveBeenCalledWith(
    'alice@example.com',
    expect.objectContaining({ subject: 'Welcome to ngFeed!' }),
  );
  expect(emailService.send).toHaveBeenCalledTimes(1);
});
```

### 6.3 Fakes

A fake is a **working implementation** that takes shortcuts unacceptable for production. An in-memory database is a fake. A fake HTTP server that stores data in a `Map` is a fake.

**Use when**: You need realistic behavior from a dependency but can't (or don't want to) use the real thing.

```typescript
class InMemoryPostRepository implements PostRepository {
  private posts = new Map<string, Post>();

  async save(post: Post): Promise<void> {
    this.posts.set(post.id, { ...post });
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) ?? null;
  }

  async findAll(): Promise<Post[]> {
    return [...this.posts.values()];
  }
}
```

Fakes are underused. They provide **high confidence** because they implement real contracts, and they are reusable across many tests.

### 6.4 Spies

A spy wraps a **real** method and records information about calls to it (arguments, call count, return values) without replacing the original behavior (unless explicitly configured to).

**Use when**: You want to verify that a real method was called while still allowing it to execute.

```typescript
it('logs analytics when a post is liked', () => {
  const spy = vi.spyOn(analyticsService, 'track');

  postService.likePost('post-42');

  expect(spy).toHaveBeenCalledWith('post_liked', { postId: 'post-42' });
  spy.mockRestore();
});
```

### 6.5 When to Use Each

| Double | Returns data? | Verifies calls? | Real behavior? | Use for                          |
|--------|:---:|:---:|:---:|----------------------------------|
| Stub   | Yes | No  | No  | Providing data to the unit under test |
| Mock   | Optional | Yes | No  | Verifying outgoing interactions  |
| Fake   | Yes | No  | Simplified | Complex dependencies needing realistic behavior |
| Spy    | Yes (real) | Yes | Yes | Observing real behavior          |

### 6.6 Risks of Over-Mocking

**Over-mocking** is the #1 testing anti-pattern. When you mock everything:

1. **Tests pass, but the code is broken**: Mocks return whatever you tell them. If the real dependency changes its interface, your mocked tests still pass — and production breaks.
2. **Tests are coupled to implementation**: If you assert that `repository.findById` was called with exactly `('42')`, renaming the method or changing the query strategy breaks the test even though the behavior hasn't changed.
3. **Tests become maintenance liabilities**: You spend more time maintaining mock setups than the tests are worth.

**Rule of thumb**: If the double is more complex than the thing it replaces, you've gone too far. Prefer stubs for queries and fakes for complex dependencies. Reserve mocks for verifying critical side effects.

---

## 7. Testing Strategies

### 7.1 TDD (Test-Driven Development)

TDD follows a strict cycle:

1. **Red**: Write a failing test for the next increment of behavior.
2. **Green**: Write the minimum code to make the test pass.
3. **Refactor**: Clean up the code while keeping all tests green.

**Why it works**: TDD forces you to think about the interface before the implementation. You write only as much code as the tests demand, avoiding over-engineering.

**Common misconception**: TDD is not about writing all tests first. It is a **feedback loop** — one test at a time, one behavior at a time.

```typescript
// Step 1 (Red): Write a failing test
it('returns "fizz" for multiples of 3', () => {
  expect(fizzBuzz(3)).toBe('fizz');
});

// Step 2 (Green): Minimal implementation
function fizzBuzz(n: number): string {
  if (n % 3 === 0) return 'fizz';
  return String(n);
}

// Step 3 (Refactor): Clean up if needed, run all tests
```

**When TDD is most valuable**: Business logic, algorithms, complex state machines, any code with clear input/output contracts.

**When TDD is less natural**: UI layout code, exploratory prototyping (but you should add tests before merging).

### 7.2 BDD (Behavior-Driven Development)

BDD extends TDD by framing tests in terms of **user behavior** rather than technical implementation. The language of BDD is: Given (context), When (action), Then (outcome).

```typescript
describe('Post creation', () => {
  it('given a logged-in user with a complete profile, when they submit a post, then it appears in the feed', () => {
    // Given
    const user = createUser({ name: 'Alice', username: 'alice' });
    loginAs(user);

    // When
    const post = submitPost({ content: 'Hello world!' });

    // Then
    expect(getFeed()).toContainEqual(expect.objectContaining({ content: 'Hello world!' }));
  });
});
```

BDD encourages communication between developers, QA, and product owners by using a shared language. The tests serve as living documentation of the system's behavior.

### 7.3 Property-Based Testing

Instead of manually choosing specific input/output pairs, property-based testing generates **random inputs** and verifies that certain properties always hold.

**Tools**: fast-check (TypeScript), Hypothesis (Python), QuickCheck (Haskell).

```typescript
import fc from 'fast-check';

describe('sort', () => {
  it('always returns an array of the same length', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        expect(sortArray(arr)).toHaveLength(arr.length);
      }),
    );
  });

  it('always returns elements in non-decreasing order', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = sortArray(arr);
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
        }
      }),
    );
  });
});
```

Property-based testing excels at finding edge cases you didn't think of — empty arrays, negative numbers, very large values, unicode strings.

### 7.4 Snapshot Testing

Snapshot testing captures the output of a component or function and compares it to a previously stored "snapshot." If the output changes, the test fails until the developer explicitly approves the change.

**When appropriate**:
- Serialized output (JSON, HTML) where manual assertions would be tedious and the exact structure matters.
- Catching unintentional changes in component rendering.

**When NOT appropriate**:
- Large, deeply nested snapshots that are impossible to review meaningfully.
- Volatile output (timestamps, random IDs) that changes on every run.
- As a substitute for behavioral assertions — a snapshot that passes doesn't mean the *behavior* is correct.

```typescript
// Appropriate: small, focused snapshot
it('renders a user badge', () => {
  const { container } = render(UserBadge, { props: { name: 'Alice', verified: true } });
  expect(container.innerHTML).toMatchSnapshot();
});

// Anti-pattern: snapshot of an entire page
it('renders the home page', () => {
  const { container } = render(HomePage); // 500+ lines of HTML
  expect(container.innerHTML).toMatchSnapshot(); // Nobody will review this diff
});
```

**Rule**: If you wouldn't carefully review the snapshot diff in a PR, the snapshot is too large to be useful.

---

## 8. Flaky Tests

Flaky tests are tests that sometimes pass and sometimes fail without any code change. They are **worse than no tests** because they erode trust in the entire suite. When a team starts ignoring test failures ("oh, that one's flaky"), they lose the ability to detect real regressions.

### 8.1 Causes

| Cause | Example |
|-------|---------|
| **Timing dependencies** | `setTimeout`, `waitFor` with tight timeouts, race conditions |
| **Shared mutable state** | Global variables, singletons, database rows not cleaned up |
| **Non-deterministic data** | `Date.now()`, `Math.random()`, UUID generation |
| **Test order dependency** | Test B passes only if Test A runs first |
| **External dependencies** | Network calls, file system, third-party APIs |
| **Resource contention** | Parallel tests competing for ports, database locks |
| **Environment differences** | Passes on Mac, fails on Linux CI; timezone differences |

### 8.2 How to Detect

- **Run tests multiple times**: `npx vitest --repeat=10` (if supported) or a CI job that runs the suite 5x.
- **Randomize test order**: Vitest runs tests in file-level parallel by default. Use `--sequence.shuffle` to randomize within files.
- **Track flakes in CI**: Flag tests that fail intermittently. Many CI systems (CircleCI, GitHub Actions with custom scripts) can track flake rates over time.
- **Quarantine**: Move known flaky tests to a separate suite so they don't block deployments while you fix them.

### 8.3 How to Fix

1. **Eliminate timing dependencies**: Replace `setTimeout`/polling with deterministic triggers. Use `vi.useFakeTimers()` in Vitest.
2. **Isolate state**: Use `beforeEach`/`afterEach` to reset state. Create fresh instances per test.
3. **Control non-determinism**: Inject clocks, seed random generators, use deterministic ID generators.
4. **Remove external calls**: Replace with test doubles. If you must hit a real service, use retries *with logging* to distinguish flakes from real failures.
5. **Fix order dependencies**: Run tests with `--sequence.shuffle` and fix whatever breaks.

```typescript
// BAD: Timing-dependent, flaky
it('debounces the search input', async () => {
  component.onSearch('hello');
  await new Promise((resolve) => setTimeout(resolve, 350)); // Fragile
  expect(searchSpy).toHaveBeenCalledWith('hello');
});

// GOOD: Deterministic with fake timers
it('debounces the search input', () => {
  vi.useFakeTimers();

  component.onSearch('hello');
  vi.advanceTimersByTime(300);

  expect(searchSpy).toHaveBeenCalledWith('hello');

  vi.useRealTimers();
});
```

### 8.4 Preventive Practices

- **Make flakiness a P1 issue**: Do not tolerate flaky tests. Fix them immediately or quarantine them.
- **Run tests in random order by default**.
- **Enforce test isolation in code review**: Look for shared mutable state.
- **Avoid `sleep` or arbitrary timeouts in tests**: If you see a `setTimeout` in a test, treat it as a smell.
- **Use `afterEach` to clean up**: Subscriptions, timers, DOM elements, spies.

---

## 9. Test Architecture and Project Organization

### 9.1 Folder Structure

There are two common approaches:

#### Co-located tests (recommended for Angular/Vitest)

```
src/
├── app/
│   ├── features/
│   │   └── posts/
│   │       ├── post-card/
│   │       │   ├── post-card.ts
│   │       │   ├── post-card.html
│   │       │   ├── post-card.css
│   │       │   └── post-card.spec.ts     ← Test lives next to the code
│   │       └── post.service.ts
│   │           └── post.service.spec.ts
│   └── core/
│       └── services/
│           ├── auth.service.ts
│           └── auth.service.spec.ts
└── testing/                               ← Shared test utilities
    ├── factories/
    ├── fixtures/
    └── test-utils.ts
```

**Why co-location**: When you look at a file, you immediately see whether it has tests. When you rename or move a file, the test moves with it. There's no indirection.

#### Separate test directory

```
src/
├── app/
│   └── ...
tests/
├── unit/
│   ├── services/
│   │   └── auth.service.spec.ts
│   └── components/
│       └── post-card.spec.ts
├── integration/
│   └── post-flow.spec.ts
└── e2e/
    └── login.spec.ts
```

This approach is common in backend projects and when E2E tests live in a separate project. The downside is that it's easy for tests to drift from the code they cover.

### 9.2 Test Utilities

Create a shared `testing/` directory for:

- **Custom matchers**: Extend `expect` with domain-specific assertions.
- **Render helpers**: Functions that set up `TestBed` with common providers.
- **Common mocks**: Shared mock implementations of services used across many tests.

```typescript
// testing/test-utils.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

export function configureTestBed(providers: any[] = []) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), ...providers],
  });
}
```

### 9.3 Reusable Factories and Builders

**Factories** create test data with sensible defaults. They solve the problem of tests breaking when a model gains a new required field — you update the factory once, not 200 tests.

```typescript
// testing/factories/user.factory.ts
import { User } from '../../app/core/types/user.model';

let idCounter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  idCounter++;
  return {
    id: `user-${idCounter}`,
    name: `Test User ${idCounter}`,
    username: `testuser${idCounter}`,
    email: `user${idCounter}@test.com`,
    verified: false,
    followers: [],
    following: [],
    ...overrides,
  };
}
```

Usage in tests:

```typescript
it('displays the username', () => {
  const user = createUser({ username: 'alice' });
  // Only specify what matters for THIS test — everything else has defaults
  expect(formatUserHandle(user)).toBe('@alice');
});
```

**Builder pattern** for complex objects:

```typescript
class PostBuilder {
  private post: Post = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'Default content',
    likes: [],
    comments: [],
    createdAt: new Date('2025-01-01').toISOString(),
  };

  withAuthor(authorId: string): this {
    this.post.authorId = authorId;
    return this;
  }

  withLikes(count: number): this {
    this.post.likes = Array.from({ length: count }, (_, i) => `user-${i}`);
    return this;
  }

  withContent(content: string): this {
    this.post.content = content;
    return this;
  }

  build(): Post {
    return { ...this.post };
  }
}

// Usage
const post = new PostBuilder().withAuthor('alice').withLikes(5).build();
```

### 9.4 Fixtures

Fixtures are **static test data** loaded from files — useful for large JSON responses, GraphQL results, or complex payloads.

```
testing/
└── fixtures/
    ├── user-response.json
    ├── posts-feed.json
    └── error-responses/
        ├── 401.json
        └── 500.json
```

```typescript
import userResponse from '../fixtures/user-response.json';

it('maps the API response to a User model', () => {
  const user = mapToUser(userResponse);
  expect(user.name).toBe('Alice Smith');
});
```

**Caution**: Fixtures can become stale. If the API changes and the fixture doesn't, tests pass but production breaks. Consider generating fixtures from a schema or contract.

### 9.5 Separation of Concerns

Keep test infrastructure separate from test logic:

- **Factories**: How to build test data.
- **Fixtures**: Static data from external sources.
- **Helpers**: Common setup/teardown, render utilities.
- **Custom matchers**: Domain-specific assertions.
- **Test code**: The actual `describe`/`it` blocks.

Do **not** put factory functions or helper logic inside test files. If two test files need the same helper, extract it to the shared `testing/` directory.

---

## 10. CI/CD and Testing

### 10.1 Running Tests in Pipelines

Tests in CI must be:

- **Automated**: No human intervention to run them.
- **Reproducible**: Same results every run (see [flaky tests](#8-flaky-tests)).
- **Fast**: Developers should not wait more than 10–15 minutes for CI to complete.

Typical CI pipeline structure:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx ng test --watch=false --coverage
      - run: npx ng build
```

**Best practices**:
- Use `npm ci` (not `npm install`) for reproducible installs.
- Run tests with `--watch=false` so they exit after completion.
- Cache `node_modules` to avoid reinstalling on every run.
- Fail the pipeline on test failure — no exceptions.

### 10.2 Coverage: What It Means and What It Does NOT Mean

Code coverage measures what **percentage of code lines/branches/functions are executed** by the test suite.

**What coverage tells you**: Which code paths have *at least one test* running through them.

**What coverage does NOT tell you**:
- Whether the tests **assert anything meaningful** (you can have 100% coverage with zero assertions).
- Whether the tests cover **important edge cases**.
- Whether the code **behaves correctly**.
- Whether the **integration** between components works.

A codebase with 80% coverage and well-written tests is dramatically better than one with 100% coverage and tests that verify implementation details or assert nothing.

**Recommended thresholds**:
- 70–80% as a quality gate for new code (not the entire codebase).
- 100% coverage for critical business logic (payment processing, authentication, data transformations).
- Never mandate 100% coverage for the entire project — it leads to testing trivial getters and auto-generated code, wasting engineering time.

```typescript
// vitest.config.ts — coverage configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 75,
        branches: 70,
        functions: 75,
        statements: 75,
      },
      exclude: ['**/*.spec.ts', 'testing/**', '**/*.config.ts'],
    },
  },
});
```

### 10.3 Quality Gates

Quality gates are automated checks that a PR must pass before it can be merged:

- **Tests pass**: All unit and integration tests pass.
- **Coverage threshold**: New code meets the minimum coverage threshold.
- **No new lint errors**: Static analysis passes.
- **Build succeeds**: The project compiles without errors.
- **Type check passes**: `tsc --noEmit` succeeds.

Make quality gates **mandatory** in your branch protection rules. If it's possible to merge without passing, someone eventually will.

### 10.4 Parallelization Strategies

As test suites grow, parallelization becomes critical:

- **File-level parallelism**: Vitest runs test files in parallel by default using worker threads. This is usually sufficient for most projects.
- **CI-level parallelism**: Split the test suite across multiple CI machines. Tools like `vitest --shard=1/3` run only a third of the files per machine.
- **Watch mode**: During development, only re-run tests affected by changed files (`vitest --changed`).

```yaml
# Parallel test sharding in CI
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - run: npx vitest --watch=false --shard=${{ matrix.shard }}/3
```

**Caution**: Parallelism exposes hidden state sharing between tests. If tests pass sequentially but fail in parallel, you have isolation issues.

---

## 11. Anti-Patterns in Testing

### 11.1 Over-Testing Implementation Details

**Symptom**: Tests break on every refactor, even when external behavior hasn't changed.

```typescript
// ANTI-PATTERN: Testing HOW, not WHAT
it('calls filterPosts then sortPosts then mapToViewModels', () => {
  const filterSpy = vi.spyOn(service, 'filterPosts');
  const sortSpy = vi.spyOn(service, 'sortPosts');
  const mapSpy = vi.spyOn(service, 'mapToViewModels');

  service.getFeed();

  expect(filterSpy).toHaveBeenCalledBefore(sortSpy);
  expect(sortSpy).toHaveBeenCalledBefore(mapSpy);
});

// BETTER: Test the outcome
it('returns published posts sorted by date, newest first', () => {
  const feed = service.getFeed();

  expect(feed.every((p) => p.published)).toBe(true);
  expect(feed[0].date >= feed[1].date).toBe(true);
});
```

### 11.2 Brittle Assertions

**Symptom**: Tests fail because of inconsequential changes (whitespace, property order, additional fields).

```typescript
// ANTI-PATTERN: Exact match on entire object
expect(result).toEqual({
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  preferences: { theme: 'dark', language: 'it' },
  // ... 15 more fields
});

// BETTER: Assert only what matters for this test
expect(result).toEqual(expect.objectContaining({
  name: 'Alice',
  email: 'alice@example.com',
}));
```

### 11.3 Excessive Mocking

**Symptom**: The test setup is 30 lines of mocks and the actual assertion is one line. The test tells you nothing about real behavior.

If you mock everything, you are testing your mocks, not your code. Prefer:

- **Real implementations** when the dependency is fast and deterministic.
- **Fakes** for complex dependencies (databases, HTTP).
- **Stubs** for simple data returns.
- **Mocks** only when you need to verify that a side effect occurred.

### 11.4 Slow Test Suites

**Symptom**: Developers don't run tests locally because the suite takes 10+ minutes. Tests only run in CI, losing the fast feedback loop.

**Root causes**:
- Tests hitting real APIs or databases.
- Unnecessary `TestBed.configureTestingModule` for pure function tests.
- Large component trees being rendered when only a small part is under test.
- Missing parallelization.

**Fix**: Profile your test suite (`vitest --reporter=verbose`), identify the slowest tests, and refactor them to be faster or move them to a separate integration suite.

### 11.5 Shared Mutable State

**Symptom**: Tests pass individually but fail when run together. Test order matters.

```typescript
// ANTI-PATTERN: Module-level mutable state
let mockDatabase: Map<string, User> = new Map();

beforeAll(() => {
  mockDatabase.set('1', createUser({ id: '1', name: 'Alice' }));
});

it('finds user by id', () => {
  expect(mockDatabase.get('1')?.name).toBe('Alice');
});

it('deletes user by id', () => {
  mockDatabase.delete('1');
  expect(mockDatabase.has('1')).toBe(false);
});

// The second test mutates state that the first test depends on.
// If run order changes, the first test may see unexpected state.

// FIX: Reset state in beforeEach
beforeEach(() => {
  mockDatabase = new Map();
  mockDatabase.set('1', createUser({ id: '1', name: 'Alice' }));
});
```

---

## 12. Code Examples: Bad to Good

### Example 1: Testing a Post Filtering Service

**Bad test** — implementation-coupled, brittle, unreadable:

```typescript
describe('PostFilterService', () => {
  it('works', () => {
    const s = new PostFilterService();
    const spy = vi.spyOn(s as any, 'applyFilters');
    const r = s.getFilteredPosts(
      [
        { id: '1', content: 'hello', authorId: 'a', likes: ['x'], createdAt: '2025-01-01T00:00:00Z' },
        { id: '2', content: '', authorId: 'b', likes: [], createdAt: '2025-01-02T00:00:00Z' },
        { id: '3', content: 'world', authorId: 'a', likes: ['x', 'y'], createdAt: '2025-01-03T00:00:00Z' },
      ],
      { authorId: 'a', minLikes: 1 },
    );
    expect(spy).toHaveBeenCalled();
    expect(r.length).toBe(1);
    expect(r[0].id).toBe('3');
    expect(r[0].content).toBe('world');
    expect(r[0].authorId).toBe('a');
    expect(r[0].likes).toEqual(['x', 'y']);
    expect(r[0].createdAt).toBe('2025-01-03T00:00:00Z');
  });
});
```

**What's wrong**:
1. Test name is `'works'` — conveys nothing.
2. Variables are single letters (`s`, `r`) — unreadable.
3. Spies on a private method — implementation coupling.
4. Asserts every field of the result object — brittle.
5. All behaviors crammed into one test — when it fails, you don't know *what* broke.

**Good test** — behavior-focused, readable, maintainable:

```typescript
describe('PostFilterService', () => {
  const service = new PostFilterService();

  const posts = [
    createPost({ id: '1', authorId: 'alice', content: 'hello', likeCount: 0 }),
    createPost({ id: '2', authorId: 'bob', content: 'goodbye', likeCount: 3 }),
    createPost({ id: '3', authorId: 'alice', content: 'world', likeCount: 5 }),
  ];

  it('filters posts by author', () => {
    const result = service.getFilteredPosts(posts, { authorId: 'alice' });

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('filters posts by minimum like count', () => {
    const result = service.getFilteredPosts(posts, { minLikes: 3 });

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['2', '3']);
  });

  it('applies multiple filters together', () => {
    const result = service.getFilteredPosts(posts, { authorId: 'alice', minLikes: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns all posts when no filters are applied', () => {
    const result = service.getFilteredPosts(posts, {});

    expect(result).toHaveLength(3);
  });

  it('returns an empty array when no posts match', () => {
    const result = service.getFilteredPosts(posts, { authorId: 'nonexistent' });

    expect(result).toEqual([]);
  });
});
```

**What improved**:
1. Each test has a descriptive name that reads like a specification.
2. Uses a `createPost` factory — adding a new required field to `Post` won't break these tests.
3. No implementation spying — tests verify *output*, not *internals*.
4. Asserts only what's relevant to each test case.
5. One behavior per test — a failure tells you exactly what broke.

### Example 2: Testing an Angular Component

**Bad test** — fragile DOM queries, no behavioral focus:

```typescript
it('renders correctly', () => {
  const fixture = TestBed.createComponent(UserCardComponent);
  fixture.componentRef.setInput('user', {
    id: '1',
    name: 'Alice',
    username: 'alice',
    verified: true,
    followers: ['x', 'y'],
    following: [],
    email: 'alice@test.com',
  });
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('div.card > div.card-header > h3').textContent).toBe('Alice');
  expect(fixture.nativeElement.querySelector('div.card > div.card-header > span.username').textContent).toBe('@alice');
  expect(fixture.nativeElement.querySelector('div.card > div.card-body > span.verified-icon')).toBeTruthy();
  expect(fixture.nativeElement.querySelector('div.card > div.card-footer > span.followers').textContent).toBe('2');
});
```

**What's wrong**:
1. Deep CSS selector chains — any layout change breaks the test even if behavior is the same.
2. Tests everything in one assertion block.
3. Constructs a full user object inline.

**Good test** — uses accessible queries, focuses on what the user sees:

```typescript
describe('UserCardComponent', () => {
  function setup(userOverrides: Partial<User> = {}) {
    const fixture = TestBed.createComponent(UserCardComponent);
    fixture.componentRef.setInput('user', createUser(userOverrides));
    fixture.detectChanges();
    return fixture;
  }

  it('displays the user name', () => {
    const fixture = setup({ name: 'Alice' });

    const heading = fixture.nativeElement.querySelector('[data-testid="user-name"]');
    expect(heading.textContent).toContain('Alice');
  });

  it('displays the username with @ prefix', () => {
    const fixture = setup({ username: 'alice' });

    const username = fixture.nativeElement.querySelector('[data-testid="username"]');
    expect(username.textContent).toContain('@alice');
  });

  it('shows the verified icon for verified users', () => {
    const fixture = setup({ verified: true });

    const icon = fixture.nativeElement.querySelector('[data-testid="verified-icon"]');
    expect(icon).toBeTruthy();
  });

  it('hides the verified icon for unverified users', () => {
    const fixture = setup({ verified: false });

    const icon = fixture.nativeElement.querySelector('[data-testid="verified-icon"]');
    expect(icon).toBeFalsy();
  });

  it('displays the follower count', () => {
    const fixture = setup({ followers: ['user-1', 'user-2', 'user-3'] });

    const count = fixture.nativeElement.querySelector('[data-testid="follower-count"]');
    expect(count.textContent).toContain('3');
  });
});
```

**What improved**:
1. `setup()` helper centralizes component creation with a factory.
2. Uses `data-testid` attributes — resistant to CSS/layout refactors.
3. Each test verifies one visual behavior.
4. Only specifies the data that matters for each assertion.

---

## 13. Checklist: How to Evaluate If a Test Is "Perfect"

Use this checklist during code reviews and when writing tests:

### Naming and Structure

- [ ] The test name describes the scenario and expected outcome.
- [ ] The test follows Arrange–Act–Assert with visual separation.
- [ ] There is one logical behavior per test.
- [ ] `describe` blocks group related tests meaningfully.

### Correctness

- [ ] The test actually fails when the behavior under test is broken (try commenting out the production code).
- [ ] Expected values are hard-coded, not computed from the production logic.
- [ ] Edge cases are covered (empty inputs, boundaries, error paths).

### Isolation

- [ ] The test does not depend on the execution order of other tests.
- [ ] All mutable state is reset in `beforeEach` or created locally.
- [ ] No shared mutable state between tests.

### Maintainability

- [ ] Test data is created via factories/builders, not inline literals with many fields.
- [ ] Assertions use `objectContaining`, `arrayContaining`, or similar flexible matchers where appropriate.
- [ ] The test does not reach into private internals or spy on implementation details.
- [ ] DOM queries use `data-testid`, ARIA roles, or text content — not deep CSS selector chains.

### Speed and Determinism

- [ ] The test runs in under 100ms (unit) or under 2s (integration).
- [ ] No `setTimeout`, `sleep`, or arbitrary waits.
- [ ] Non-deterministic inputs (dates, random values) are controlled via injection or fake timers.

### Behavior Focus

- [ ] The test verifies **what** the code does, not **how** it does it.
- [ ] A refactor of the production code (without changing behavior) would not break this test.
- [ ] Mocks/spies are only used to verify critical side effects, not internal method calls.

### Readability

- [ ] A developer unfamiliar with the code can understand the test in under 30 seconds.
- [ ] Variable names are descriptive (`expectedUser`, not `x`).
- [ ] There is no conditional logic (`if`, `for`, `try/catch`) in the test body.

---

## 14. Summary of Key Principles

1. **Tests verify behavior, not implementation.** Your tests should answer "does this code do the right thing?" not "does this code do it the way I expect internally?"

2. **The testing pyramid is economics.** Push tests as low (unit) as possible for fast, cheap, precise feedback. Use integration tests for collaboration. Use E2E sparingly for critical journeys.

3. **A test is only valuable if you trust it.** Flaky tests must be fixed immediately. A failing test that is routinely ignored is worse than no test.

4. **Tests are the first client of your code.** If the code is hard to test, the code has a design problem. Don't reach for more mocks — improve the design.

5. **Factories and helpers are infrastructure.** Invest in reusable test utilities. They pay for themselves by preventing cascade failures when models change.

6. **Coverage is a lagging indicator, not a goal.** High coverage with meaningless tests provides false confidence. Focus on covering critical paths and edge cases thoroughly.

7. **Determinism is non-negotiable.** Every test must produce the same result every time. Control time, randomness, and external state.

8. **Tests are documentation.** Well-named tests are the most accurate, always-up-to-date specification of your system's behavior.

---

## 15. Golden Rules of Testing

- **Write the test you wish you had when the bug was reported.** Every production bug should result in a regression test.
- **If it's hard to test, redesign the code.** The test isn't the problem.
- **Prefer real implementations over mocks.** Only mock what you must.
- **One behavior per test.** If your test name contains "and," split it.
- **Name tests like specifications.** Someone should understand the behavior without reading the test body.
- **Keep tests fast.** A slow test suite is an unused test suite.
- **Treat test code with the same respect as production code.** Refactor it, review it, maintain it.
- **Fix flaky tests within 24 hours or quarantine them.**
- **Never trust a test you haven't seen fail.** Before considering a test "done," verify it fails when the behavior is broken.
- **Test the interface, not the wiring.** Assert on outputs, events, and state changes — not on which private methods were called.

---

## 16. Incremental Improvement Roadmap

For teams starting with poor or nonexistent test quality, adopt these steps incrementally. Trying to achieve everything at once leads to burnout and abandonment.

### Phase 1: Foundations (Weeks 1–4)

- **Set up the testing infrastructure**: Vitest (or your framework of choice) running in CI with `--watch=false`. Make CI fail on test failure.
- **Write tests for new code only**: Don't try to retroactively test the entire codebase. Mandate that every new PR includes tests for the changed/added code.
- **Create 2–3 factories** for your most common models. This lowers the barrier to writing tests.
- **Establish naming conventions**: Agree on a `describe`/`it` format and enforce it in code review.
- **Target**: 50%+ coverage on new code. No coverage mandate on legacy code.

### Phase 2: Build Confidence (Weeks 5–12)

- **Add regression tests for every bug fix**: No bug is closed without a test that reproduces it.
- **Write integration tests for critical paths**: Authentication, core data flows, the 3–5 most important user journeys.
- **Introduce factories and builders** for all primary domain models.
- **Set up coverage reporting** in CI (but don't set aggressive thresholds yet).
- **Identify and quarantine flaky tests**. Start fixing them.
- **Target**: 60%+ overall coverage. Zero flaky tests in the main suite.

### Phase 3: Mature Practices (Weeks 13–26)

- **Introduce quality gates**: Minimum 70% coverage on new files. All tests must pass. Build must succeed.
- **Add E2E tests** for 5–10 critical user journeys using Playwright or Cypress.
- **Refactor legacy code opportunistically**: When touching legacy code for a feature or fix, add tests for the area you're changing.
- **Train the team**: Hold a workshop on test doubles, the testing pyramid, and common anti-patterns.
- **Introduce property-based testing** for pure utility functions and data transformations.
- **Target**: 75%+ overall coverage. Consistent test structure across the codebase.

### Phase 4: Excellence (Ongoing)

- **Monitor test suite health**: Track execution time, flake rate, and coverage trends over time.
- **Optimize CI**: Parallelize tests, use sharding for large suites, cache dependencies.
- **Review test quality in PRs** with the same rigor as production code.
- **Continuously improve factories, helpers, and documentation**.
- **Celebrate improvements**: Share metrics with the team. Recognize the reduction in production incidents attributable to better testing.
- **Target**: Sustained high quality. Tests are a natural part of the development workflow, not an afterthought.

---

*This document is a living reference. Update it as your team's practices evolve and as new patterns emerge from production experience.*
