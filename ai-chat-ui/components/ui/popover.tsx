import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within Popover');

  const { setOpen } = context;

  const handleClick = () => {
    setOpen(!context.open);
  };

  if (asChild) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return <div onClick={handleClick}>{children}</div>;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function PopoverContent({ children, className = '', align = 'center' }: PopoverContentProps) {
  const context = useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!context) throw new Error('PopoverContent must be used within Popover');

  const { open, setOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
}