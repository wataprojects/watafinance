"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  PatrimonyOverviewCard,
  PatrimonyDistributionChart,
  PatrimonyDistributionBars,
  PatrimonyInsights,
  PatrimonyAssetForm,
  EnhancedPatrimonyAssetCard,
  EnhancedAssetDetailModal,
  PatrimonyHealthIndicator,
  IncoherenceList,
} from "@/components/patrimony";
import { usePatrimonyData } from "@/hooks/usePatrimonyData";
import { usePatrimonyInsights } from "@/hooks/usePatrimonyInsights";
import { usePatrimonyEvolution } from "@/hooks/usePatrimonyEvolution";
import { usePatrimonyHealth } from "@/hooks/usePatrimonyHealth";
import { useIncoherenceDetection } from "@/hooks/useIncoherenceDetection";
import { Asset } from "@/types/patrimony";

const PatrimonyPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form and modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Data hooks
  const {
    assets,
    debts,
    loans,
    investments,
    loading: dataLoading,
    totalAssets,
    totalDebts,
    totalDebtsFromDebts,
    totalDebtsFromLoans,
    netPatrimony,
    overview,
    distribution,
    addAsset,
    updateAsset,
    deleteAsset,
  } = usePatrimonyData(userId);

  const { createSnapshot, getLatestSnapshot, getPreviousSnapshot, getEvolutionPercentage } = usePatrimonyEvolution(userId);

  const insights = usePatrimonyInsights(assets, debts, totalAssets, totalDebts, netPatrimony, distribution);

  // New hooks for intelligent analysis
  const health = usePatrimonyHealth({
    assets,
    debts,
    totalAssets,
    totalDebts,
    netPatrimony,
  });

  const incoherences = useIncoherenceDetection({
    assets,
    investments,
    debts,
    totalAssets,
  });

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUserId(session.user.id);
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Calculate evolution when snapshots change
  const enrichedOverview = useCallback(() => {
    const latest = getLatestSnapshot();
    const previous = getPreviousSnapshot();
    const previousNet = previous?.net_patrimony ?? netPatrimony;
    const evolutionPct = getEvolutionPercentage(netPatrimony, previousNet);

    return {
      ...overview,
      evolutionPercentage: evolutionPct,
      evolutionAmount: netPatrimony - previousNet,
      previousNetPatrimony: previousNet,
    };
  }, [overview, netPatrimony, getLatestSnapshot, getPreviousSnapshot, getEvolutionPercentage]);

  const handleAddAsset = async (data: Partial<Asset>) => {
    await addAsset(data);
    setIsFormOpen(false);
    
    // Create a snapshot after adding
    const dist = distribution.reduce((acc, d) => {
      acc[d.category] = d.percentage;
      return acc;
    }, {} as Record<string, number>);
    await createSnapshot(totalAssets, totalDebts, netPatrimony, dist);
  };

  const handleEditAsset = async (data: Partial<Asset>) => {
    if (!editingAsset) return;
    await updateAsset(editingAsset.id, data);
    setEditingAsset(null);
    setIsFormOpen(false);
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    await deleteAsset(selectedAsset.id);
    setIsDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  const openEditForm = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const openDetailModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailModalOpen(true);
  };

  const openDeleteConfirm = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleNavigate = (route: string) => {
    if (route === '#add-asset') {
      setEditingAsset(null);
      setIsFormOpen(true);
      return;
    }
    if (route.startsWith('/')) {
      navigate(route);
    }
  };

  const getLinkedDebt = (debtId?: string) => {
    if (!debtId) return null;
    return debts.find(d => d.id === debtId) || null;
  };

  const getLinkedInvestments = (investmentIds: string[]) => {
    if (!investmentIds || investmentIds.length === 0) return [];
    return investments.filter(i => investmentIds.includes(i.id));
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 mb-4" />
          <p className="text-zinc-400">Cargando patrimonio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Tu Patrimonio Integral" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Patrimonio</h1>
            <p className="text-sm text-emerald-400/70">Centro de Inteligencia Patrimonial</p>
          </div>
        </div>

        {/* Health Indicator - NEW */}
        {assets.length > 0 && (
          <PatrimonyHealthIndicator health={health} />
        )}

        {/* Overview Card */}
        <PatrimonyOverviewCard overview={enrichedOverview()} />

        {/* Add Asset Button */}
        <Button
          onClick={() => {
            setEditingAsset(null);
            setIsFormOpen(true);
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Activo
        </Button>

        {/* Incoherences Alert - NEW */}
        {incoherences.length > 0 && (
          <IncoherenceList incoherences={incoherences} onNavigate={handleNavigate} />
        )}

        {/* Distribution and Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PatrimonyDistributionChart
            distribution={distribution}
            totalAssets={totalAssets}
          />
          <PatrimonyInsights insights={insights} />
        </div>

        {/* Distribution Bars */}
        <PatrimonyDistributionBars distribution={distribution} />

        {/* Assets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📋</span>
              Mis Activos
              <span className="text-sm font-normal text-zinc-500">
                ({assets.length})
              </span>
            </h2>
          </div>

          {assets.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 mb-2">No tienes activos registrados</p>
              <p className="text-sm text-zinc-500 mb-4">
                Comienza agregando tus primeros activos para ver tu patrimonio
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar tu primer activo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <EnhancedPatrimonyAssetCard
                  key={asset.id}
                  asset={asset}
                  percentage={totalAssets > 0 ? (Number(asset.value) / totalAssets) * 100 : 0}
                  totalAssets={totalAssets}
                  investments={investments}
                  debts={debts}
                  onEdit={openEditForm}
                  onDelete={openDeleteConfirm}
                  onViewDetails={openDetailModal}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asset Form Modal */}
      {isFormOpen && (
        <PatrimonyAssetForm
          asset={editingAsset}
          onSubmit={editingAsset ? handleEditAsset : handleAddAsset}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAsset(null);
          }}
          debts={debts.map(d => ({ id: d.id, name: d.name }))}
        />
      )}

      {/* Enhanced Asset Detail Modal */}
      {isDetailModalOpen && selectedAsset && (
        <EnhancedAssetDetailModal
          asset={selectedAsset}
          linkedDebt={getLinkedDebt(selectedAsset.linked_debt_id)}
          linkedInvestments={getLinkedInvestments(selectedAsset.linked_investment_ids)}
          allInvestments={investments}
          percentage={totalAssets > 0 ? (Number(selectedAsset.value) / totalAssets) * 100 : 0}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAsset(null);
          }}
          onEdit={(asset) => {
            setIsDetailModalOpen(false);
            openEditForm(asset);
          }}
          onDelete={(asset) => {
            setIsDetailModalOpen(false);
            openDeleteConfirm(asset);
          }}
          onNavigate={handleNavigate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-sm bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Eliminar Activo
              </h3>
              <p className="text-sm text-zinc-400">
                ¿Estás seguro de que quieres eliminar "{selectedAsset.name}"? Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedAsset(null);
                }}
                className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 h-11"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteAsset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white h-11"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PatrimonyPage;