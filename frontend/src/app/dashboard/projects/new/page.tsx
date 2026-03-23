'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from '@/lib/api';
import { CreateProjectData } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    plotDetails: {
      length: 0,
      width: 0,
      area: 0,
      facingDirection: 'North',
      shape: 'rectangular',
    },
    roomRequirements: {
      bedrooms: 2,
      bathrooms: 2,
      kitchen: 1,
      livingRoom: 1,
      diningRoom: 0,
      studyRoom: 0,
      poojaRoom: 0,
      balconies: 0,
      parking: 0,
      storeRoom: 0,
    },
    designPreferences: {
      styles: [],
      vastuCompliant: false,
      budgetMin: 0,
      budgetMax: 0,
      specialRequirements: [],
      floorCount: 1,
      notes: '',
    },
  });

  const handleInputChange = (section: keyof CreateProjectData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calculate area if not provided
      if (formData.plotDetails.area === 0) {
        formData.plotDetails.area = formData.plotDetails.length * formData.plotDetails.width;
      }

      const response = await projectsApi.create(formData);
      router.push(`/dashboard/projects/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details to generate your house design
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Basic Info', 'Plot Details', 'Room Requirements', 'Preferences'].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step > idx + 1
                    ? 'bg-green-500 text-white'
                    : step === idx + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <p className="text-xs mt-2 text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card max-w-3xl mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., My Dream Home"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Brief description of your project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Plot Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Plot Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (feet) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input"
                    placeholder="40"
                    value={formData.plotDetails.length || ''}
                    onChange={(e) =>
                      handleInputChange('plotDetails', 'length', parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (feet) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input"
                    placeholder="60"
                    value={formData.plotDetails.width || ''}
                    onChange={(e) =>
                      handleInputChange('plotDetails', 'width', parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Area (sq ft)
                </label>
                <input
                  type="number"
                  className="input bg-gray-50"
                  value={formData.plotDetails.length * formData.plotDetails.width || ''}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facing Direction
                </label>
                <select
                  className="input"
                  value={formData.plotDetails.facingDirection}
                  onChange={(e) =>
                    handleInputChange('plotDetails', 'facingDirection', e.target.value)
                  }
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="NorthEast">North-East</option>
                  <option value="NorthWest">North-West</option>
                  <option value="SouthEast">South-East</option>
                  <option value="SouthWest">South-West</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Shape
                </label>
                <select
                  className="input"
                  value={formData.plotDetails.shape}
                  onChange={(e) => handleInputChange('plotDetails', 'shape', e.target.value)}
                >
                  <option value="rectangular">Rectangular</option>
                  <option value="square">Square</option>
                  <option value="L-shaped">L-Shaped</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Room Requirements */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Room Requirements</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input"
                    value={formData.roomRequirements.bedrooms}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'bedrooms', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input"
                    value={formData.roomRequirements.bathrooms}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'bathrooms', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kitchen
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.kitchen}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'kitchen', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Living Room
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.livingRoom}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'livingRoom', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dining Room
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.diningRoom}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'diningRoom', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Room
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.studyRoom}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'studyRoom', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pooja Room
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.poojaRoom}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'poojaRoom', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balconies
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.balconies}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'balconies', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.parking}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'parking', parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Room
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.roomRequirements.storeRoom}
                    onChange={(e) =>
                      handleInputChange('roomRequirements', 'storeRoom', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Design Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Design Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="input"
                  value={formData.designPreferences?.floorCount}
                  onChange={(e) =>
                    handleInputChange('designPreferences', 'floorCount', parseInt(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.designPreferences?.vastuCompliant}
                    onChange={(e) =>
                      handleInputChange('designPreferences', 'vastuCompliant', e.target.checked)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Vastu Compliant Design
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Min (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    placeholder="10"
                    value={formData.designPreferences?.budgetMin || ''}
                    onChange={(e) =>
                      handleInputChange('designPreferences', 'budgetMin', parseFloat(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Max (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    placeholder="50"
                    value={formData.designPreferences?.budgetMax || ''}
                    onChange={(e) =>
                      handleInputChange('designPreferences', 'budgetMax', parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Any special requirements or preferences..."
                  value={formData.designPreferences?.notes}
                  onChange={(e) =>
                    handleInputChange('designPreferences', 'notes', e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary ml-auto"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
