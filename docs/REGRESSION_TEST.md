# Notebook Application - Regression Testing Checklist

**Date:** 2026-08-31
**Version:** 1.0 (Stabilization Phase)

## Pre-Testing Verification
- [ ] All JavaScript files syntax validated
- [ ] All CSS files compiled without errors
- [ ] HTML structure complete
- [ ] Browser localStorage accessible
- [ ] GitHub Pages compatibility verified

---

## 1. CORE NOTES FUNCTIONALITY

### Note Viewing
- [ ] Home page loads with all categories
- [ ] Categories sidebar displays correctly
- [ ] Clicking category shows all notes
- [ ] Clicking note opens viewer
- [ ] Note content renders in iframe
- [ ] Back button returns to home

### Search
- [ ] Search palette opens with Cmd+K / Ctrl+K
- [ ] Search palette opens with /
- [ ] Search filters by title
- [ ] Search filters by category
- [ ] Search filters by tags
- [ ] Search results navigate correctly
- [ ] Escape closes search

### Navigation
- [ ] Home link works
- [ ] Category links work
- [ ] URL hash routing works
- [ ] Page refresh keeps current view
- [ ] Breadcrumbs display correctly

---

## 2. REVISION SYSTEM

### Today's Revision Panel
- [ ] Revision panel displays correctly on home
- [ ] Today's due items show
- [ ] Empty state shows when nothing due
- [ ] Item count accurate

### Revision Choices
- [ ] Forgot (1 day) works
- [ ] Hard (2 days) works
- [ ] Good (7+ days) works
- [ ] Easy (14+ days) works
- [ ] Review count increments
- [ ] Next review date calculates correctly
- [ ] Status updates (Learning → Reviewing → Mastered)
- [ ] Data persists after page reload

### Spaced Repetition Logic
- [ ] First review sets correct interval
- [ ] Subsequent reviews use correct intervals
- [ ] Confidence level tracks
- [ ] Last reviewed date updates

---

## 3. INTERVIEW MODE

### Question Loading
- [ ] Interview panel displays on home
- [ ] Questions load from data/questions.json
- [ ] Empty state shows if no questions

### Filtering
- [ ] Category filter works
- [ ] Difficulty filter works
- [ ] Both filters work together

### Question Display
- [ ] Question shows clearly
- [ ] Question count accurate (X/total)
- [ ] Difficulty badge shows
- [ ] Category badge shows

### Answer Display
- [ ] Show answer button toggles
- [ ] Answer displays when clicked
- [ ] Answer hides when toggled

### Recording Results
- [ ] Forgot (red) button works
- [ ] Partial (yellow) button works
- [ ] Correct (green) button works
- [ ] Stats update: attempts, correct, partial, failed
- [ ] Last attempted date updates
- [ ] Next review date calculates
- [ ] Next question loads after choice

### Stats Persistence
- [ ] Stats persist after page reload
- [ ] All metrics tracked accurately

---

## 4. MISTAKE BANK

### Adding Mistakes
- [ ] Mistake form displays on home
- [ ] Type, title, category, reason inputs work
- [ ] Next review date picker works
- [ ] Submit adds mistake
- [ ] Form clears after submit

### Mistake Display
- [ ] Mistake bank panel shows mistakes
- [ ] Mistake count accurate
- [ ] Mistake details display correctly
- [ ] Empty state shows if no mistakes

### Mistake Actions
- [ ] Review mistake button works
- [ ] Review updates next review date
- [ ] Remove button works
- [ ] Remove confirms before deleting
- [ ] Removed mistakes don't reappear

### Mistakes Persistence
- [ ] Mistakes persist after reload
- [ ] Data doesn't corrupt

### Weak Areas
- [ ] Weak areas panel displays
- [ ] Weak areas based on mistake categories
- [ ] Count accurate
- [ ] Display updates when mistakes added/removed

---

## 5. DSA TRACKER

### DSA Dashboard
- [ ] DSA panel displays on home
- [ ] NeetCode 150 progress shows
- [ ] Solved count accurate
- [ ] Breakdown shows (Easy/Medium/Hard)
- [ ] Due for revision count accurate
- [ ] Empty state when no problems

### Problem Progress
- [ ] Problems load from data/dsa.json
- [ ] Progress data stored correctly
- [ ] Solved status updates
- [ ] Attempts counter increments
- [ ] Confidence level tracks
- [ ] Next review date calculates

---

## 6. 90-DAY INTERVIEW PREPARATION

### 90-Day Dashboard
- [ ] 90-day panel displays on home
- [ ] Start date shows
- [ ] Current day / total calculates correctly
- [ ] Days remaining accurate
- [ ] End date calculates

### Plan Controls
- [ ] Start plan button works
- [ ] Confirmation dialog shows
- [ ] Start date sets to today
- [ ] Current day counts from start
- [ ] Pause button appears after start
- [ ] Pause works with confirmation
- [ ] Reset button works with confirmation
- [ ] Reset clears plan data

### Plan State
- [ ] Plan state persists after reload
- [ ] Day counting continues correctly
- [ ] Paused state doesn't count days

---

## 7. DAILY AND WEEKEND GOALS

