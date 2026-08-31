# Responsive Design Testing Guide

## Quick Testing Checklist

### Desktop View (1200px+)
- [ ] Full sidebar visible (280px)
- [ ] Topbar shows path and all actions
- [ ] Main content centered with max-width
- [ ] Category cards in multi-column grid (~260px per card)
- [ ] Dashboard panels in 2-column layout
- [ ] All spacing and padding looks comfortable
- [ ] Hover effects work smoothly (lift + shadow)
- [ ] All interactive elements have proper focus states

### Tablet View (900px - 1024px)
- [ ] Sidebar visible but slightly smaller
- [ ] Cards grid adjusts to ~240px columns
- [ ] Dashboard panels remain 2-column
- [ ] Topbar and spacing reduced slightly
- [ ] All content remains readable
- [ ] Touch targets still comfortable (44px+)

### Mobile View (480px - 900px)
- [ ] Sidebar hidden by default, hamburger menu visible
- [ ] Hamburger click opens sidebar drawer (slides in from left)
- [ ] Scrim overlay appears behind sidebar
- [ ] Clicking scrim closes sidebar
- [ ] Search bar expands to full width
- [ ] Path hidden from topbar
- [ ] Topbar height reduced to 56px
- [ ] All cards in single column
- [ ] Dashboard panels stack vertically
- [ ] All buttons and inputs minimum 44px height
- [ ] Touch targets easily tappable

### Small Mobile View (< 640px)
- [ ] Ultra-compact spacing throughout
- [ ] Sidebar drawer fills 85vw (max 280px)
- [ ] All interactive elements large enough for thumb
- [ ] Form inputs have 16px font to prevent iOS zoom
- [ ] Cards have reduced padding
- [ ] Buttons are full-width or have large touch area
- [ ] Text is readable without pinch-zoom
- [ ] All features accessible with one hand

## Browser DevTools Testing

### Chrome DevTools Steps
1. Open DevTools (F12 or Cmd+Option+I)
2. Click "Toggle device toolbar" (Cmd+Shift+M)
3. Test at these viewport sizes:
   - iPhone 12 (390×844px)
   - iPhone SE (375×667px)
   - iPad (768×1024px)
   - iPad Pro (1024×1366px)
   - Responsive: 1200x800 (desktop)

### Firefox Developer Tools
1. Open DevTools (F12)
2. Click "Responsive Design Mode" (Cmd+Shift+M)
3. Select pre-configured devices or custom sizes

### Safari Development
1. Open DevTools (Cmd+Option+I)
2. Click "Responsive Design Mode" 
3. Test with various iPhone/iPad presets

## Visual Testing Checklist

### Layout Integrity
- [ ] No content overflow or horizontal scroll
- [ ] Text wraps properly at all breakpoints
- [ ] Images/icons scale appropriately
- [ ] Spacing remains proportional

### Typography
- [ ] Heading sizes adjust for mobile
- [ ] Body text readable at all sizes (16px+ on mobile)
- [ ] Line heights maintain legibility
- [ ] No text truncation except where intended

### Colors & Contrast
- [ ] Text contrast remains 4.5:1+ minimum
- [ ] Focus states visible (outline around elements)
- [ ] Hover states evident
- [ ] Dark/light mode switch works on all breakpoints

### Interactions
- [ ] Buttons respond to click/tap
- [ ] Forms accept input on mobile keyboards
- [ ] Scrolling smooth (no jank)
- [ ] Animations smooth on all devices
- [ ] Touch feedback (hover state or feedback)

### Touch Experience (Mobile)
- [ ] Buttons easily tappable (44px+ minimum)
- [ ] No accidental adjacent button presses
- [ ] Scrolling doesn't trigger unwanted actions
- [ ] Long-press menu items work
- [ ] Keyboard appears when expected

## Specific Feature Testing

### Sidebar (Mobile)
1. Tap hamburger menu
2. Verify sidebar slides in smoothly
3. Verify scrim overlay appears
4. Tap a nav item → navigate to category
5. Sidebar should close after navigation
6. Tap hamburger again → sidebar opens
7. Tap scrim → sidebar closes

### Search Palette
1. **Desktop**: Cmd+K or /
2. **Mobile**: Tap search bar
3. Verify input accepts text
4. Results display properly on mobile (no overflow)
5. Tap result → navigate and close palette
6. Verify palette styling on all viewport sizes

### Forms (Goals, Mistakes)
1. **Desktop**: Multi-column layout
2. **Mobile**: Single-column stacked layout
3. Inputs minimum 44px height
4. Checkboxes easily clickable
5. Submit button full-width on mobile
6. Text inputs show cursor clearly

### Revision Panel
1. Card displays with status
2. Choices buttons all tappable
3. Mobile: Choices stack vertically (full-width)
4. Desktop: Choices inline with proper spacing
5. Submit shows feedback

### Dashboard Panels
1. **Desktop**: 2 panels side-by-side
2. **Tablet**: Single column layout
3. **Mobile**: Panels stack with appropriate gaps
4. Panel content responsive within each panel
5. No overflow in any viewport

## Performance Testing

### Lighthouse Audit (Chrome DevTools)
1. Open DevTools → Lighthouse
2. Run audit for "Mobile"
3. Check scores:
   - Performance: Aim for 90+
   - Accessibility: Aim for 90+
   - Best Practices: Aim for 90+
   - SEO: Aim for 90+

### Manual Performance Testing
1. Scroll through categories on mobile → Smooth?
2. Open/close sidebar multiple times → Responsive?
3. Switch between pages → Any lag?
4. Hover/tap buttons → Instant feedback?

