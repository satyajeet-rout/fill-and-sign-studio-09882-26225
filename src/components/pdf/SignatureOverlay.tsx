import { useState, useRef, useEffect } from "react";
import { Trash2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Signature } from "../PDFEditor";

interface SignatureOverlayProps {
  signature: Signature;
  zoom: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

export const SignatureOverlay = ({
  signature,
  zoom,
  onMove,
  onResize,
  onDelete,
}: SignatureOverlayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartState = useRef({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0,
    mouseX: 0,
    mouseY: 0
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - signature.x * zoom,
      y: e.clientY - signature.y * zoom,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    
    if (isDragging) {
      const newX = (e.clientX - dragStartPos.current.x) / zoom;
      const newY = (e.clientY - dragStartPos.current.y) / zoom;
      onMove(signature.id, Math.max(0, newX), Math.max(0, newY));
    } else if (resizeDirection) {
      const deltaX = (e.clientX - resizeStartState.current.mouseX) / zoom;
      const deltaY = (e.clientY - resizeStartState.current.mouseY) / zoom;
      
      let newX = resizeStartState.current.x;
      let newY = resizeStartState.current.y;
      let newWidth = resizeStartState.current.width;
      let newHeight = resizeStartState.current.height;

      // Handle horizontal resizing
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(50, resizeStartState.current.width - deltaX);
        newX = resizeStartState.current.x + (resizeStartState.current.width - newWidth);
      } else if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, resizeStartState.current.width + deltaX);
      }

      // Handle vertical resizing
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(25, resizeStartState.current.height - deltaY);
        newY = resizeStartState.current.y + (resizeStartState.current.height - newHeight);
      } else if (resizeDirection.includes('s')) {
        newHeight = Math.max(25, resizeStartState.current.height + deltaY);
      }

      onMove(signature.id, Math.max(0, newX), Math.max(0, newY));
      onResize(signature.id, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeDirection(null);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeDirection(direction);
    resizeStartState.current = {
      x: signature.x,
      y: signature.y,
      width: signature.width,
      height: signature.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  // Add global mouse event listeners with proper cleanup
  useEffect(() => {
    if (isDragging || resizeDirection) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, resizeDirection, signature.x, signature.y, signature.width, signature.height, zoom]);

  return (
    <div
      className={`
        absolute group cursor-move transition-all z-50
        ${isDragging || resizeDirection ? "opacity-80 scale-105" : "opacity-100"}
        ${isHovered ? "ring-2 ring-primary shadow-lg" : ""}
      `}
      style={{
        left: signature.x * zoom,
        top: signature.y * zoom,
        width: signature.width * zoom,
        height: signature.height * zoom,
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={signature.image}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />

      {/* Controls */}
      <div className={`
        absolute -top-10 left-0 flex gap-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10
        transition-opacity pointer-events-auto ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Drag to move"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Move className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(signature.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Resize Handles - All 8 directions */}
      {isHovered && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-nesw-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nesw-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          
          {/* Side handles */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full cursor-ns-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-ew-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full cursor-ns-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-ew-resize border-2 border-background z-10 pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
        </>
      )}
    </div>
  );
};
