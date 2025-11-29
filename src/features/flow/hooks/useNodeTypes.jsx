import { useMemo } from "react";

import FlowStartNode from "../FlowStartNode";
import TemplateNode from "../TemplateNode";
import TextNode from "../components/nodes/TextNode";
import MediaNode from "../components/nodes/MediaNode";
import TextButtonNode from "../components/nodes/TextButtonNode";
import MediaButtonNode from "../components/nodes/MediaButtonNode";
import ListNode from "../components/nodes/ListNode";
import TemplateboxNode from "../components/nodes/TemplateboxNode";
import SingleProductNode from "../components/nodes/SingleProductNode";
import MultiProductNode from "../components/nodes/MultiProductNode";
import CatalogNode from "../components/nodes/CatalogNode";
import QuestionNode from "../components/nodes/QuestionNode";
import AddressNode from "../components/nodes/AddressNode";
import LocationNode from "../components/nodes/LocationNode";
import ContactCustomFieldNode from "../components/nodes/ContactCustomFieldNode";
import SummaryNode from "../components/nodes/SummaryNode";
import SetVariableNode from "../components/nodes/SetVariableNode";
import AddTagNode from "../components/nodes/AddTagNode";

export const useNodeTypes = (
  handlePreviewRequest,
  handleNodeDelete,
  handleNodeDuplicate
) => {

  const wrap = (Component) => (props) => (
    <Component
      {...props}
      onPreviewRequest={handlePreviewRequest}
      onDelete={handleNodeDelete}
      onDuplicate={handleNodeDuplicate}
    />
  );


  const nodeTypes = useMemo(
    () => ({
      flowStartNode: FlowStartNode,

      text: wrap(TextNode),
      media: wrap(MediaNode),
      "text-button": wrap(TextButtonNode),
      "media-button": wrap(MediaButtonNode),
      list: wrap(ListNode),

      template: wrap(TemplateboxNode),

      "single-product": wrap(SingleProductNode),
      "multi-product": wrap(MultiProductNode),
      catalog: wrap(CatalogNode),

      "ask-question": wrap(QuestionNode),
      "ask-address": wrap(AddressNode),
      "ask-location": wrap(LocationNode),

      "set-custom-field": wrap(ContactCustomFieldNode),
      "set-variable": wrap(SetVariableNode),

      summary: wrap(SummaryNode),

      "add-tag": wrap(AddTagNode),
    }),
    [handlePreviewRequest, handleNodeDelete, handleNodeDuplicate]
  );

  return nodeTypes;
};
