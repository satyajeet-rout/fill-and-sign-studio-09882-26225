import { useState, useRef, useEffect } from "react";
import { Trash2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextAnnotation } from "../PDFEditor";

interface TextOverlayProps {
  text: TextAnnotation;
  zoom: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

export const TextOverlay = ({
  text,
  zoom,
  onMove,
  onResize,
  onUpdate,
  onDelete,
}: TextOverlayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - text.x * zoom,
      y: e.clientY - text.y * zoom,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    
    if (isDragging) {
      const newX = (e.clientX - dragStartPos.current.x) / zoom;
      const newY = (e.clientY - dragStartPos.current.y) / zoom;
      onMove(text.id, Math.max(0, newX), Math.max(0, newY));
    } else if (resizeDirection) {
      const deltaX = (e.clientX - resizeStartState.current.mouseX) / zoom;
      const deltaY = (e.clientY - resizeStartState.current.mouseY) / zoom;
      
      let newX = resizeStartState.current.x;
      let newY = resizeStartState.current.y;
      let newWidth = resizeStartState.current.width;
      let newHeight = resizeStartState.current.height;

      if (resizeDirection.includes('w')) {
        newWidth = Math.max(100, resizeStartState.current.width - deltaX);
        newX = resizeStartState.current.x + (resizeStartState.current.width - newWidth);
      } else if (resizeDirection.includes('e')) {
        newWidth = Math.max(100, resizeStartState.current.width + deltaX);
      }

      if (resizeDirection.includes('n')) {
        newHeight = Math.max(30, resizeStartState.current.height - deltaY);
        newY = resizeStartState.current.y + (resizeStartState.current.height - newHeight);
      } else if (resizeDirection.includes('s')) {
        newHeight = Math.max(30, resizeStartState.current.height + deltaY);
      }

      onMove(text.id, Math.max(0, newX), Math.max(0, newY));
      onResize(text.id, newWidth, newHeight);
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
      x: text.x,
      y: text.y,
      width: text.width,
      height: text.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  useEffect(() => {
    if (isDragging || resizeDirection) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, resizeDirection, text.x, text.y, text.width, text.height, zoom]);

  return (
    <div
      className={`
        absolute group transition-all z-50
        ${isDragging || resizeDirection ? "opacity-80 scale-105" : "opacity-100"}
        ${isHovered ? "ring-2 ring-primary shadow-lg" : ""}
        ${!isEditing ? "cursor-move" : ""}
      `}
      style={{
        left: text.x * zoom,
        top: text.y * zoom,
        width: text.width * zoom,
        height: text.height * zoom,
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <textarea
          value={text.text}
          onChange={(e) => onUpdate(text.id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="w-full h-full px-2 py-1 border-2 border-primary rounded bg-white text-foreground resize-none outline-none"
          style={{ 
            fontSize: text.fontSize * zoom,
            fontFamily: '"Courier New", monospace',
            pointerEvents: 'auto'
          }}
        />
      ) : (
        <div 
          className="w-full h-full px-2 py-1 flex items-center pointer-events-none select-none overflow-hidden"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <div 
            className="w-full break-words"
            style={{ fontSize: text.fontSize * zoom, fontFamily: '"Courier New", monospace' }}
          >
            {text.text || "Double-click to edit"}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`
        absolute -top-10 left-0 flex gap-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10
        transition-opacity pointer-events-auto ${isHovered && !isEditing ? "opacity-100" : "opacity-0 pointer-events-none"}
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
            onDelete(text.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Resize Handles */}
      {isHovered && !isEditing && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-nesw-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nesw-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          
          {/* Side handles */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full cursor-ns-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-ew-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full cursor-ns-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-ew-resize border-2 border-background z-10 pointer-events-auto resize-handle"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
        </>
      )}
    </div>
  );
};