### Daily Goals
- [ ] Daily goals panel displays
- [ ] Goals: "1–2 hours theory", "1 DSA problem", etc.
- [ ] Checkboxes work
- [ ] Checked state persists
- [ ] Data persists after reload

### Weekend Goals
- [ ] Weekend goals panel displays
- [ ] Goals: "2–3 DSA problems", "Weekly revision", etc.
- [ ] Checkboxes work
- [ ] Checked state persists
- [ ] Separate from daily goals

---

## 8. WEEKLY REVIEW

### Weekly Summary Panel
- [ ] Panel displays on home
- [ ] Topics revised count accurate
- [ ] Mistakes fixed count accurate
- [ ] DSA solved count accurate
- [ ] Interview questions count accurate

---

## 9. SETTINGS & BACKUP

### Export Progress
- [ ] Export button visible in settings
- [ ] Export creates JSON file
- [ ] File name: notebook-progress-YYYYMMDD.json
- [ ] Date in filename is current date
- [ ] Exported JSON contains all data:
  - [ ] Revision data
  - [ ] Interview stats
  - [ ] Mistakes
  - [ ] DSA progress
  - [ ] 90-day plan
  - [ ] Daily/weekend goals
  - [ ] Settings

### Import Progress
- [ ] Import button visible
- [ ] File picker opens
- [ ] Accepts .json files
- [ ] Confirmation dialog shows before import
- [ ] Cancel prevents import
- [ ] Import validates JSON
- [ ] Rejects invalid/corrupted files
- [ ] Valid import restores all data
- [ ] Page reloads after import
- [ ] Imported data persists

### Reset Progress
- [ ] Reset button visible
- [ ] First confirmation shows warning
- [ ] Second confirmation required
- [ ] Reset clears:
  - [ ] Revision data
  - [ ] Interview stats
  - [ ] Mistakes
  - [ ] DSA progress
  - [ ] 90-day plan
  - [ ] Daily/weekend goals
- [ ] Reset does NOT delete:
  - [ ] notes.json
  - [ ] Note files
  - [ ] Interview questions
  - [ ] DSA problems
  - [ ] Theme preference
- [ ] Page reloads after reset

### Settings Summary
- [ ] Topics revised count shows
- [ ] Interview questions count shows
- [ ] Mistakes tracked count shows
- [ ] DSA problems count shows
- [ ] Last backup date shows

---

## 10. DARK/LIGHT MODE

- [ ] Toggle button visible in topbar
- [ ] Light mode applies correctly
- [ ] Dark mode applies correctly
- [ ] Mode preference persists after reload
- [ ] All panels readable in both modes
- [ ] Colors have sufficient contrast

---

## 11. MOBILE RESPONSIVENESS

### Mobile Layout
- [ ] Hamburger menu appears on mobile
- [ ] Menu opens/closes
- [ ] Sidebar scrollable on mobile
- [ ] Main content readable
- [ ] Buttons have touch-friendly size
- [ ] Cards stack correctly
- [ ] No horizontal scroll

### Mobile Panels
- [ ] Revision panel readable
- [ ] Interview panel usable
- [ ] Mistake form usable
- [ ] DSA panel readable
- [ ] Settings panel usable

---

## 12. DESKTOP LAYOUT

- [ ] Sidebar visible
- [ ] Main content properly spaced
- [ ] Cards grid responsive
- [ ] No text overflow
- [ ] Topbar fixed and functional

---

## 13. DATE HANDLING

- [ ] No hardcoded dates in code
- [ ] Today's date always uses browser date
- [ ] Date calculations use addDays() utility
- [ ] Timezone handling correct
- [ ] Date formatting consistent (YYYY-MM-DD)
- [ ] Day calculations accurate

---

## 14. STORAGE & PERFORMANCE

### localStorage Management
- [ ] No localStorage errors in console
- [ ] Data doesn't corrupt
- [ ] Data survives page reload
- [ ] localStorage quota not exceeded
- [ ] No memory leaks

### Performance
- [ ] Page loads quickly (< 2s)
- [ ] No console errors
- [ ] No console warnings
- [ ] Smooth interactions (no lag)
- [ ] Responsive to user input

---

## 15. DATA INTEGRITY

### Existing Notes
- [ ] All original notes still exist
- [ ] notes.json unchanged
- [ ] Note IDs unchanged
- [ ] Note routing unchanged
- [ ] Note content unchanged

### Data Migration
- [ ] Old progress data loads if exists
- [ ] New data structure compatible
- [ ] No data loss on upgrade

---

## 16. BROWSER COMPATIBILITY

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Notes | ✓/✗ | |
| Search | ✓/✗ | |
| Revision | ✓/✗ | |
| Interview | ✓/✗ | |
| Mistakes | ✓/✗ | |
| DSA Tracker | ✓/✗ | |
| 90-Day Plan | ✓/✗ | |
| Goals | ✓/✗ | |
| Settings | ✓/✗ | |
| Dark Mode | ✓/✗ | |
| Mobile | ✓/✗ | |
| Storage | ✓/✗ | |

---

## Known Issues & Workarounds

(To be filled during testing)

---

## Sign-off

- **Tester:** [Name]
- **Date:** [Date]
- **Status:** ✓ PASS / ✗ FAIL
- **Notes:** 

