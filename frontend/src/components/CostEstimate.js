import { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CurrencyInr } from "@phosphor-icons/react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CostEstimate = ({ projectId }) => {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostEstimate = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/projects/${projectId}/cost-estimate`);
        setCostData(response.data);
      } catch (error) {
        console.error("Error fetching cost estimate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCostEstimate();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center">
        <p className="text-stone-500 font-mono">Calculating cost estimate...</p>
      </div>
    );
  }

  if (!costData) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center">
        <p className="text-stone-500">Failed to load cost estimate</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 p-6">
      <h3 className="text-lg font-semibold mb-4" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>Cost Estimation & BOQ</h3>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-stone-200 p-4">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">Total Area</p>
          <p className="text-2xl font-mono font-semibold">{costData.total_area.toFixed(0)}</p>
          <p className="text-xs text-stone-600">sq.ft</p>
        </div>
        <div className="border border-stone-200 p-4">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">Rate</p>
          <p className="text-2xl font-mono font-semibold">₹{costData.cost_per_sqft}</p>
          <p className="text-xs text-stone-600">per sq.ft</p>
        </div>
        <div className="border border-stone-900 p-4 bg-stone-50">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono mb-2">Total Cost</p>
          <p className="text-2xl font-mono font-semibold text-blue-600">₹{(costData.construction_cost / 100000).toFixed(2)}L</p>
          <p className="text-xs text-stone-600">approx.</p>
        </div>
      </div>

      {/* BOQ Table */}
      <div>
        <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider font-mono text-stone-600">Bill of Quantities</h4>
        <Table data-testid="boq-table">
          <TableHeader>
            <TableRow className="border-stone-200">
              <TableHead className="font-mono text-xs uppercase">Item</TableHead>
              <TableHead className="font-mono text-xs uppercase">Quantity</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Amount (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costData.boq.map((item, idx) => (
              <TableRow key={idx} className="border-stone-200">
                <TableCell className="font-medium text-sm">{item.item}</TableCell>
                <TableCell className="font-mono text-sm text-stone-600">{item.quantity}</TableCell>
                <TableCell className="font-mono text-sm text-right font-semibold">
                  ₹{(item.amount / 100000).toFixed(2)}L
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-stone-900 bg-stone-50">
              <TableCell className="font-semibold" colSpan={2}>Total Estimated Cost</TableCell>
              <TableCell className="font-mono text-lg font-bold text-right text-blue-600">
                ₹{(costData.construction_cost / 100000).toFixed(2)}L
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-xs text-stone-500 font-mono border-t border-stone-200 pt-4">
        <p>* Estimates are approximate and may vary based on materials, labor rates, and location</p>
        <p>* Includes civil, electrical, plumbing, and finishing work</p>
      </div>
    </div>
  );
};

export default CostEstimate;