# Spec vs. Prompt Cheat Sheet
### SDD Series by Ali Raza | aliirz.com

---

## The Core Difference

| Prompt | Spec |
|--------|------|
| Tells the AI what to do | Tells the AI what to do, why, how, and what done looks like |
| Implicit context | Explicit context |
| No constraints | Stated constraints |
| AI decides boundaries | You decide boundaries |
| Hope-driven | Intent-driven |

---

## A Spec Has Four Parts

### 1. Context
What problem are you solving, and what already exists around it?

**Bad:** "Add a login screen."

**Good:** "Add a login screen to a React Native app using Expo Router. Auth is handled by Supabase. The existing app already has a session provider in `app/_layout.tsx`."

**Ask yourself:** If I handed this to a new developer on day one, would they understand the situation without asking me a question?

---

### 2. Constraints
What is non-negotiable? Library choices, naming conventions, what must not change.

**Bad:** (nothing)

**Good:**
- Use NativeWind for all styling. No custom StyleSheet calls.
- No new npm dependencies without flagging first.
- All API calls go through the existing `lib/supabase.ts` client, not a new instance.
- Error states must be handled. No unhandled promise rejections.

**Ask yourself:** What would I be annoyed to find the AI changed or invented on its own?

---

### 3. Tasks
Break the work into atomic steps. Each step should be completable without a judgment call.

**Bad:** "Build the login flow."

**Good:**
1. Create `app/(auth)/login.tsx` with email and password fields
2. Validate email format and password length client-side before submission
3. Call `supabase.auth.signInWithPassword()` on submit
4. On success, redirect to `/(tabs)/home`
5. On error, show the Supabase error message in a `<Text>` component below the form
6. Add a "Forgot password?" link that routes to `/(auth)/reset-password`

**Ask yourself:** Could the AI complete each step without asking me a question?

---

### 4. Acceptance Criteria
What does done look like? How do you know it works?

**Bad:** "It should work."

**Good:**
- User can log in with a valid email and password and land on the home tab
- User sees a clear error message on wrong credentials
- User cannot submit the form while a request is in flight (button disabled)
- Session persists after app restart

**Ask yourself:** If I'm testing this tomorrow, what am I clicking through to call it done?

---

## Prompt vs. Spec Side by Side

### Feature: User Profile Edit Screen

**Prompt version:**
> "Build a user profile screen that shows the user's info and lets them edit it."

**Spec version:**
> **Context:** Adding a profile screen to a React Native app (Expo Router, Supabase, NativeWind). User data is in the `profiles` table. Auth is already configured. Existing UI components live in `@/components/ui`.
>
> **Constraints:** Use only existing Button and TextInput components. No new dependencies. Optimistic updates required with rollback on failure.
>
> **Tasks:**
> 1. Create `app/(tabs)/profile.tsx` with read-only display of `display_name`, `avatar_url`, `bio`
> 2. Add Edit button that toggles inline form fields
> 3. On save, call `updateProfile()` with optimistic update, roll back on Supabase error
> 4. Show loading skeleton during initial fetch
>
> **Done when:** User can view and edit profile, changes persist in Supabase, errors show a toast.

---

## Red Flags in Your Prompts

If your prompt contains any of these, stop and write a spec instead:

- "you'll figure out the best way to..."
- "make it look nice"
- "use whatever makes sense"
- "something like X but better"
- "and also handle edge cases"
- (no mention of existing files, libraries, or structure)

---

## The 5-Minute Spec Template

Copy this into a markdown file before every non-trivial AI task:

```markdown
## Context
[What is this feature? What already exists around it? What is the current state?]

## Constraints
- [Non-negotiable library or pattern]
- [What must not change]
- [Style/naming rules]

## Tasks
1. [Atomic step]
2. [Atomic step]
3. [Atomic step]

## Done when
- [Observable outcome 1]
- [Observable outcome 2]
```

---

Part of the **SDD with AI** series at [aliirz.com](https://aliirz.com)
