import { toast } from "react-toastify";

// Utility function for toast notifications
export const showToast = (message, type = "success") => {
  toast[type](message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  });
};

// Utility function for permission checks
export const checkPermission = (permission, action, permissions) => {
  if (!permissions[permission]) {
    showToast(`You do not have permission to ${action}.`, "error");
    return false;
  }
  return true;
};

// Date filtering utilities
export const isDateInQuickFilter = (date, quickFilter) => {
  if (!quickFilter) return true;
  const contactDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (quickFilter) {
    case 'In 24hr': {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      return contactDate >= startDate;
    }
    case 'This Week': {
      const startDate = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      return contactDate >= startDate;
    }
    case 'This Month': {
      const startDate = new Date(today);
      startDate.setDate(1);
      return contactDate >= startDate;
    }
    case 'Today':
      return contactDate >= today;
    default:
      return true;
  }
};

export const isDateInRange = (date, fromDate, toDate) => {
  if (!fromDate && !toDate) return true;
  const contactDate = new Date(date);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  if (from && to) {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return contactDate >= from && contactDate <= to;
  } else if (from) {
    from.setHours(0, 0, 0, 0);
    return contactDate >= from;
  } else if (to) {
    to.setHours(23, 59, 59, 999);
    return contactDate <= to;
  }
  return true;
};

// Contact filtering logic
export const filterContacts = (contacts, filter, filterOptions) => {
  return contacts.filter((contact) => {
    const statusMatch = filter === "All" || contact.status === filter;
    const nameMatch = !filterOptions.name ||
      (contact.first_name + ' ' + (contact.last_name || '')).toLowerCase().includes(filterOptions.name.toLowerCase());
    const phoneMatch = !filterOptions.phone ||
      (contact.mobile_no || '').includes(filterOptions.phone);
    const emailMatch = !filterOptions.email ||
      (contact.email || '').toLowerCase().includes(filterOptions.email.toLowerCase());
    const groupMatch = !filterOptions.group ||
      (contact.group_name || '').toLowerCase() === filterOptions.group.toLowerCase();
    const lastSeenMatch = isDateInQuickFilter(
      contact.last_seen_at || contact.updated_at,
      filterOptions.lastSeenQuick
    ) && isDateInRange(
      contact.last_seen_at || contact.updated_at,
      filterOptions.lastSeenFrom,
      filterOptions.lastSeenTo
    );
    const createdAtMatch = isDateInQuickFilter(
      contact.created_at,
      filterOptions.createdAtQuick
    ) && isDateInRange(
      contact.created_at,
      filterOptions.createdAtFrom,
      filterOptions.createdAtTo
    );
    const optedInMatch = filterOptions.optedIn === 'All' ||
      (filterOptions.optedIn === 'Yes' && contact.opted_in === true) ||
      (filterOptions.optedIn === 'No' && contact.opted_in !== true);
    const blockedMatch = filterOptions.incomingBlocked === 'All' ||
      (filterOptions.incomingBlocked === 'Yes' && contact.is_blocked === true) ||
      (filterOptions.incomingBlocked === 'No' && contact.is_blocked !== true);
    const readStatusMatch = filterOptions.readStatus === 'All' ||
      (filterOptions.readStatus === 'Read' && contact.is_read === true) ||
      (filterOptions.readStatus === 'Unread' && contact.is_read !== true);
    let attributeMatch = true;
    if (filterOptions.attribute && filterOptions.attributeValue) {
      const attributeValue = contact.attributes?.[filterOptions.attribute] || '';
      const searchValue = filterOptions.attributeValue.toLowerCase();
      switch (filterOptions.operator) {
        case 'is':
          attributeMatch = attributeValue.toLowerCase() === searchValue;
          break;
        case 'isNot':
          attributeMatch = attributeValue.toLowerCase() !== searchValue;
          break;
        case 'contains':
          attributeMatch = attributeValue.toLowerCase().includes(searchValue);
          break;
        default:
          attributeMatch = true;
      }
    }
    return statusMatch && nameMatch && phoneMatch && emailMatch && groupMatch &&
      lastSeenMatch && createdAtMatch && optedInMatch && blockedMatch &&
      readStatusMatch && attributeMatch;
  });
};

// CSV export utility
export const exportContactsToCSV = (contacts, filename = 'contacts') => {
  const escapeCSV = (str) => (str ? `"${str.replace(/"/g, '""')}"` : '""');
  const headers = ['First Name', 'Last Name', 'Country Code', 'Mobile No'];
  const csvContent = [
    headers.join(','),
    ...contacts.map((contact) =>
      [
        escapeCSV(contact.first_name),
        escapeCSV(contact.last_name),
        escapeCSV(contact.country_code),
        escapeCSV(contact.mobile_no),
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Permission checks for contacts
export const canEditContact = (contact, user, permissions) => {
  if (!permissions.canEdit) return false;
  if (user?.role?.toLowerCase?.() === "user") {
    return contact.created_by === user?.id;
  }
  return true;
};

export const canDeleteContact = (contact, user, permissions) => {
  if (!permissions.canDelete) return false;
  if (user?.role?.toLowerCase?.() === "user") {
    return contact.created_by === user?.id;
  }
  return true;
};
