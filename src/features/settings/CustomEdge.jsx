import React from "react";
import {
  getBezierPath,
  getMarkerEnd,
  useReactFlow
} from "reactflow";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd, 
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { setEdges } = useReactFlow();

  // ✅ Convert object to string url and register marker
  const markerEndUrl = getMarkerEnd(markerEnd, id);

  const onRemove = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <path
        id={id}
        d={edgePath}
        style={{
          stroke: "#60a5fa",
          strokeWidth: 2,
          strokeDasharray: "6,4",
          ...style,
        }}
        className="react-flow__edge-path"
        markerEnd={markerEndUrl} 
      />
      <foreignObject
        width={30}
        height={30}
        x={labelX - 15}
        y={labelY - 15}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          onClick={onRemove}
          aria-label="Remove edge"
          className="bg-white border border-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100 transition cursor-pointer"
        >
          −
        </button>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
