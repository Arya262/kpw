import React from "react";
import { X } from "lucide-react";
import { whatsAppMarkdownToHtml } from "../features/flow/utils/whatsappFormatting";

const ChatHeader = ({ onClose }) => (
  <div className="bg-teal-500 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
        <span className="text-gray-700 text-sm font-bold">👤</span>
      </div>
      <div className="text-white font-medium">919810765443</div>
    </div>
    <button onClick={onClose} className="text-white text-xl font-bold">
      ×
    </button>
  </div>
);

const ChatWrapper = ({ children }) => (
  <div
    className="flex-1 bg-gray-100 p-4 relative overflow-y-auto"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e5e5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
    }}
  >
    {children}
  </div>
);

// Left-side bubble container
const IncomingBubble = ({ children }) => (
  <div className="flex justify-start mb-4">
    <div className="relative max-w-xs">
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        {children}
      </div>
      <div className="absolute -bottom-1 left-0 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-white"></div>
    </div>
  </div>
);

// Right-side bubble
const OutgoingBubble = ({ children }) => (
  <div className="flex justify-end mb-4">
    <div className="max-w-xs relative">
      <div className="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm text-white text-sm">
        {children}
      </div>
      <div className="absolute -bottom-1 right-0 w-0 h-0 border-r-8 border-r-transparent border-t-8 border-t-blue-500"></div>
    </div>
  </div>
);

const SectionContainer = ({ children }) => (
  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
    {children}
  </div>
);