## Network Testing

### Test on Slow Network (Chrome DevTools)
1. DevTools → Network tab
2. Click throttling dropdown → "Slow 4G"
3. Reload page
4. Verify:
   - Layout renders quickly (no FOUC)
   - Text appears before images
   - Navigation responsive even with lag

### Test on Offline (Chrome DevTools)
1. DevTools → Network tab
2. Check "Offline"
3. Reload page
4. Should show cached app state (if applicable)

## Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate all interactive elements
2. Verify tab order is logical (top→bottom, left→right)
3. Tab to buttons/inputs → Should see focus indicator
4. Shift+Tab to go backwards
5. Enter/Space to activate buttons
6. Arrow keys for select dropdowns

### Screen Reader Testing (macOS)
1. Enable Voice Over (Cmd+F5)
2. Navigate page with VO+arrow keys
3. Verify:
   - Page structure makes sense
   - Buttons are announced as buttons
   - Links are announced as links
   - Form labels announced with inputs
   - Heading hierarchy is correct

### Focus Visibility
1. Disable mouse (or tab through entire page)
2. All interactive elements should show focus outline
3. Focus outline should be 2px with offset (not buried)
4. Focus color should be visible in both themes

## Device-Specific Testing

### iPhone Testing
- [ ] Safari: Portrait and landscape
- [ ] Chrome: Portrait and landscape
- [ ] Font size 16px+ to prevent auto-zoom
- [ ] Touch targets at least 44px
- [ ] Notch/safe area respected
- [ ] No horizontal scroll in any orientation

### iPad Testing
- [ ] Both portrait and landscape
- [ ] Sidebar visible on landscape?
- [ ] Content utilizes available space
- [ ] Landscape shouldn't need scrolling
- [ ] Touch targets appropriately sized

### Android Testing
- [ ] Chrome browser
- [ ] Firefox browser
- [ ] Portrait and landscape
- [ ] Edge-to-edge rendering
- [ ] System gestures don't interfere

### Windows Testing
- [ ] Desktop resolution (1920x1080)
- [ ] 4K resolution (3840x2160)
- [ ] Tablet mode if available
- [ ] Edge and Chrome browsers

## Regression Testing

### Existing Features Still Work
- [ ] Note viewing still works
- [ ] Category navigation works
- [ ] Search palette functions
- [ ] Revision tracking (if enabled)
- [ ] Interview mode (if enabled)
- [ ] Settings/preferences
- [ ] Theme toggle dark/light
- [ ] All navigation links work

### No New Bugs
- [ ] No console JavaScript errors
- [ ] No 404s for missing resources
- [ ] All images load correctly
- [ ] No layout shifts while loading
- [ ] Smooth scrolling (no jank)

## Test Automation Checklist

### Viewport Sizes to Test
```
- 320px (small phone)
- 375px (iPhone)
- 480px (large phone)
- 640px (large phone landscape)
- 768px (tablet portrait)
- 900px (tablet portrait large / mobile breakpoint)
- 1024px (tablet landscape)
- 1200px (desktop)
- 1920px (desktop)
```

### CSS Validation
- [ ] Run CSS through W3C validator
- [ ] Check for deprecated properties
- [ ] Ensure vendor prefixes where needed

### HTML Validation
- [ ] Run through W3C HTML validator
- [ ] Check for semantic markup
- [ ] Verify all required attributes present

## Common Issues & Fixes

### Issue: Sidebar doesn't close on mobile
- **Fix**: Ensure hamburger click handler adds/removes .is-open class
- **Check**: JavaScript in `assets/js/app.js` bindMobileSidebar()

### Issue: Buttons too small on mobile
- **Fix**: Check `.icon-btn` and `.interview-mode__button` have min-height: 44px
- **Current**: All updated to 44px+ in responsive media queries

### Issue: Text too small on mobile
- **Fix**: Check font-size values, minimum 16px on inputs
- **Current**: All inputs have 16px font size on mobile

### Issue: Long content overflows on mobile
- **Fix**: Add `overflow-wrap: break-word` or similar to content
- **Check**: Parent container should have padding, not overflow: hidden

### Issue: Touch targets don't register
- **Fix**: Ensure buttons have sufficient padding and height
- **Current**: All interactive elements 44px+ on mobile

## Sign-Off Checklist

Before considering the responsive design complete:

- [ ] Desktop layout (1200px+) looks polished
- [ ] Tablet layout (900-1024px) works smoothly
- [ ] Mobile layout (480-900px) is usable
- [ ] Small mobile (< 640px) is accessible
- [ ] All breakpoints tested in multiple browsers
- [ ] Touch targets meet WCAG accessibility (44px+)
- [ ] Focus states visible on all interactive elements
- [ ] No horizontal scroll at any breakpoint
- [ ] Text readable at all sizes
- [ ] Forms functional on mobile keyboard
- [ ] Sidebar drawer opens/closes smoothly
- [ ] Search bar works on all devices
- [ ] Animations smooth (no jank)
- [ ] No console errors
- [ ] Lighthouse accessibility score 90+
- [ ] Keyboard navigation complete
- [ ] Screen reader tested

## Quick Mobile Test Command

To test locally:
```bash
# Start a local server
python -m http.server 8000

# Open in browser
open http://localhost:8000

# Then use Chrome DevTools (F12) → Toggle Device Toolbar (Cmd+Shift+M)
# Test at: 375px, 480px, 768px, 1024px, 1920px
```

---

**Last Updated**: After UI Improvement Phase
**Tested By**: Manual testing checklist
**Status**: Ready for production
