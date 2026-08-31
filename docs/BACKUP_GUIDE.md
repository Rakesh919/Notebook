# Notebook Settings & Backup Guide

## Overview

The Settings & Backup panel on the home page provides three essential functions:

1. **Export My Progress** - Download your progress as a backup
2. **Import My Progress** - Restore from a previously exported backup
3. **Reset Progress** - Clear all personal data and start fresh

---

## Using Export Progress

### What Gets Exported?
Your complete personal progress including:
- **Revision History** - All notes you've marked as learned/forgot/hard/good/easy
- **Interview Progress** - All interview questions and your attempts
- **Mistakes** - Your mistake bank and archived mistakes
- **DSA Progress** - Your LeetCode/NeetCode problem solving history
- **90-Day Plan** - Your interview prep plan status
- **Daily/Weekend Goals** - Your completed goals
- **Theme Preference** - Your light/dark mode choice

### What Does NOT Get Exported?
- Your actual notes (stored separately)
- Interview questions database
- DSA problems database
- Other metadata

### How to Export
1. Scroll to the **Settings & Backup** section
2. Click **📥 Export My Progress**
3. A file downloads: `notebook-progress-YYYYMMDD.json`
4. Save this file somewhere safe

### File Format
The exported file is a JSON file that you can:
- Store on Google Drive, Dropbox, etc.
- Email to yourself
- Keep as a backup
- Share with team members (for collaborative study)

---

## Using Import Progress

### When to Import?
- Restoring from a backup
- Switching devices
- Recovering lost progress
- Sharing progress with a study group

### How to Import
1. Scroll to the **Settings & Backup** section
2. Click **📤 Import My Progress**
3. Select a `notebook-progress-*.json` file
4. Confirm the dialog that appears:
   ```
   This will replace your current progress.
   Are you sure?
   
   [Cancel]  [Import]
   ```
5. Wait for success message
6. Page will reload with imported data

### Important Notes
- ✓ Import validates the file before restoring
- ✓ If file is invalid, you'll see an error message
- ✓ Your existing progress is replaced (not merged)
- ✓ Always keep a backup before importing
- ✓ After import, your page refreshes automatically

---

## Using Reset Progress

### What Gets Reset?
- ✓ Revision history (all reviewed notes)
- ✓ Interview attempts
- ✓ Mistakes and archives
- ✓ DSA solve history
- ✓ 90-day plan progress
- ✓ Daily/weekend goals

### What Does NOT Get Reset?
- ✗ Your notes (untouched)
- ✗ Interview questions database
- ✗ DSA problems database
- ✗ Theme preference (saved)

### How to Reset
1. Scroll to the **Settings & Backup** section
2. Click **🔄 Reset All Progress**
3. Confirm first dialog:
   ```
   This will clear all your progress:
   - Revision history
   - Interview attempts
   - Mistakes
   - DSA progress
   - Goals
   
   Your notes will NOT be deleted.
   
   Are you absolutely sure?
   
   [Cancel]  [OK]
   ```
4. Confirm second dialog (prevents accidental resets):
   ```
   Last chance! This action cannot be undone.
   
   [Cancel]  [OK]
   ```
5. Success message appears
6. Page reloads with fresh start

### When to Reset
- Starting over with a new study cycle
- Cleaning up old progress
- Preparing for a fresh 90-day plan
- Removing test data

---

## Backup Best Practices

### Regular Backups
- Export monthly to track progress
- Keep backups on cloud storage
- Date your backups: `notebook-progress-2026-08-31.json`

### Before Major Changes
- Export before resetting
- Export before 90-day plan reset
- Export before trying new features

### Disaster Recovery
- Always have at least 2 backups
- Keep one local, one on cloud
- Test imports periodically

### Sharing Progress
- Export to share with study group
- Team members can import to see your progress
- Useful for group study sessions

---

## Troubleshooting

### Export Not Working
- **Issue:** File doesn't download
- **Solution:** Check browser's download settings
- **Alternative:** Try different browser

### Import Fails - "Invalid Data"
- **Issue:** JSON file is corrupted or invalid
- **Solutions:**
  - Verify file is from Notebook app
  - Don't edit the JSON file
  - Try a different backup file
  - Export again and try new file

### Import Fails - "Parse Error"
- **Issue:** File format is wrong
- **Solutions:**
  - Ensure file is .json format
  - Download file completely before importing
  - Don't rename extension (keep .json)

### Page Doesn't Reload After Import
- **Issue:** Page frozen or not responding
- **Solution:** Manual refresh (Cmd+R or Ctrl+R)
- **Note:** Data should still be imported correctly

### Progress Summary Shows Zero
- **Issue:** Numbers don't reflect actual progress
- **Solution:** Refresh the page (F5)
- **Note:** This updates all counters from localStorage

---

## Data Privacy

### Local Storage Only
- All your progress stays on your device
- No server connection
- No cloud sync (by design)
- No third-party access

### Browser Access
- Only this web app can access your data
- Other sites cannot see it
- Data survives browser restarts
- Data lost if you clear localStorage

### Export File
- JSON file is plain text
- Readable and editable if needed
- No encryption (you can add if needed)
- Keep private or share as desired

---

## Advanced Usage

### Merging Progress from Multiple Devices
1. Export from Device A
2. Import on Device B
3. Work on Device B
4. Export from Device B
5. Import back to Device A

Note: This replaces, not merges. Each device has full copy.

### Archiving Old Progress
1. Export before reset
2. Rename file: `notebook-archive-2026-Q1.json`
3. Store safely
4. Can re-import anytime in future

### Starting New Study Phase
1. Export current progress (archival)
2. Reset all progress
3. Start fresh 90-day plan
4. Keep old export for reference

---

## Questions & Support

### Is my data encrypted?
No, but it's stored locally on your device. Keep backups private.

### Can I lose my data?
Only if you clear browser's localStorage or reset your browser.

### How often should I backup?
Weekly or before major changes.

### Can I edit the JSON file?
Yes, it's plain text. But be careful with formatting.

### Will my notes be affected?
No, notes are stored separately and never touched by backup/restore.

---

*Last Updated: August 31, 2026*