// Component to render WhatsApp formatted text
const WhatsAppText = ({ children, className = "" }) => {
  if (!children) return null;
  
  const htmlContent = whatsAppMarkdownToHtml(children);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

/* -------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------- */

const WhatsAppPreviewPanel = ({ nodeData, nodeType, isVisible, onClose }) => {
  if (!isVisible) return null;

  const renderButtons = () => {
    if (!nodeData?.interactiveButtonsItems?.length) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-xs space-y-2">
          {nodeData.interactiveButtonsItems.map((btn, index) => (
            <div
              key={btn.id || index}
              className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200"
            >
              <div className="text-blue-600 text-sm font-medium text-center">
                {btn.text || btn.buttonText || `Button ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------
     NODE TYPE RENDERERS
  ------------------------------------------------------------------- */

const renderTextButton = () => (
  <IncomingBubble>
    {/* Message Text with WhatsApp formatting */}
    <WhatsAppText className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
      {nodeData?.interactiveButtonsBody ||
        nodeData?.text ||
        "Enter your message here..."}
    </WhatsAppText>

    {/* Footer (optional) */}
    {nodeData?.footer && (
      <WhatsAppText className="text-[11px] text-gray-500 mt-2">
        {nodeData.footer}
      </WhatsAppText>
    )}

    {/* Buttons - NOW INSIDE SAME BUBBLE */}
    {nodeData?.interactiveButtonsItems?.length > 0 && (
      <div className="mt-3 space-y-2">
        {nodeData.interactiveButtonsItems.map((btn, index) => (
          <div
            key={btn.id || index}
            className="border rounded-xl px-4 py-2 shadow-sm text-center bg-gray-50"
          >
            <span className="text-blue-600 text-sm font-medium">
              {btn.text || btn.buttonText || `Button ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    )}
  </IncomingBubble>
);


const renderMediaButton = () => (
  <IncomingBubble>
    
    {/* MEDIA */}
    {nodeData?.mediaUrl && (
      <>
        {nodeData.mediaType === "image" ? (
          <img
            src={nodeData.mediaUrl}
            alt="Media"
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
        ) : nodeData.mediaType === "video" ? (
          <video
            src={nodeData.mediaUrl}
            controls
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
            <span className="text-gray-500">Document Preview</span>
          </div>
        )}
      </>
    )}

    {/* CAPTION with WhatsApp formatting */}
    {nodeData?.caption && (
      <WhatsAppText className="text-gray-800 text-sm whitespace-pre-wrap mb-3">
        {nodeData.caption}
      </WhatsAppText>
    )}

    {/* BUTTONS */}
    {nodeData?.interactiveButtonsItems?.length > 0 && (
      <div className="space-y-2">
        {nodeData.interactiveButtonsItems.map((btn, index) => (
          <div
            key={btn.id || index}
            className="bg-gray-50 border rounded-xl px-4 py-2 shadow-sm text-center"
          >
            <span className="text-blue-600 text-sm font-medium">
              {btn.text || btn.buttonText || `Button ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    )}

  </IncomingBubble>
);


  const renderAskQuestion = () => (
    <>
      <IncomingBubble>
        <WhatsAppText className="text-gray-800 text-sm whitespace-pre-wrap">
          {nodeData?.questionText || "Enter your question here..."}
        </WhatsAppText>
      </IncomingBubble>

      <OutgoingBubble>User will type their response here...</OutgoingBubble>

      <div className="flex justify-start mb-4">
        <div className="bg-gray-200 rounded-2xl px-3 py-2 text-xs text-gray-600">
          {nodeData?.isMediaAccepted ? "Media accepted" : "Text only"} • Validation:{" "}
          {nodeData?.validationType || "None"}
        </div>
      </div>
    </>
  );

  const renderAddress = () => (
    <>
      <IncomingBubble>
        <WhatsAppText className="text-gray-800 text-sm whitespace-pre-wrap">
          {nodeData?.questionText || "Please provide your address..."}
        </WhatsAppText>
      </IncomingBubble>

      <OutgoingBubble>User will type their address here...</OutgoingBubble>
    </>
  );

  const renderList = () => {
    const header = nodeData?.listHeader || nodeData?.header;
    const body = nodeData?.listBody || nodeData?.body;
    const footer = nodeData?.listFooter || nodeData?.footer;
    const sections = nodeData?.listSections || nodeData?.sections || [];

    console.log('📋 List Preview Data:', { 
      nodeData, 
      header, 
      body, 
      footer, 
      sections,
      sectionsLength: sections.length 
    });

    return (
      <IncomingBubble>
        {header && (
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            {header}
          </h3>
        )}

        {body && (
          <WhatsAppText className="text-sm text-gray-800 mb-3">
            {body}
          </WhatsAppText>
        )}

        {sections.map((section, sIdx) => (
          <div key={section.id || sIdx} className="mb-3">
            {section.title && (
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                {section.title}
              </h4>
            )}

            {section.items?.map((item, iIdx) => (
              <div
                key={item.id || iIdx}
                className="mb-2 p-2 bg-gray-50 rounded border-l-2 border-blue-500"
              >
                <div className="font-medium text-sm">{item.title}</div>
                {item.description && (
                  <WhatsAppText className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </WhatsAppText>
                )}
              </div>
            ))}
          </div>
        ))}

        {footer && (
          <WhatsAppText className="text-xs text-gray-500 mt-2">
            {footer}
          </WhatsAppText>
        )}
      </IncomingBubble>
    );
  };

  const renderSummary = () => (
    <IncomingBubble>
      <div className="text-gray-800 text-sm">
        <div className="font-semibold mb-2">{nodeData?.title || "Summary"}</div>

        <WhatsAppText className="whitespace-pre-wrap">
          {nodeData?.messageText || "Summary details..."}
        </WhatsAppText>

        {nodeData?.showVariables?.length > 0 && (
          <div className="mt-3 space-y-1">
            {nodeData.showVariables.map((v, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                • <strong>{v}:</strong> {`{{user.${v}}}`}
              </div>
            ))}
          </div>
        )}

        {nodeData?.customMessage && (
          <WhatsAppText className="mt-3 text-xs text-gray-600">
            {nodeData.customMessage}
          </WhatsAppText>
        )}

        {nodeData?.includeTimestamp && (
          <div className="mt-3 text-xs text-gray-500">
            Generated on: {{ system: "datetime" }}
          </div>
        )}
      </div>
    </IncomingBubble>
  );

  const renderSingleProduct = () => (
    <IncomingBubble>
      {nodeData?.body && (
        <WhatsAppText className="text-sm text-gray-800 mb-3">
          {nodeData.body}
        </WhatsAppText>
      )}

      {nodeData?.product && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          {nodeData.product.image && (
            <img
              src={nodeData.product.image}
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}

          <h4 className="font-semibold text-sm text-gray-800 mb-1">
            {nodeData.product.name || "Product Name"}
          </h4>
          <WhatsAppText className="text-xs text-gray-600 mb-2">
            {nodeData.product.description || "Product Description"}
          </WhatsAppText>
          <p className="font-bold text-sm text-green-600">
            {nodeData.product.price || "Price"}
          </p>
        </div>
      )}

      {nodeData?.footer && (
        <WhatsAppText className="text-xs text-gray-500 mt-2">
          {nodeData.footer}
        </WhatsAppText>
      )}
    </IncomingBubble>
  );

  const renderCatalog = () => (
    <IncomingBubble>
      {nodeData?.body && (
        <WhatsAppText className="text-sm text-gray-800 mb-3">
          {nodeData.body}
        </WhatsAppText>
      )}
      {nodeData?.footer && (
        <WhatsAppText className="text-xs text-gray-500 mt-2">
          {nodeData.footer}
        </WhatsAppText>
      )}
    </IncomingBubble>
  );

  const renderSetVariable = () => (
    <>
      <IncomingBubble>
        <WhatsAppText className="text-gray-800 text-sm whitespace-pre-wrap">
          {nodeData?.messageText || "Please provide your information..."}
        </WhatsAppText>
      </IncomingBubble>

      {nodeData?.isUserInput && (
        <OutgoingBubble>
          {nodeData?.placeholder || "User will type their response here..."}
        </OutgoingBubble>
      )}

      <div className="flex justify-start mb-4">
        <div className="bg-gray-200 rounded-2xl px-3 py-2 text-xs text-gray-600">
          Variable:{" "}
          <code className="text-blue-600">
            {{ user: nodeData?.variableName || "variable_name" }}
          </code>
          {nodeData?.validationType !== "None" && (
            <span> • Validation: {nodeData.validationType}</span>
          )}
        </div>
      </div>
    </>
  );

  const renderSetCustomField = () => (
    <IncomingBubble>
      <div className="text-gray-800 text-sm">
        Setting custom field:{" "}
        <strong>{nodeData?.customField || "field_name"}</strong> ={" "}
        <strong>{nodeData?.value || "value"}</strong>
      </div>
    </IncomingBubble>
  );

  const NODE_MAP = {
    "text-button": renderTextButton,
    "media-button": renderMediaButton,
    "ask-question": renderAskQuestion,
    "ask-address": renderAddress,
    list: renderList,
    "single-product": renderSingleProduct,
    summary: renderSummary,
    catalog: renderCatalog,
    "set-variable": renderSetVariable,
    "set-custom-field": renderSetCustomField,
  };

  const renderNode = NODE_MAP[nodeType] || (() => (
    <IncomingBubble>
      <pre className="text-xs">{JSON.stringify(nodeData, null, 2)}</pre>
    </IncomingBubble>
  ));

  return (
    <div className="h-full w-full bg-gray-100 flex flex-col">
      <ChatHeader onClose={onClose} />
      <ChatWrapper>{renderNode()}</ChatWrapper>
    </div>
  );
};

export default WhatsAppPreviewPanel;
