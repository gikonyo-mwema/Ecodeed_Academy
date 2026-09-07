# Admin Guide: How to Access & Edit About Us Page

## 🚀 Quick Access

### Step 1: Go to Admin Dashboard
1. Navigate to **`/dashboard`** or click the dashboard link
2. You should see the admin sidebar on the left

### Step 2: Find the About Us Menu Item
In the **Left Sidebar**, under **Platform Management** section:
- Look for the 📋 **"About Us"** menu item
- It appears after "Services" and before the Sign Out button
- Only visible to admin users (you must be logged in as an admin)

### Step 3: Click About Us
- Click the **"About Us"** menu item
- You'll be taken to `/dashboard?tab=aboutus`
- The DashAboutUs component will load with 6 editable tabs

---

## 📝 Editing Content

### 6 Tabs Available

#### 1️⃣ **Hero Section** (🎯)
- **Hero Title**: Main headline displayed on the About Us page
- **Hero Subtitle**: Tagline/description below the title
- **Hero Image URL**: Logo or banner image (Cloudinary URL)

**Example Hero Title:**
```
"Transforming Compliance Into Competitive Advantage"
```

#### 2️⃣ **Mission & Vision** (🎯)
- **Mission Statement**: Company's core purpose and values
- **Vision Statement**: Long-term goals and aspirations

**Example Mission:**
```
"At Ecodeed Consulting, we empower businesses, governments, and 
communities to navigate environmental compliance, implement sustainable 
practices, and future-proof their operations—so no dream is lost due to 
regulatory hurdles."
```

#### 3️⃣ **Founder** (👤)
- **Founder Name**: Full name of the founder
- **Founder Biography**: Background, experience, and achievements
- **Founder Image URL**: Profile photo (Cloudinary URL)

#### 4️⃣ **Values** (💎)
- Click **"+ Add Value"** to add new values
- Each value has:
  - **Name** (e.g., "Integrity", "Innovation")
  - **Description** (e.g., "Honest and transparent in all dealings")
- Click **✕** to remove a value

**Default Values:**
- Integrity
- Innovation
- Impact
- Excellence

#### 5️⃣ **Metrics** (📊)
- Click **"+ Add Metric"** to add new metrics
- Each metric has:
  - **Label** (e.g., "Clients Served")
  - **Value** (e.g., "500+")
- Click **✕** to remove a metric

**Default Metrics:**
- Clients Served: 500+
- Projects Completed: 1000+
- Years of Experience: 15+

#### 6️⃣ **Team** (👥)
- Click **"+ Add Team Member"** to add new team members
- Each member has:
  - **Name** (full name)
  - **Role** (job title)
  - **Bio** (background/description)
  - **Image URL** (profile photo - Cloudinary URL)
- Click **✕** to remove a team member

---

## 💾 Auto-Save Features

✓ **Automatic Saving**: Changes are automatically saved every 5 seconds
- You'll see "Saving..." indicator when changes are being saved
- Green checkmark ✓ "All changes saved" appears when complete
- No need to click a Save button!

✓ **Error Handling**: 
- If an error occurs, you'll see a red alert
- Check the error message and try again

---

## 🔐 Permissions

- **Admins**: Can view and edit all About Us content
- **Other Users**: Can only view the public About Us page (read-only)
- **Unauthenticated Users**: Cannot access the admin dashboard

---

## 🌐 API Endpoint

**Public endpoint** (accessible to everyone):
```
GET /api/v1/aboutus/
```

**Admin endpoint** (edit):
```
PUT /api/v1/aboutus/1/
PATCH /api/v1/aboutus/1/
```

---

## 📸 Using Cloudinary URLs

For images (hero, founder, team), use Cloudinary URLs:

**Example:**
```
https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png
```

To get a Cloudinary URL:
1. Upload your image to Cloudinary
2. Copy the full URL from the delivery URL
3. Paste into the URL field in the admin panel

---

## 🎨 Dark Mode Support

The About Us editor fully supports dark mode:
- All form fields adapt to light/dark theme
- Tab navigation styled for both modes
- Perfect contrast for readability

---

## ✅ Quick Workflow

1. **Open Admin Dashboard** → Click "About Us" in sidebar
2. **Select a tab** (Hero, Mission, Founder, Values, Metrics, Team)
3. **Edit content** in the form fields
4. **Add/Remove items** as needed (for Values, Metrics, Team)
5. **Wait for auto-save** (5 seconds) → Green checkmark appears
6. **Public about page** automatically reflects your changes

---

## 🐛 Troubleshooting

**Q: About Us menu item not showing?**
- Make sure you're logged in as an admin user
- Check that `isAdmin` is `true` in your user profile

**Q: Changes not saving?**
- Check browser console for error messages
- Ensure backend API is running (`docker-compose ps`)
- Verify network tab shows successful API requests

**Q: API returns 404?**
- Backend needs to be restarted: `docker-compose restart backend`
- Default About Us content needs to be created: `docker exec ecodeed_academy_backend_1 python manage.py init_aboutus`

**Q: Images not loading?**
- Use valid Cloudinary URLs (starts with `https://res.cloudinary.com/`)
- Check that the image URL is correct
- Copy the full delivery URL, not just the media ID

---

## 📱 Responsive Design

The About Us editor works on:
- ✓ Desktop (full-featured sidebar)
- ✓ Tablet (optimized layout)
- ✓ Mobile (collapsed sidebar with hamburger menu)

---

## 🚀 Next Steps

After editing the About Us content:

1. **Public Page**: The `/about` page will automatically display the new content
2. **Preview**: Visit `/about` to see how it looks to the public
3. **Refine**: Go back to the admin panel and make adjustments as needed

---

## 📞 Support

If you encounter issues:
1. Check browser console for error messages (F12)
2. Check backend logs: `docker logs ecodeed_academy_backend_1`
3. Verify all containers are running: `docker-compose ps`
4. Restart backend if needed: `docker-compose restart backend`
