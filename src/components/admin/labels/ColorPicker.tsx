import React from 'react';
import { Check } from 'lucide-react';

// Standard colors based on mockData.ts
const STANDARD_COLORS = [
  '#f97316', // orange
  '#10b981', // green  
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // yellow
  '#06b6d4', // cyan
  '#ef4444', // red
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Cor da Label</label>
      <div className="flex gap-2">
        {STANDARD_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="w-8 h-8 rounded-full border-2 border-muted hover:scale-110 transition-transform relative focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          >
            {selectedColor === color && (
              <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};