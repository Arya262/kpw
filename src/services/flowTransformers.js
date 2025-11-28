// ============================================================================
//  FLOW TRANSFORM SERVICE — COMPLETE PRODUCTION VERSION
// ============================================================================
//  Includes:
//  ✔ Node Type Maps
//  ✔ Helper Utilities
//  ✔ Frontend → Backend Node Transform
//  ✔ Backend → Frontend Node Transform
//  ✔ Edge Transforms
//  ✔ Button Edge Rebuild
//  ✔ Merge Edges
//  ✔ Master (Save / Load) Functions
// ============================================================================



// ============================================================================
// SECTION 1 — NODE TYPE MAPS
// ============================================================================

export const FRONTEND_TO_BACKEND_NODE_TYPES = {
  "flowstartnode": "start",
  "text": "text",
  "media": "media",
  "text-button": "textbutton",
  "media-button": "mediabutton",
  "list": "list",
  "ask-question": "askquestion",
  "ask-address": "askaddress",
  "ask-location": "asklocation",
  "single-product": "singleproduct",
  "multi-product": "multiproduct",
  "catalog": "catalog",
  "summary": "summary",
  "set-variable": "setvariable",
  "set-custom-field": "setcustomfield",
  "template": "template"
};

export const BACKEND_TO_FRONTEND_NODE_TYPES = {
  "start": "flowStartNode",
  "text": "text",
  "media": "media",
  "image": "media",
  "video": "media",
  "document": "media",
  "textbutton": "text-button",
  "mediabutton": "media-button",
  "list": "list",
  "askquestion": "ask-question",
  "askaddress": "ask-address",
  "asklocation": "ask-location",
  "singleproduct": "single-product",
  "multiproduct": "multi-product",
  "catalog": "catalog",
  "summary": "summary",
  "setvariable": "set-variable",
  "setcustomfield": "set-custom-field",
  "template": "template"
};


// ============================================================================
// SECTION 2 — HELPER UTILITIES
// ============================================================================

export function extractButtonIndex(btnId) {
  if (!btnId) return "";
  const parts = btnId.split("-");
  return parts[parts.length - 1];
}

export function buildMediaObject(mediaType, data) {
  const obj = {
    id: data.mediaId || data.mediaUrl || data.id || ""
  };

  if (data.caption) obj.caption = data.caption;

  if (mediaType === "document") {
    obj.filename = data.filename || "document.pdf";
  }

  return obj;
}

export function buildInteractiveHeader(d) {
  if (!d.mediaType) return null;

  const mediaType = d.mediaType;

  const mediaObj = buildMediaObject(mediaType, {
    mediaId: d.mediaId,
    mediaUrl: d.mediaUrl,
    caption: d.caption,
    filename: d.filename
  });

  return {
    type: mediaType,
    [mediaType]: mediaObj
  };
}

export function positionToBackend(pos) {
  return {
    posX: String(pos.x ?? 0),
    posY: String(pos.y ?? 0)
  };
}

export function positionFromBackend(fPos) {
  return {
    x: parseFloat(fPos?.posX || 0),
    y: parseFloat(fPos?.posY || 0)
  };
}

export const safe = (v, fallback = "") =>
  v === undefined || v === null ? fallback : v;



// ============================================================================
// SECTION 3 — FRONTEND → BACKEND NODE TRANSFORM
// ============================================================================

