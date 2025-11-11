# WhatsApp Drip Campaign Feature

## Overview
The Drip Campaign feature allows users to create automated WhatsApp message sequences that are sent to contacts over time with configurable delays between messages.

## Features Implemented

### ✅ Campaign Management
- **Create Campaign**: Build multi-step message sequences
- **Edit Campaign**: Modify existing campaigns
- **Delete Campaign**: Remove campaigns
- **Pause/Resume**: Control campaign execution
- **View Analytics**: Track campaign performance

### ✅ Campaign Builder
- **Step-by-Step Configuration**: Add multiple message steps
- **Template Selection**: Choose from approved WhatsApp templates
- **Delay Configuration**: Set delays in minutes, hours, or days
- **Target Audience**: Select all contacts, specific groups, or tags
- **Trigger Types**: Manual start (more triggers coming soon)

### ✅ User Interface
- **Campaign List**: Card-based view with filters and search
- **Campaign Stats**: Overview metrics dashboard
- **Campaign Editor**: Intuitive step builder
- **Analytics Dashboard**: Detailed performance tracking
- **Mobile Responsive**: Works on all screen sizes

### ✅ Permissions & RBAC
- View drip campaigns
- Create drip campaigns
- Edit drip campaigns
- Delete drip campaigns
- Activate/pause campaigns
- Enroll contacts

## File Structure

```
kpw/src/features/drip/
├── components/
│   ├── CampaignCard.jsx          # Campaign card component
│   ├── EmptyState.jsx            # Empty state when no campaigns
│   ├── StepCard.jsx              # Individual step display
│   ├── StepEditor.jsx            # Step configuration modal
│   ├── TargetSelector.jsx        # Audience selection
│   └── TriggerSelector.jsx       # Trigger type selection
├── DripCampaigns.jsx             # Main campaigns page
├── DripCampaignList.jsx          # Campaign list with pagination
├── DripCampaignStats.jsx         # Statistics dashboard
├── DripCampaignEditor.jsx        # Campaign builder/editor
├── DripCampaignAnalytics.jsx     # Analytics page
└── README.md                     # This file
```

## Usage

### Creating a Campaign

1. Navigate to "Drip Campaign" in the sidebar
2. Click "Create New Sequence"
3. Fill in campaign details:
   - Campaign name
   - Description (optional)
   - Select trigger type (currently manual only)
   - Choose target audience
4. Add message steps:
   - Click "Add Step"
   - Select a WhatsApp template
   - Set delay time
   - Save step
5. Click "Save & Activate" or "Save Draft"

### Managing Campaigns

- **View**: Click on a campaign card to see details
- **Edit**: Click the edit icon in the campaign menu
- **Pause/Resume**: Use the toggle in the campaign menu
- **Delete**: Click delete in the campaign menu
- **Analytics**: Click "Analytics" to view performance

### Campaign Status

- **Draft**: Campaign is being created
- **Active**: Campaign is running and enrolling contacts
- **Paused**: Campaign is temporarily stopped
- **Completed**: All enrollments have finished
- **Archived**: Campaign is archived

## API Endpoints Used

```javascript
GET    /drip-campaigns                    // List campaigns
GET    /drip-campaigns/:id                // Get campaign details
POST   /drip-campaigns                    // Create campaign
PUT    /drip-campaigns/:id                // Update campaign
DELETE /drip-campaigns/:id                // Delete campaign
POST   /drip-campaigns/:id/toggle-status  // Activate/pause
POST   /drip-campaigns/:id/enroll         // Enroll contacts
GET    /drip-campaigns/:id/analytics      // Get analytics
GET    /drip-campaigns/:id/enrollments    // Get enrollments
```

## Permissions

The feature uses the existing RBAC system with these permissions:

- `canViewDripCampaigns`: View campaigns list
- `canAddDripCampaign`: Create new campaigns
- `canEditDripCampaign`: Edit existing campaigns
- `canDeleteDripCampaign`: Delete campaigns
- `canActivateDripCampaign`: Activate/pause campaigns
- `canEnrollDripCampaign`: Manually enroll contacts

## Custom Hook

Use the `useDripCampaigns` hook for API operations:

```javascript
import { useDripCampaigns } from '../../hooks/useDripCampaigns';

const { 
  loading, 
  error, 
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  enrollContacts,
  fetchAnalytics 
} = useDripCampaigns(user.customer_id);
```

## Backend Requirements

For this frontend to work, the backend needs to implement:

1. **Database Tables**:
   - `drip_campaigns`
   - `drip_campaign_steps`
   - `drip_campaign_enrollments`
   - `drip_campaign_logs`

2. **API Controllers**:
   - Campaign CRUD operations
   - Enrollment management
   - Analytics endpoints

3. **Execution Engine**:
   - Cron job scheduler
   - Message executor
   - Status tracking

See `WHATSAPP_DRIP_CAMPAIGN_IMPLEMENTATION_PLAN.md` in the root directory for complete backend implementation details.

## Future Enhancements

- [ ] Drag-and-drop step reordering
- [ ] Conditional branching based on user actions
- [ ] A/B testing support
- [ ] More trigger types (scheduled, webhook, tag-based)
- [ ] Visual flow diagram
- [ ] Campaign templates library
- [ ] Export/import campaigns
- [ ] Real-time campaign monitoring
- [ ] Advanced segmentation
- [ ] Multi-language support

## Testing

To test the feature:

1. Ensure backend API endpoints are implemented
2. Create a test campaign with 2-3 steps
3. Verify campaign appears in the list
4. Test edit functionality
5. Test pause/resume
6. Check analytics page
7. Test on mobile devices

## Troubleshooting

### Campaign not appearing
- Check if backend API is running
- Verify customer_id is being sent correctly
- Check browser console for errors

### Templates not loading
- Ensure templates API endpoint is working
- Verify templates are approved in WhatsApp

### Steps not saving
- Check form validation
- Verify template is selected
- Check network tab for API errors

## Support

For issues or questions:
1. Check the implementation plan document
2. Review API endpoint responses
3. Check browser console for errors
4. Verify permissions are set correctly
