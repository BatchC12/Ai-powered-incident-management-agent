import React, { useEffect, useState } from 'react';
import { Network, Plus, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export const OntologyViewer: React.FC = () => {
  const [taxonomy, setTaxonomy] = useState<any>(null);
  const [totalClasses, setTotalClasses] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'object' | 'type' | 'service' | 'problem'>('object');

  // New concept form
  const [newConceptName, setNewConceptName] = useState('');
  const [parentConcept, setParentConcept] = useState('');
  const [conceptNotice, setConceptNotice] = useState<string | null>(null);

  const fetchOntology = async () => {
    try {
      const data = await api.getOntology();
      if (data) {
        setTaxonomy(data.taxonomy);
        setTotalClasses(data.total_classes);
      }
    } catch (err) {
      console.error('Failed to load ontology', err);
    }
  };

  useEffect(() => {
    fetchOntology();
  }, []);

  const handleAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptName.trim()) return;

    try {
      const res = await api.addOntologyConcept({
        category: activeCategory,
        concept_name: newConceptName.trim(),
        parent_concept: parentConcept.trim() || undefined,
      });
      setConceptNotice(`Registered concept '${res.concept}' under '${res.parent}'.`);
      setNewConceptName('');
      setParentConcept('');
      await fetchOntology();
    } catch (err) {
      console.error('Failed to add concept', err);
    }
  };

  const renderConceptTree = (node: any) => {
    return (
      <div key={node.uri} className="space-y-1 pl-4 border-l border-slate-800 my-1">
        <div className="flex items-center space-x-1.5 text-xs">
          <ChevronRight className="w-3 h-3 text-emerald-400" />
          <span className="font-semibold text-slate-200">{node.name}</span>
          <span className="text-[9px] text-slate-500 font-mono">({node.children?.length || 0} sub)</span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="space-y-1">
            {node.children.map((child: any) => renderConceptTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              OWL Incident Ontology Taxonomy
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Semantic vocabulary definitions underpinning the Concept Matchmaker algorithm (Section 6.1 & 6.2).
            Enables Exact (score 3), Plug-in (score 2), Subsume (score 1), and Fail (score 0) degree matching.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
          {totalClasses} Ontology Classes
        </div>
      </div>

      {conceptNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{conceptNotice}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {(['object', 'type', 'service', 'problem'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat} Hierarchy
          </button>
        ))}
      </div>

      {/* Main Grid: Visual Tree & Dynamic Concept Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concept Hierarchy View */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 capitalize">
              {activeCategory} Class Hierarchy
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">rdfs:subClassOf Traversal</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-h-[500px] overflow-y-auto">
            {taxonomy && taxonomy[activeCategory]?.concepts ? (
              taxonomy[activeCategory].concepts.map((node: any) => renderConceptTree(node))
            ) : (
              <div className="text-slate-500 text-xs py-8 text-center">Loading ontology hierarchy...</div>
            )}
          </div>
        </div>

        {/* Dynamic Concept Registration Form */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Plus className="w-5 h-5" />
            <h2 className="text-sm font-bold">Add New Concept</h2>
          </div>
          <p className="text-[11px] text-slate-400">
            Extend the ontology hierarchy dynamically. New concepts immediately become matchable in the Incident Agent.
          </p>

          <form onSubmit={handleAddConcept} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Category</label>
              <input
                type="text"
                disabled
                value={activeCategory.toUpperCase()}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Concept Name</label>
              <input
                type="text"
                placeholder="e.g. KubernetesCluster, VPNGateway"
                value={newConceptName}
                onChange={(e) => setNewConceptName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Parent Concept (Optional)</label>
              <input
                type="text"
                placeholder={`Leave blank to attach to ${activeCategory.toUpperCase()}`}
                value={parentConcept}
                onChange={(e) => setParentConcept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={!newConceptName.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              Register Concept in Ontology
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
