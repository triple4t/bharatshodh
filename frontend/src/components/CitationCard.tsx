import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export interface Citation {
  doc_id: string;
  filename: string;
  chunk_text: string;
  page_number?: number;
  relevance_score: number;
  chunk_index: number;
  page_start?: number;
  page_end?: number;
  chapter?: string;
}

interface CitationCardProps {
  citations: Citation[];
}

export default function CitationCard({ citations }: CitationCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!citations || citations.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  console.log('='.repeat(80));
  console.log('💳 CitationCard: Received', citations.length, 'citations');
  console.log('💳 First citation in CitationCard:', citations[0]);
  console.log('='.repeat(80));

  return (
    <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
      <div className="flex items-center gap-2 mb-2 text-purple-700 font-medium text-sm">
        <FileText className="w-4 h-4" />
        <span>Sources ({citations.length})</span>
      </div>

      <div className="space-y-2">
        {citations.map((citation, index) => (
          <div
            key={`${citation.doc_id}_${citation.chunk_index}`}
            className="bg-white rounded-md border border-purple-100 overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleExpand(index)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 text-left">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {citation.filename}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{(citation.relevance_score * 100).toFixed(0)}% relevance</span>
                    
                    {/* Page info */}
                    {citation.page_start && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Page {citation.page_start}
                        {citation.page_end && citation.page_end !== citation.page_start 
                          ? `-${citation.page_end}` 
                          : ''}
                      </span>
                    )}
                    
                    {/* Chapter info */}
                    {citation.chapter && (
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        <BookOpen className="w-3 h-3" />
                        {citation.chapter}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {expandedIndex === index && (
              <div className="px-3 py-2 bg-slate-50 border-t border-purple-100">
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {citation.chunk_text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
