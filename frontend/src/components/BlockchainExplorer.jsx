import React, { useState } from 'react';

/**
 * Interactive Blockchain Explorer Component
 * Renders filterable block ledger history, search bar, and expandable block payload detail modal.
 */
export default function BlockchainExplorer({ blocks = [] }) {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredBlocks = blocks.filter((block) => {
    const actionMatch = selectedAction === 'ALL' || block.action.toUpperCase() === selectedAction;
    const query = search.trim().toLowerCase();
    if (!query) return actionMatch;

    const textMatch =
      String(block.index).includes(query) ||
      block.hash.toLowerCase().includes(query) ||
      block.previousHash.toLowerCase().includes(query) ||
      block.action.toLowerCase().includes(query) ||
      JSON.stringify(block.data || {}).toLowerCase().includes(query);

    return actionMatch && textMatch;
  });

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'VOTE_CAST':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ELECTION_CREATED':
      case 'ELECTION_STATE_CHANGED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'CANDIDATE_REGISTERED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Immutable Ledger Explorer</h3>
          <p className="text-xs text-slate-400 mt-0.5">Inspect chained block data, SHA-256 hashes, and cryptographic proof linkage.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search block #, hash, or data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Actions</option>
            <option value="VOTE_CAST">Votes Only</option>
            <option value="ELECTION_CREATED">Elections Only</option>
            <option value="CANDIDATE_REGISTERED">Candidates Only</option>
          </select>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-4">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
            <p className="text-slate-400 text-sm">No blockchain blocks found matching filter parameters.</p>
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const isExpanded = expandedIndex === block.index;
            return (
              <div
                key={block.index}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all overflow-hidden"
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : block.index)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm font-bold text-slate-300 flex items-center justify-center">
                      #{block.index}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getActionBadgeClass(block.action)}`}>
                          {block.action}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(block.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1 truncate max-w-md">
                        Hash: <span className="text-slate-300">{block.hash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500 font-mono hidden lg:inline truncate max-w-xs">
                      Prev: {block.previousHash ? block.previousHash.substring(0, 16) + '...' : '000000'}
                    </span>
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                      {isExpanded ? 'Hide Payload ▲' : 'View Payload ▼'}
                    </button>
                  </div>
                </div>

                {/* Expanded Payload Data */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-800 text-xs font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <span className="text-slate-500 block mb-1">Current Block Hash (SHA-256):</span>
                        <span className="text-emerald-400 break-all bg-slate-950 p-2 rounded block border border-slate-800">
                          {block.hash}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Previous Block Hash Link:</span>
                        <span className="text-slate-300 break-all bg-slate-950 p-2 rounded block border border-slate-800">
                          {block.previousHash || '0'.repeat(64)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Block Data Payload (Anonymized JSON):</span>
                      <pre className="bg-slate-950 text-indigo-300 p-3 rounded overflow-x-auto border border-slate-800">
                        {JSON.stringify(block.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
