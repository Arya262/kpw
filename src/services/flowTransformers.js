/**
 * Transform React Flow nodes to backend format
 */
export function transformNodesToBackendFormat(nodes, edges = []) {
  // Find the first node connected to start (we'll merge it into start node)
  const startNode = nodes.find(n => n.type === 'flowStartNode' || n.id === 'start');
  const startEdge = startNode ? edges.find(e => e.source === startNode.id) : null;
  const firstNodeId = startEdge ? startEdge.target : null;
  
  return nodes
    .filter(node => node.id !== firstNodeId) // Exclude first node since it's merged into start
    .map(node => {
    const basePosition = {
      posX: node.position.x.toString(),
      posY: node.position.y.toString(),
    };

    // Start Node - merge with first connected node
    if (node.type === 'flowStartNode' || node.id === 'start') {
      // Find the first node connected to start
      const startEdge = edges.find(e => e.source === node.id);
      const firstNode = startEdge ? nodes.find(n => n.id === startEdge.target) : null;
      
      let flowReplies = null;
      
      // If there's a first node, merge its content into start node
      if (firstNode) {
        if (firstNode.type === 'text') {
          flowReplies = {
            type: 'text',
            text: {
              preview_url: true,
              body: firstNode.data?.text || '',
            }
          };
        } else if (firstNode.type === 'media') {
          const mediaType = firstNode.data?.mediaType || 'image';
          const mediaUrl = firstNode.data?.mediaUrl || '';
          const caption = firstNode.data?.caption || '';
          
          flowReplies = {
            type: mediaType,
            [mediaType]: {
              url: mediaUrl,
              ...(caption && { caption }),
              ...(mediaType === 'document' && { filename: firstNode.data?.filename || 'document.pdf' })
            }
          };
        } else if (firstNode.type === 'text-button') {
          const buttons = firstNode.data?.interactiveButtonsItems || firstNode.data?.buttons || [];
          const body = firstNode.data?.text || firstNode.data?.interactiveButtonsBody || '';
          const header = firstNode.data?.interactiveButtonsHeader || {};
          const footer = firstNode.data?.interactiveButtonsFooter || '';
          
          const actionButtons = buttons.map(btn => {
            const buttonHandle = `btn-${btn.id}`;
            const edge = edges.find(e => e.source === firstNode.id && e.sourceHandle === buttonHandle);
            const targetNodeId = edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || '');
            
            return {
              type: 'reply',
              reply: {
                id: targetNodeId || btn.id,
                title: btn.text || btn.buttonText || '',
              },
            };
          });
          
          const interactive = {
            type: 'button',
            body: { text: body },
            action: { buttons: actionButtons },
          };
          
          if (header.text && header.text.trim()) {
            interactive.header = {
              type: header.type || 'text',
              text: header.text,
            };
          }
          
          if (footer) {
            interactive.footer = { text: footer };
          }
          
          flowReplies = {
            type: 'interactive',
            interactive
          };
        } else if (firstNode.type === 'media-button') {
          const buttons = firstNode.data?.interactiveButtonsItems || firstNode.data?.buttons || [];
          const mediaType = firstNode.data?.mediaType || 'image';
          const mediaUrl = firstNode.data?.mediaUrl || '';
          const caption = firstNode.data?.caption || '';
          const footer = firstNode.data?.interactiveButtonsFooter || '';
          
          const actionButtons = buttons.map(btn => {
            const buttonHandle = `btn-${btn.id}`;
            const edge = edges.find(e => e.source === firstNode.id && e.sourceHandle === buttonHandle);
            const targetNodeId = edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || '');
            
            return {
              type: 'reply',
              reply: {
                id: targetNodeId || btn.id,
                title: btn.text || btn.buttonText || '',
              },
            };
          });
          
          const interactive = {
            type: 'button',
            header: {
              type: mediaType,
              [mediaType]: { url: mediaUrl },
            },
            body: { text: caption || '' },
            action: { buttons: actionButtons },
          };
          
          if (footer) {
            interactive.footer = { text: footer };
          }
          
          flowReplies = {
            type: 'interactive',
            interactive
          };
        }
      }
      
      return {
        id: node.id,
        flowNodeType: 'start',
        flowNodePosition: basePosition,
        flowReplies,
        // Store trigger config separately
        triggerConfig: {
          keywords: node.data?.keywords || [],
          regex: node.data?.regex || '',
          caseSensitive: node.data?.caseSensitive || false,
        }
      };
    }

    // Simple Text Node (no buttons)
    if (node.type === 'text') {
      return {
        id: node.id,
        flowNodeType: 'text',
        flowReplies: {
          type: 'text',
          text: {
            preview_url: true,
            body: node.data.text || '',
          },
        },
        flowNodePosition: basePosition,
      };
    }

    // Simple Media Node (no buttons)
    if (node.type === 'media') {
      const mediaType = node.data.mediaType || 'image';
      const mediaUrl = node.data.mediaUrl || '';
      const caption = node.data.caption || '';
      
      const mediaObject = {
        url: mediaUrl,
      };
      
      if (caption) {
        mediaObject.caption = caption;
      }
      
      if (mediaType === 'document') {
        mediaObject.filename = node.data.filename || 'document.pdf';
      }
      
      return {
        id: node.id,
        flowNodeType: mediaType,
        flowReplies: {
          type: mediaType,
          [mediaType]: mediaObject,
        },
        flowNodePosition: basePosition,
      };
    }

    // Text Button Node
    if (node.type === 'text-button') {
      const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
      const header = node.data.interactiveButtonsHeader || {};
      const body = node.data.text || node.data.interactiveButtonsBody || '';
      const footer = node.data.interactiveButtonsFooter || '';
      
      const actionButtons = buttons.map(btn => {
        const buttonHandle = `btn-${btn.id}`;
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === buttonHandle);
        const targetNodeId = edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || '');
        
        return {
          type: 'reply',
          reply: {
            id: targetNodeId || btn.id,
            title: btn.text || btn.buttonText || '',
          },
        };
      });
      
      const interactive = {
        type: 'button',
        body: {
          text: body,
        },
        action: {
          buttons: actionButtons,
        },
      };
      
      if (header.text && header.text.trim()) {
        interactive.header = {
          type: header.type || 'text',
          text: header.text,
        };
      }
      
      if (footer) {
        interactive.footer = { text: footer };
      }
      
      return {
        id: node.id,
        flowNodeType: 'textbutton',
        flowReplies: {
          type: 'interactive',
          interactive,
        },
        flowNodePosition: basePosition,
      };
    }

    // Media Button Node
    if (node.type === 'media-button') {
      const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
      const mediaType = node.data.mediaType || 'image';
      const mediaUrl = node.data.mediaUrl || '';
      const caption = node.data.caption || '';
      const footer = node.data.interactiveButtonsFooter || '';
      
      const actionButtons = buttons.map(btn => {
        const buttonHandle = `btn-${btn.id}`;
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === buttonHandle);
        const targetNodeId = edge ? edge.target : (btn.targetNodeId || btn.nodeResultId || '');
        
        return {
          type: 'reply',
          reply: {
            id: targetNodeId || btn.id,
            title: btn.text || btn.buttonText || '',
          },
        };
      });
      
      const interactive = {
        type: 'button',
        header: {
          type: mediaType,
          [mediaType]: { url: mediaUrl },
        },
        body: {
          text: caption || '',
        },
        action: {
          buttons: actionButtons,
        },
      };
      
      if (footer) {
        interactive.footer = { text: footer };
      }
      
      return {
        id: node.id,
        flowNodeType: 'mediabutton',
        flowReplies: {
          type: 'interactive',
          interactive,
        },
        flowNodePosition: basePosition,
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
    
    // Clean data by removing React-specific props
    const cleanData = {};
    if (node.data) {
      Object.keys(node.data).forEach(key => {
        // Skip React-specific or function props
        if (key !== 'updateNodeData' && typeof node.data[key] !== 'function') {
          cleanData[key] = node.data[key];
        }
      });
    }
    
    return {
      id: node.id,
      type: node.type,
      flowNodeType: node.type,
      flowNodePosition: basePosition,
      ...cleanData,
      isStartNode: false,
    };
  });
}

/**
 * Transform React Flow edges to backend format
 */
export function transformEdgesToBackendFormat(edges, nodes = []) {
  // Find the start node and its first connected node
  const startNode = nodes.find(n => n.type === 'flowStartNode' || n.id === 'start');
  const startEdge = startNode ? edges.find(e => e.source === startNode.id) : null;
  const firstNodeId = startEdge ? startEdge.target : null;
  
  return edges
    .filter(edge => {
      // Exclude the edge from start to first node (it's implicit in start node's flowReplies)
      if (edge.source === 'start' && edge.target === firstNodeId) {
        return false;
      }
      // Exclude any edges from the first node (since it's merged into start)
      if (edge.source === firstNodeId) {
        return false;
      }
      return true;
    })
    .map(edge => ({
      id: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
    }));
}
