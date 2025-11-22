/**
 * Transform React Flow nodes to backend format
 */
export function transformNodesToBackendFormat(nodes, edges = []) {
  return nodes.map(node => {
    const basePosition = {
      posX: node.position.x.toString(),
      posY: node.position.y.toString(),
    };

    // Start Node
    if (node.type === 'flowStartNode' || node.id === 'start') {
      return {
        id: node.id,
        flowNodeType: 'flowStartNode',
        flowNodePosition: basePosition,
        data: { label: node.data.label || '' },
      };
    }

    // Text Button Node
    if (node.type === 'text-button') {
      const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
      
      // Enrich buttons with edge connections
      const enrichedButtons = buttons.map(btn => {
        const buttonHandle = `btn-${btn.id}`;
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === buttonHandle);
        return {
          id: btn.id,
          title: btn.text || btn.buttonText || '',
          nodeResultId: edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || ''),
        };
      });
      
      return {
        id: node.id,
        type: 'text-button',
        flowNodeType: 'InteractiveButtons',
        flowNodePosition: basePosition,
        interactiveButtonsHeader: node.data.interactiveButtonsHeader || { type: 'Text', text: '', media: null },
        interactiveButtonsBody: node.data.text || node.data.interactiveButtonsBody || '',
        interactiveButtonsFooter: node.data.interactiveButtonsFooter || '',
        interactiveButtonsItems: enrichedButtons,
        isStartNode: false,
      };
    }

    // Media Button Node
    if (node.type === 'media-button') {
      const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
      const mediaTypeMap = { video: 'Video', document: 'Document', image: 'Image' };
      
      // Enrich buttons with edge connections
      const enrichedButtons = buttons.map(btn => {
        const buttonHandle = `btn-${btn.id}`;
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === buttonHandle);
        return {
          id: btn.id,
          title: btn.text || btn.buttonText || '',
          nodeResultId: edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || ''),
        };
      });
      
      return {
        id: node.id,
        type: 'media-button',
        flowNodeType: 'MediaButton',
        flowNodePosition: basePosition,
        mediaType: node.data.mediaType || 'image',
        mediaUrl: node.data.mediaUrl || '',
        caption: node.data.caption || '',
        interactiveButtonsItems: enrichedButtons,
        isStartNode: false,
      };
    }

    // List Node
    if (node.type === 'list') {
      return {
        id: node.id,
        type: 'list',
        flowNodeType: 'List',
        flowNodePosition: basePosition,
        listHeader: node.data.listHeader || '',
        listBody: node.data.listBody || '',
        listFooter: node.data.listFooter || '',
        listSections: node.data.listSections || [],
        isStartNode: false,
      };
    }

    // Question Node
    if (node.type === 'ask-question') {
      return {
        id: node.id,
        type: 'ask-question',
        flowNodeType: 'AskQuestion',
        flowNodePosition: basePosition,
        questionText: node.data.questionText || '',
        customField: node.data.customField || '',
        validationType: node.data.validationType || 'None',
        isMediaAccepted: node.data.isMediaAccepted || false,
        expectedAnswers: node.data.expectedAnswers || [],
        isStartNode: false,
      };
    }

    // Address Node
    if (node.type === 'ask-address') {
      return {
        id: node.id,
        type: 'ask-address',
        flowNodeType: 'AskAddress',
        flowNodePosition: basePosition,
        questionText: node.data.questionText || '',
        customField: node.data.customField || '',
        isStartNode: false,
      };
    }

    // Location Node
    if (node.type === 'ask-location') {
      return {
        id: node.id,
        type: 'ask-location',
        flowNodeType: 'AskLocation',
        flowNodePosition: basePosition,
        questionText: node.data.questionText || '',
        longitudeField: node.data.longitudeField || '',
        latitudeField: node.data.latitudeField || '',
        isStartNode: false,
      };
    }

    // Single Product Node
    if (node.type === 'single-product') {
      return {
        id: node.id,
        type: 'single-product',
        flowNodeType: 'SingleProduct',
        flowNodePosition: basePosition,
        body: node.data.body || '',
        footer: node.data.footer || '',
        product: node.data.product || {},
        isStartNode: false,
      };
    }

    // Multi Product Node
    if (node.type === 'multi-product') {
      return {
        id: node.id,
        type: 'multi-product',
        flowNodeType: 'MultiProduct',
        flowNodePosition: basePosition,
        header: node.data.header || '',
        body: node.data.body || '',
        footer: node.data.footer || '',
        products: node.data.products || [],
        isStartNode: false,
      };
    }

    // Catalog Node
    if (node.type === 'catalog') {
      return {
        id: node.id,
        type: 'catalog',
        flowNodeType: 'Catalog',
        flowNodePosition: basePosition,
        body: node.data.body || '',
        footer: node.data.footer || '',
        isStartNode: false,
      };
    }

    // Summary Node
    if (node.type === 'summary') {
      return {
        id: node.id,
        type: 'summary',
        flowNodeType: 'Summary',
        flowNodePosition: basePosition,
        messageText: node.data.messageText || '',
        title: node.data.title || 'Summary',
        includeTimestamp: node.data.includeTimestamp || false,
        isStartNode: false,
      };
    }

    // Set Variable Node
    if (node.type === 'set-variable') {
      return {
        id: node.id,
        type: 'set-variable',
        flowNodeType: 'SetVariable',
        flowNodePosition: basePosition,
        variableName: node.data.variableName || '',
        value: node.data.value || '',
        isStartNode: false,
      };
    }

    // Set Custom Field Node
    if (node.type === 'set-custom-field') {
      return {
        id: node.id,
        type: 'set-custom-field',
        flowNodeType: 'SetCustomField',
        flowNodePosition: basePosition,
        customField: node.data.customField || '',
        value: node.data.value || '',
        isStartNode: false,
      };
    }

    // Template Node
    if (node.type === 'template') {
      return {
        id: node.id,
        type: 'template',
        flowNodeType: 'Template',
        flowNodePosition: basePosition,
        templateId: node.data.templateId || '',
        templateName: node.data.templateName || '',
        selectedTemplate: node.data.selectedTemplate || null,
        isStartNode: false,
      };
    }

    // Fallback for unknown types
    console.warn(`Unknown node type: ${node.type}`, node);
    return {
      id: node.id,
      type: node.type,
      flowNodeType: node.type,
      flowNodePosition: basePosition,
      data: node.data,
      isStartNode: false,
    };
  });
}

/**
 * Transform React Flow edges to backend format
 */
export function transformEdgesToBackendFormat(edges) {
  return edges.map(edge => ({
    id: edge.id,
    sourceNodeId: edge.sourceHandle ? `${edge.source}${edge.sourceHandle}` : edge.source,
    targetNodeId: edge.targetHandle ? `${edge.target}${edge.targetHandle}` : edge.target,
  }));
}
