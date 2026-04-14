import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkle } from "@phosphor-icons/react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PlotInputForm = ({ onProjectGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plot_length: 40,
    plot_width: 60,
    facing_direction: "east",
    num_floors: 1,
    bedrooms: 3,
    kitchen: 1,
    bathrooms: 2,
    pooja_room: 1,
    parking: 1,
    style: "modern",
    budget_range: "medium"
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/projects/generate`, formData, { withCredentials: true });
      onProjectGenerated(response.data);
    } catch (error) {
      console.error("Error generating project:", error);
      toast.error("Failed to generate floor plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight mb-1" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>Plot Details</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-mono">Configure your project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plot Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="plot_length" className="text-xs uppercase tracking-wider text-stone-600 font-mono">Length (ft)</Label>
            <Input
              data-testid="plot-length-input"
              id="plot_length"
              type="number"
              value={formData.plot_length}
              onChange={(e) => handleChange('plot_length', parseFloat(e.target.value))}
              className="rounded-none border-stone-300 focus-visible:ring-stone-900 mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="plot_width" className="text-xs uppercase tracking-wider text-stone-600 font-mono">Width (ft)</Label>
            <Input
              data-testid="plot-width-input"
              id="plot_width"
              type="number"
              value={formData.plot_width}
              onChange={(e) => handleChange('plot_width', parseFloat(e.target.value))}
              className="rounded-none border-stone-300 focus-visible:ring-stone-900 mt-1"
              required
            />
          </div>
        </div>

        {/* Facing Direction */}
        <div>
          <Label htmlFor="facing" className="text-xs uppercase tracking-wider text-stone-600 font-mono">Facing Direction</Label>
          <Select value={formData.facing_direction} onValueChange={(value) => handleChange('facing_direction', value)}>
            <SelectTrigger data-testid="facing-direction-select" className="rounded-none border-stone-300 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
              <SelectItem value="northeast">Northeast</SelectItem>
              <SelectItem value="northwest">Northwest</SelectItem>
              <SelectItem value="southeast">Southeast</SelectItem>
              <SelectItem value="southwest">Southwest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Floors */}
        <div>
          <Label htmlFor="floors" className="text-xs uppercase tracking-wider text-stone-600 font-mono">Number of Floors</Label>
          <Input
            data-testid="num-floors-input"
            id="floors"
            type="number"
            min="1"
            max="5"
            value={formData.num_floors}
            onChange={(e) => handleChange('num_floors', parseInt(e.target.value))}
            className="rounded-none border-stone-300 focus-visible:ring-stone-900 mt-1"
            required
          />
        </div>

        {/* Room Requirements */}
        <div className="pt-2">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-3">Room Requirements</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bedrooms" className="text-xs text-stone-600">Bedrooms</Label>
              <Input
                data-testid="bedrooms-input"
                id="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
                className="rounded-none border-stone-300 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms" className="text-xs text-stone-600">Bathrooms</Label>
              <Input
                data-testid="bathrooms-input"
                id="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', parseInt(e.target.value))}
                className="rounded-none border-stone-300 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pooja" className="text-xs text-stone-600">Pooja Room</Label>
              <Input
                data-testid="pooja-room-input"
                id="pooja"
                type="number"
                min="0"
                max="1"
                value={formData.pooja_room}
                onChange={(e) => handleChange('pooja_room', parseInt(e.target.value))}
                className="rounded-none border-stone-300 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="parking" className="text-xs text-stone-600">Parking</Label>
              <Input
                data-testid="parking-input"
                id="parking"
                type="number"
                min="0"
                value={formData.parking}
                onChange={(e) => handleChange('parking', parseInt(e.target.value))}
                className="rounded-none border-stone-300 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Style */}
        <div>
          <Label htmlFor="style" className="text-xs uppercase tracking-wider text-stone-600 font-mono">House Style</Label>
          <Select value={formData.style} onValueChange={(value) => handleChange('style', value)}>
            <SelectTrigger data-testid="style-select" className="rounded-none border-stone-300 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budget" className="text-xs uppercase tracking-wider text-stone-600 font-mono">Budget Range</Label>
          <Select value={formData.budget_range} onValueChange={(value) => handleChange('budget_range', value)}>
            <SelectTrigger data-testid="budget-select" className="rounded-none border-stone-300 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="low">Low (₹15-25L)</SelectItem>
              <SelectItem value="medium">Medium (₹25-50L)</SelectItem>
              <SelectItem value="high">High (₹50L+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          data-testid="generate-plan-button"
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none py-6 mt-6"
        >
          {loading ? (
            <span className="font-mono">Generating...</span>
          ) : (
            <>
              <Sparkle size={20} className="mr-2" weight="fill" />
              <span className="font-semibold">Generate Floor Plan</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PlotInputForm;