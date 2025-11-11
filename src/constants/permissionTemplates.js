export const PERMISSION_TEMPLATES = {
  manager: {
    contacts: {
      view: true,
      add: true,
      edit: true,
      delete: false,
      export: false,
    },
    broadcasts: {
      view: true,
      create: true,
    },
    templates: {
      view: true,
      create: false,
      delete: false,
    },
    chats: {
      view: true,
      send: true,
      delete: false,
    },
    analytics: {
      view: true,
      export: false,
    },
    settings: {
      view: false,
      edit: false,
      delete: false,
    },
    users: {
      view: false,
      add: false,
      edit: false,
      delete: false,
    },
  },
  agent: {
    contacts: {
      view: true,
      add: true,
      edit: true,
      delete: false,
      export: false,
    },
    broadcasts: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    templates: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    chats: {
      view: true,
      send: true,
      delete: false,
    },
    analytics: {
      view: true,
      export: false,
    },
    settings: {
      view: false,
      edit: false,
    },
    users: {
      view: false,
      manage: false,
    },
  },
  viewer: {
    contacts: {
      view: true,
      add: false,
      edit: false,
      delete: false,
      export: false,
    },
    broadcasts: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    templates: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    chats: {
      view: true,
      send: false,
      delete: false,
    },
    analytics: {
      view: true,
      export: false,
    },
    settings: {
      view: false,
      edit: false,
    },
    users: {
      view: false,
      manage: false,
    },
  },
};

// Default permissions structure (all false)
export const DEFAULT_PERMISSIONS = {
  contacts: {
    view: false,
    add: false,
    edit: false,
    delete: false,
    export: false,
  },
  broadcasts: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  templates: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  chats: {
    view: false,
    send: false,
    delete: false,
  },
  analytics: {
    view: false,
    export: false,
  },
  settings: {
    view: false,
    edit: false,
  },
  users: {
    view: false,
    manage: false,
  },
};

// Helper function to merge permissions
export const mergePermissions = (base, override) => {
  const result = JSON.parse(JSON.stringify(base)); // Deep clone
  
  Object.keys(override).forEach((module) => {
    if (result[module]) {
      result[module] = { ...result[module], ...override[module] };
    } else {
      result[module] = override[module];
    }
  });
  
  return result;
};

