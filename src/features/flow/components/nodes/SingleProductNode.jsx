import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const SingleProductNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    body: data?.body || "",
    footer: data?.footer || "",
    product: data?.product || {
      name: "",
      description: "",
      price: "",
      image: ""
    }
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        body: data.body || "",
        footer: data.footer || "",
        product: data.product || {
          name: "",
          description: "",
          price: "",
          image: ""
        }
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        [field]: value
      }
    }));
  };

  const getPreviewData = () => {
    return {
      body: formData.body,
      footer: formData.footer,
      product: formData.product
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Single Product"
        icon="🛍️"
        subtitle="Showcase a product with details"
        onPreview={() => onPreviewRequest?.(id, 'single-product')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Product Details Section */}
        <FormSection title="Product Details" icon="📦" defaultOpen={true}>
          <FormInput
            label="Product Name"
            value={formData.product.name}
            onChange={(e) => handleProductChange('name', e.target.value)}
            placeholder="e.g., Premium Wireless Headphones"
            required
            helpText="The name of your product as it will appear to customers"
          />
          
          <FormTextarea
            label="Description"
            value={formData.product.description}
            onChange={(e) => handleProductChange('description', e.target.value)}
            placeholder="Describe your product features and benefits..."
            rows={3}
            helpText="Detailed description of the product"
          />
          
          <FormInput
            label="Price"
            value={formData.product.price}
            onChange={(e) => handleProductChange('price', e.target.value)}
            placeholder="e.g., $99.99 or ₹4,999"
            required
            helpText="Product price with currency symbol"
          />
          
          <FormInput
            label="Image URL"
            value={formData.product.image}
            onChange={(e) => handleProductChange('image', e.target.value)}
            placeholder="https://example.com/product-image.jpg"
            type="url"
            helpText="Direct link to product image (HTTPS required)"
          />
        </FormSection>

        {/* Message Content Section */}
        <FormSection title="Message Content" icon="💬" defaultOpen={true}>
          <FormTextarea
            label="Body Text"
            value={formData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Add additional message text here..."
            maxLength={CHAR_LIMITS.BODY}
            rows={3}
            helpText="Optional message text to accompany the product"
            showCounter={true}
          />

          <FormTextarea
            label="Footer Text"
            value={formData.footer}
            onChange={(e) => handleInputChange('footer', e.target.value)}
            placeholder="e.g., Limited time offer!"
            maxLength={CHAR_LIMITS.FOOTER}
            rows={2}
            helpText="Small text at the bottom of the message"
            showCounter={true}
          />
        </FormSection>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
        className="hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-handle"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default SingleProductNode;
