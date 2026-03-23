'use client';

import { useState } from 'react';
import { FloorPlanGenerateRequest } from '@/types/floor-plan';

interface FloorPlanInputFormProps {
  projectId: string;
  onGenerate: (data: FloorPlanGenerateRequest) => void;
  isGenerating?: boolean;
}

export default function FloorPlanInputForm({
  projectId,
  onGenerate,
  isGenerating = false,
}: FloorPlanInputFormProps) {
  const [formData, setFormData] = useState<FloorPlanGenerateRequest>({
    projectId,
    plotDimensions: {
      length: 40,
      width: 30,
      unit: 'feet',
    },
    rooms: {
      bedrooms: 2,
      bathrooms: 2,
      kitchen: true,
      livingRoom: true,
      diningRoom: true,
      balconies: 1,
      parking: true,
      studyRoom: false,
      prayerRoom: false,
      storeRoom: false,
    },
    preferences: {
      vastuCompliant: false,
      style: 'modern',
      floors: 1,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const updatePlotDimensions = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      plotDimensions: {
        ...prev.plotDimensions,
        [field]: value,
      },
    }));
  };

  const updateRooms = (field: string, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [field]: value,
      },
    }));
  };

  const updatePreferences = (field: string, value: boolean | string | number) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Plot Dimensions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          📏 Plot Dimensions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={formData.plotDimensions.length}
              onChange={(e) => updatePlotDimensions('length', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={formData.plotDimensions.width}
              onChange={(e) => updatePlotDimensions('width', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.plotDimensions.unit}
              onChange={(e) => updatePlotDimensions('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="feet">Feet</option>
              <option value="meters">Meters</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          Total Area: <strong>{(formData.plotDimensions.length * formData.plotDimensions.width).toFixed(0)} {formData.plotDimensions.unit === 'feet' ? 'sq ft' : 'sq m'}</strong>
        </div>
      </div>

      {/* Room Requirements Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          🏠 Room Requirements
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.rooms.bedrooms}
              onChange={(e) => updateRooms('bedrooms', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.rooms.bathrooms}
              onChange={(e) => updateRooms('bathrooms', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balconies
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={formData.rooms.balconies || 0}
              onChange={(e) => updateRooms('balconies', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floors
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.preferences?.floors || 1}
              onChange={(e) => updatePreferences('floors', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Checkboxes for common rooms */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'kitchen', label: '🍳 Kitchen' },
            { key: 'livingRoom', label: '🛋️ Living Room' },
            { key: 'diningRoom', label: '🍽️ Dining Room' },
            { key: 'parking', label: '🚗 Parking' },
            { key: 'studyRoom', label: '📚 Study Room' },
            { key: 'prayerRoom', label: '🙏 Prayer Room' },
            { key: 'storeRoom', label: '📦 Store Room' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rooms[key as keyof typeof formData.rooms] as boolean}
                onChange={(e) => updateRooms(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          ⚙️ Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <select
              value={formData.preferences?.style || 'modern'}
              onChange={(e) => updatePreferences('style', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="modern">Modern</option>
              <option value="traditional">Traditional</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences?.vastuCompliant || false}
                onChange={(e) => updatePreferences('vastuCompliant', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">🕉️ Vastu Compliant</span>
            </label>
          </div>
        </div>

        {formData.preferences?.vastuCompliant && (
          <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-md border border-orange-200">
            <strong>Vastu Note:</strong> Kitchen will be placed in SE, Master bedroom in SW, Living room in NE/NW for optimal energy flow.
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isGenerating}
          className={`w-full py-3 px-6 rounded-md font-medium text-white transition-colors
            ${isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Floor Plan...
            </span>
          ) : (
            '🎨 Generate Floor Plan'
          )}
        </button>
      </div>
    </form>
  );
}