export function transformNodesToBackendFormat(nodes, edges = []) {
  return nodes.map(node => {
    const d = node.data || {};
    const backendType =
      FRONTEND_TO_BACKEND_NODE_TYPES[node.type?.toLowerCase()] ||
      node.type?.toLowerCase();

    const flowNodePosition = positionToBackend(node.position);

    // Find target node for a button by its ID
    // Handle format is "btn-{buttonId}" where buttonId is the button's UUID
    const getButtonTarget = (btnId) => {
      const handle = `btn-${btnId}`;
      const edge = edges.find(
        e => e.source === node.id && e.sourceHandle === handle
      );
      return edge?.target || "";
    };


    // ============================================================
    // START NODE
    // ============================================================
    if (backendType === "start") {
      const triggerConfig = {};

      if (Array.isArray(d.keywords) && d.keywords.length)
        triggerConfig.keywords = d.keywords;
      if (d.regex) triggerConfig.regex = d.regex;
      if (d.caseSensitive) triggerConfig.caseSensitive = true;

      return {
        id: node.id,
        flowNodeType: "start",
        mimeType: "",
        config: { triggerConfig },
        flowNodePosition
      };
    }


    // ============================================================
    // TEXT NODE
    // ============================================================
    if (backendType === "text") {
      return {
        id: node.id,
        flowNodeType: "text",
        mimeType: "",
        flowReplies: {
          type: "text",
          text: {
            preview_url: true,
            body: safe(d.text)
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // MEDIA NODE (image / video / document)
    // ============================================================
    if (backendType === "media") {
      const mediaType = d.mediaType || "image";

      return {
        id: node.id,
        flowNodeType: mediaType,
        mimeType: "",
        flowReplies: {
          type: mediaType,
          [mediaType]: buildMediaObject(mediaType, {
            mediaId: d.mediaId,
            mediaUrl: d.mediaUrl,
            caption: d.caption,
            filename: d.filename
          })
        },
        flowNodePosition
      };
    }


    // ============================================================
    // TEXT-BUTTON
    // ============================================================
    if (backendType === "textbutton") {
      const sourceButtons =
        Array.isArray(d.buttons) && d.buttons.length > 0
          ? d.buttons
          : d.interactiveButtonsItems || [];

      const buttons = sourceButtons.map(btn => {
        const targetNodeId = getButtonTarget(btn.id);
        return {
          type: "reply",
          reply: {
            id: targetNodeId || btn.id,
            title: safe(btn.text)
          }
        };
      });

      return {
        id: node.id,
        flowNodeType: "textbutton",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "button",
            header: {
              type: "text",
              text: safe(d.interactiveButtonsHeader?.text)
            },
            body: { text: safe(d.text) },
            footer: d.interactiveButtonsFooter
              ? { text: d.interactiveButtonsFooter }
              : undefined,
            action: { buttons }
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // MEDIA-BUTTON
    // ============================================================
    if (backendType === "mediabutton") {
      const sourceButtons =
        Array.isArray(d.buttons) && d.buttons.length > 0
          ? d.buttons
          : d.interactiveButtonsItems || [];

      const header = buildInteractiveHeader(d);

      const buttons = sourceButtons.map(btn => {
        const targetNodeId = getButtonTarget(btn.id);
        return {
          type: "reply",
          reply: {
            id: targetNodeId || btn.id,
            title: safe(btn.text)
          }
        };
      });

      return {
        id: node.id,
        flowNodeType: "mediabutton",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "button",
            header,
            body: { text: safe(d.caption) },
            footer: d.interactiveButtonsFooter
              ? { text: d.interactiveButtonsFooter }
              : undefined,
            action: { buttons }
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // LIST NODE
    // ============================================================
    if (backendType === "list") {
      return {
        id: node.id,
        flowNodeType: "list",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "list",
            header: { text: safe(d.listHeader) },
            body: { text: safe(d.listBody) },
            footer: d.listFooter ? { text: d.listFooter } : undefined,
            action: {
              button: safe(d.listButton).slice(0, 20),
              sections: d.listSections || []
            }
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // ASK QUESTION / ADDRESS / LOCATION
    // ============================================================
    if (backendType === "askquestion") {
      return {
        id: node.id,
        flowNodeType: "askquestion",
        mimeType: "",
        config: {
          questionText: safe(d.questionText),
          customField: safe(d.customField),
          validationType: safe(d.validationType, "none"),
          isMediaAccepted: !!d.isMediaAccepted,
          expectedAnswers: d.expectedAnswers || []
        },
        flowNodePosition
      };
    }

    if (backendType === "askaddress") {
      return {
        id: node.id,
        flowNodeType: "askaddress",
        mimeType: "",
        config: {
          questionText: safe(d.questionText),
          customField: safe(d.customField)
        },
        flowNodePosition
      };
    }

    if (backendType === "asklocation") {
      return {
        id: node.id,
        flowNodeType: "asklocation",
        mimeType: "",
        config: {
          questionText: safe(d.questionText),
          longitudeField: safe(d.longitudeField),
          latitudeField: safe(d.latitudeField)
        },
        flowNodePosition
      };
    }


    // ============================================================
    // PRODUCT NODES
    // ============================================================
    if (backendType === "singleproduct") {
      return {
        id: node.id,
        flowNodeType: "singleproduct",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "product",
            body: { text: safe(d.body) },
            footer: d.footer ? { text: d.footer } : undefined,
            action: {
              catalog_id: safe(d.product?.catalog_id),
              product_retailer_id: safe(d.product?.product_retailer_id)
            }
          }
        },
        flowNodePosition
      };
    }

    if (backendType === "multiproduct") {
      return {
        id: node.id,
        flowNodeType: "multiproduct",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "product_list",
            header: { text: safe(d.header) },
            body: { text: safe(d.body) },
            footer: d.footer ? { text: d.footer } : undefined,
            action: {
              catalog_id: safe(d.catalogId),
              sections: d.products || []
            }
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // CATALOG
    // ============================================================
    if (backendType === "catalog") {
      return {
        id: node.id,
        flowNodeType: "catalog",
        mimeType: "",
        flowReplies: {
          type: "interactive",
          interactive: {
            type: "catalog_message",
            body: { text: safe(d.body) },
            footer: d.footer ? { text: d.footer } : undefined,
            action: {
              catalog_id: safe(d.catalogId)
            }
          }
        },
        flowNodePosition
      };
    }


    // ============================================================
    // SUMMARY / VARIABLES / CUSTOM FIELD
    // ============================================================
    if (backendType === "summary") {
      return {
        id: node.id,
        flowNodeType: "summary",
        mimeType: "",
        config: {
          messageText: safe(d.messageText),
          title: safe(d.title, "Summary"),
          includeTimestamp: !!d.includeTimestamp
        },
        flowNodePosition
      };
    }

    if (backendType === "setvariable") {
      return {
        id: node.id,
        flowNodeType: "setvariable",
        mimeType: "",
        config: {
          variableName: safe(d.variableName),
          value: safe(d.value)
        },
        flowNodePosition
      };
    }

    if (backendType === "setcustomfield") {
      return {
        id: node.id,
        flowNodeType: "setcustomfield",
        mimeType: "",
        config: {
          customField: safe(d.customField),
          value: safe(d.value)
        },
        flowNodePosition
      };
    }

    if (backendType === "template") {
      return {
        id: node.id,
        flowNodeType: "template",
        mimeType: "",
        config: {
          templateId: safe(d.templateId),
          templateName: safe(d.templateName),
          selectedTemplate: d.selectedTemplate || null
        },
        flowNodePosition
      };
    }

    return {
      id: node.id,
      flowNodeType: backendType,
      mimeType: "",
      config: { ...d },
      flowNodePosition
    };
  });
}



// ============================================================================
// SECTION 4 — BACKEND → FRONTEND NODE TRANSFORM
// ============================================================================

export function transformNodesFromBackendFormat(rawNodes, updateNodeDataCallback) {
  return rawNodes.map(node => {
    const {
      id,
      flowNodeType,
      flowNodePosition,
      flowReplies,
      config,
      mimeType,
      ...rest
    } = node;

    const frontendType =
      BACKEND_TO_FRONTEND_NODE_TYPES[flowNodeType?.toLowerCase()] ||
      flowNodeType?.toLowerCase();

    const data = { ...rest };


    // TEXT
    if (flowReplies?.type === "text") {
      data.text = flowReplies.text?.body || "";
    }

    // MEDIA
    if (["image", "video", "document"].includes(flowReplies?.type)) {
      const type = flowReplies.type;
      const m = flowReplies[type];
      data.mediaType = type;
      data.mediaUrl = m?.id || "";
      data.caption = m?.caption || "";
      if (type === "document") data.filename = m?.filename || "document.pdf";
    }

    // INTERACTIVE
    if (flowReplies?.type === "interactive") {
      const inter = flowReplies.interactive;
      const interType = inter.type;

      data.text = inter.body?.text || "";
      data.interactiveButtonsFooter = inter.footer?.text || "";

      // HEADER
      if (inter.header) {
        const h = inter.header;
        if (h.type === "text") {
          data.interactiveButtonsHeader = {
            type: "text",
            text: h.text || ""
          };
        } else {
          const mediaType = h.type;
          const m = h[mediaType];
          data.mediaType = mediaType;
          data.mediaUrl = m?.id || "";
          data.caption = m?.caption || "";
          if (mediaType === "document") {
            data.filename = m?.filename || "";
          }
        }
      }

      // BUTTONS - Use simple sequential IDs (0, 1, 2)
      if (inter.action?.buttons) {
        const btns = inter.action.buttons.map((btn, idx) => {
          const targetNodeId = btn.reply?.id || "";
          
          return {
            id: String(idx), // Simple sequential ID
            text: btn.reply?.title || "",
            title: btn.reply?.title || "",
            buttonText: btn.reply?.title || "",
            nodeResultId: targetNodeId
          };
        });

        data.buttons = btns;
        data.interactiveButtonsItems = btns;
      }

      // LIST
      if (interType === "list") {
        data.listHeader = inter.header?.text || "";
        data.listBody = inter.body?.text || "";
        data.listFooter = inter.footer?.text || "";
        data.listButton = inter.action?.button || "Options";
        data.listSections = inter.action?.sections || [];
      }

      // PRODUCT
      if (interType === "product") {
        data.body = inter.body?.text || "";
        data.footer = inter.footer?.text || "";
        data.product = {
          catalog_id: inter.action?.catalog_id || "",
          product_retailer_id: inter.action?.product_retailer_id || ""
        };
      }

      // PRODUCT LIST
      if (interType === "product_list") {
        data.header = inter.header?.text || "";
        data.body = inter.body?.text || "";
        data.footer = inter.footer?.text || "";
        data.catalogId = inter.action?.catalog_id || "";
        data.products = inter.action?.sections || [];
      }

      // CATALOG MESSAGE
      if (interType === "catalog_message") {
        data.body = inter.body?.text || "";
        data.footer = inter.footer?.text || "";
        data.catalogId = inter.action?.catalog_id || "";
      }
    }

    // CONFIG NODES
    if (config) {
      if (config.triggerConfig) {
        data.keywords = config.triggerConfig.keywords || [];
        data.regex = config.triggerConfig.regex || "";
        data.caseSensitive = !!config.triggerConfig.caseSensitive;
      }

      if (config.questionText !== undefined)
        data.questionText = config.questionText;
      if (config.customField !== undefined)
        data.customField = config.customField;
      if (config.validationType !== undefined)
        data.validationType = config.validationType;
      if (config.isMediaAccepted !== undefined)
        data.isMediaAccepted = config.isMediaAccepted;
      if (config.expectedAnswers !== undefined)
        data.expectedAnswers = config.expectedAnswers;

      if (config.longitudeField !== undefined)
        data.longitudeField = config.longitudeField;
      if (config.latitudeField !== undefined)
        data.latitudeField = config.latitudeField;

      if (config.messageText !== undefined)
        data.messageText = config.messageText;
      if (config.title !== undefined)
        data.title = config.title;
      if (config.includeTimestamp !== undefined)
        data.includeTimestamp = config.includeTimestamp;

      if (config.variableName !== undefined)
        data.variableName = config.variableName;
      if (config.value !== undefined)
        data.value = config.value;

      if (config.templateId !== undefined)
        data.templateId = config.templateId;
      if (config.templateName !== undefined)
        data.templateName = config.templateName;
      if (config.selectedTemplate !== undefined)
        data.selectedTemplate = config.selectedTemplate;
    }

    return {
      id,
      type: frontendType,
      position: positionFromBackend(flowNodePosition),
      data: {
        ...data,
        updateNodeData: updateNodeDataCallback
      }
    };
  });
}



// ============================================================================
// SECTION 5 — EDGE TRANSFORMS
// ============================================================================

export function transformEdgesToBackendFormat(edges) {
  // Include ALL edges (both regular and button edges)
  return edges.map(e => ({
    id: e.id,
    sourceNodeId: e.source,
    targetNodeId: e.target,
    sourceHandle: e.sourceHandle || "right-handle",
    targetHandle: e.targetHandle || "left-handle"
  }));
}

export function transformEdgesFromBackendFormat(rawEdges) {
  return rawEdges.map(e => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    sourceHandle: e.sourceHandle || "right-handle",
    targetHandle: e.targetHandle || "left-handle",
    type: "default",
    animated: true
  }));
}

export function rebuildButtonEdges(nodes) {
  const result = [];

  nodes.forEach(node => {
    const btns =
      node.data?.interactiveButtonsItems ||
      node.data?.buttons ||
      [];

    btns.forEach((btn, idx) => {
      if (!btn.nodeResultId) return;

      // Use simple sequential button ID
      const buttonId = String(idx);

      result.push({
        id: `${node.id}-btn-${buttonId}-${btn.nodeResultId}`,
        source: node.id,
        target: btn.nodeResultId,
        sourceHandle: `btn-${buttonId}`,
        targetHandle: "left-handle",
        type: "default",
        animated: true
      });
    });
  });

  return result;
}

export function mergeEdges(rawEdges, buttonEdges) {
  const map = new Map();
  const key = (e) => `${e.source}->${e.target}`;

  rawEdges.forEach(e => map.set(key(e), e));
  buttonEdges.forEach(e => {
    if (!map.has(key(e))) map.set(key(e), e);
  });

  return Array.from(map.values());
}



// ============================================================================
// SECTION 6 — MASTER SAVE / LOAD FUNCTIONS
// ============================================================================

export function buildBackendFlowPayload(nodes, edges) {
  return {
    flowNodes: transformNodesToBackendFormat(nodes, edges),
    flowEdges: transformEdgesToBackendFormat(edges)
  };
}

export function buildFrontendFlow(rawFlowJson, updateNodeDataCallback) {
  const rawNodes = rawFlowJson.flowNodes || [];
  const rawEdges = rawFlowJson.flowEdges || [];

  // Transform nodes - buttons will get simple sequential IDs (0, 1, 2)
  const nodes = transformNodesFromBackendFormat(rawNodes, updateNodeDataCallback);
  
  // Transform edges from backend - edges already have sourceHandle saved
  const edges = transformEdgesFromBackendFormat(rawEdges);

  return { nodes, edges };
}
