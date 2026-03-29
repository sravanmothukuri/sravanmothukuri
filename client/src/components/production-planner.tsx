import React, { useState, ChangeEvent, useEffect, KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import CampaignModal from "./campaign-form-modal";

import { Download, Search, PlusCircle } from "lucide-react";

import type { ProductionBatch, Product } from "@shared/schema";

function formatDate(date?: string | Date | null): string {
  if (!date) return "–";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "–";
    return d.toLocaleDateString();
  } catch {
    return "–";
  }
}

function formatQty(qty?: string | number | null): string {
  if (qty === undefined || qty === null) return "–";
  const num = typeof qty === "string" ? Number(qty) : qty;
  if (isNaN(num)) return "–";
  return `${num.toFixed(3)} kg`;
}

type EditableFieldValue = string | number | Date | null;

export default function ProductionPlanner() {
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, EditableFieldValue>>({});

  const queryClient = useQueryClient();

  const { data: batches = [], isLoading } = useQuery<Array<ProductionBatch & { product: Product }>>({
    queryKey: ["production-batches"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
  });

  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const updateMutation = useMutation<
    unknown,
    Error,
    Partial<ProductionBatch> & { id: string }
  >({
    mutationFn: async (batchUpdate) => {
      const res = await fetch(`/api/production-batches/${batchUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchUpdate),
      });
      if (!res.ok) throw new Error("Failed to update batch");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      setEditingRowId(null);
      setEditData({});
    },
    onError: (error: Error) => {
      alert(`Update failed: ${error.message}`);
    },
  });

  const filteredBatches = batches.filter((batch) => {
    const lowerSearch = searchText.toLowerCase();
    const matchProduct = productFilter === "all" || batch.product.id === productFilter;
    const matchStatus = statusFilter === "all" || batch.status === statusFilter;
    const searchMatch =
      batch.batchNumber.toLowerCase().includes(lowerSearch) ||
      batch.campaignNumber.toLowerCase().includes(lowerSearch) ||
      batch.product.name.toLowerCase().includes(lowerSearch);
    return matchProduct && matchStatus && searchMatch;
  });

  useEffect(() => {
    if (!isCampaignModalOpen) {
      setEditingRowId(null);
      setEditData({});
    }
  }, [isCampaignModalOpen, batches]);

  if (isLoading) return <div>Loading...</div>;

  const sanitizeValueForInput = (val: unknown): string => {
    if (val === undefined || val === null) return "";
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    if (typeof val === "number") return String(val);
    if (typeof val === "string") return val;
    return "";
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof ProductionBatch
  ) => {
    let val: EditableFieldValue = e.target.value;

    if (field === "plannedQuantity" || field === "actualQuantity") {
      if (val === "") val = null;
      else if (!/^[\d.]+$/.test(val)) return;
      else val = Number(val);
    } else if (field.includes("Date") && typeof val === "string" && val !== "") {
      val = new Date(val);
    } else if (val === "") {
      val = null;
    }

    setEditData((prev) => ({
      ...prev,
      [field]: val,
    }));

    if (!editingRowId) setEditingRowId("");
  };

  const saveChanges = () => {
    if (!editingRowId) return;
    const payload: Partial<ProductionBatch> & { id: string } = { id: editingRowId };
    Object.entries(editData).forEach(([key, val]) => {
      const k = key as keyof ProductionBatch;
      if (val !== undefined) {
        (payload as any)[k] = val;
      }
    });
    updateMutation.mutate(payload);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditData({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "delayed":
        return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
      case "planned":
        return <Badge className="bg-gray-100 text-gray-800">Planned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderEditableCell = (batch: ProductionBatch & { product: Product }, field: keyof ProductionBatch) => {
    const isEditing = editingRowId === batch.id;
    const val = (batch as any)[field];

    const inputValue = sanitizeValueForInput(editData[field] ?? val);

    const commonInputProps = {
      value: inputValue,
      onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, field),
      onBlur: saveChanges,
      onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") saveChanges();
        else if (e.key === "Escape") cancelEditing();
      },
      autoFocus: true,
    };

    const startEdit = () => {
      if (!isEditing) {
        setEditingRowId(batch.id);
        setEditData((prev) => ({ ...prev, [field]: val ?? null }));
      }
    };

    const isQuantityField = field === "plannedQuantity" || field === "actualQuantity";

    const dateFields: (keyof ProductionBatch)[] = [
      "plannedStartDate", "actualStartDate", "plannedEndDate", "actualEndDate", "plannedAnalysisDate",
      "actualAnalysisDate", "plannedApprovalDate", "actualApprovalDate", "plannedDispatchDate", "actualDispatchDate",
    ];

    if (isQuantityField) {
      return (
        <TableCell onClick={startEdit}>
          {isEditing ? (
            <Input type="number" step="0.001" {...commonInputProps} />
          ) : (
            formatQty(val ?? null)
          )}
        </TableCell>
      );
    }

    if (dateFields.includes(field)) {
      return (
        <TableCell onClick={startEdit}>
          {isEditing ? (
            <Input type="date" {...commonInputProps} />
          ) : (
            formatDate(val ?? null)
          )}
        </TableCell>
      );
    }

    return <TableCell>{sanitizeValueForInput(val)}</TableCell>;
  };

  return (
    <div className="space-y-6">
      {/* ...UI layout continues unchanged... */}
    </div>
  );
}