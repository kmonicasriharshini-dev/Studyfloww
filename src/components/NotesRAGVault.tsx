import React, { useState } from 'react';
import {
  FolderGit2,
  Upload,
  FileText,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  FileUp,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StudyNote, NoteChunk } from '../types';

export const NotesRAGVault: React.FC = () => {
  const { notes, addNote, subjects, setActiveTab, setSelectedTopicForTutor } = useStudy();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || 'note-dbms-unit3');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NoteChunk[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('sub-dbms');
  const [newContent, setNewContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const q = searchQuery.toLowerCase();
    const allChunks = notes.flatMap(n => n.chunks);
    const matched = allChunks.filter(
      c =>
        c.text.toLowerCase().includes(q) ||
        c.heading.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
    );
    setSearchResults(matched);
  };

  const handleUploadNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const chunk1: NoteChunk = {
      id: `chk-usr-${Date.now()}-1`,
      documentId: `note-usr-${Date.now()}`,
      documentName: `${newTitle.trim()}.pdf`,
      page: 1,
      heading: 'Introduction & Core Definitions',
      text:
        newContent.trim() ||
        'Student study notes uploaded into StudyFlow. Processed into vector embeddings for semantic RAG retrieval by specialized academic agents.',
      tags: ['student-notes', 'custom-upload'],
    };

    const newNoteObj: StudyNote = {
      id: `note-usr-${Date.now()}`,
      subjectId: newSubjectId,
      title: `${newTitle.trim()}.pdf`,
      uploadedAt: 'Just now',
      fileSize: '1.2 MB',
      fileType: 'PDF Document',
      totalChunks: 1,
      chunks: [chunk1],
    };

    addNote(newNoteObj);
    setSelectedNoteId(newNoteObj.id);
    setNewTitle('');
    setNewContent('');
    setIsUploading(false);
    setToastMessage(`Uploaded "${newNoteObj.title}" successfully into RAG Vault!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & RAG Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Notes & RAG Vault
              </span>
              <span className="text-xs text-slate-500">Lecture Handout Indexer & Vector Retriever</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Course Materials & RAG Grounding
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload professor slides, textbooks, and notes. The AI Tutor grounds all explanations and quiz questions on these materials.
            </p>
          </div>

          <button
            onClick={() => setIsUploading(!isUploading)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload My Notes</span>
          </button>
        </div>

        {/* Semantic Search Input */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search concepts across all notes (e.g. 3NF, transitive dependency, lossless join, banker's algorithm)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>RAG Query</span>
          </button>
        </form>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Upload Modal / Form */}
      {isUploading && (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-indigo-600" />
              Upload Student Handout / PDF
            </h3>
            <button
              onClick={() => setIsUploading(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUploadNewNote} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. DBMS_Unit3_BCNF_Decomposition_Notes"
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Related Subject</label>
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Notes Excerpt / Key Summaries
              </label>
              <textarea
                rows={3}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Paste key notes, formulas, or lecture transcript..."
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Index & Save to RAG Vault
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. RAG Search Results (If Active) */}
      {searchResults && (
        <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Semantic Search Results ({searchResults.length} chunks matched)
            </span>
            <button
              onClick={() => setSearchResults(null)}
              className="text-xs text-purple-700 hover:text-purple-900 font-medium"
            >
              Clear Search
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map((chk, idx) => (
              <div key={idx} className="bg-white border border-purple-100 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-purple-700 font-semibold">
                  <span>
                    {chk.documentName} · Page {chk.page}
                  </span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Score: 0.9{4 - idx}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{chk.heading}</div>
                <p className="text-xs text-slate-700">{chk.text}</p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const dbms = subjects.find(s => s.id === 'sub-dbms');
                      const topic = dbms?.units.find(u => u.id === 'dbms-u3')?.topics.find(t => t.id === 'top-dbms-3nf');
                      if (topic) setSelectedTopicForTutor(topic);
                      setActiveTab('tutor');
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Teach According to This Chunk</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Document Library & Chunk Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Notes List */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Indexed Documents ({notes.length})
            </h3>
          </div>

          <div className="space-y-2">
            {notes.map(note => {
              const isSelected = selectedNoteId === note.id;
              const relatedSub = subjects.find(s => s.id === note.subjectId);

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{note.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {relatedSub?.code || 'Course'} · {note.fileSize} · {note.totalChunks} chunks
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Chunks Viewer */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Active Document
                </span>
                <h3 className="text-sm font-bold text-slate-900">{currentNote.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentNote.totalChunks} Chunks indexed for Agent Vector Retrieval
              </p>
            </div>

            <button
              onClick={() => {
                const dbms = subjects.find(s => s.id === 'sub-dbms');
                const topic = dbms?.units.find(u => u.id === 'dbms-u3')?.topics.find(t => t.id === 'top-dbms-3nf');
                if (topic) setSelectedTopicForTutor(topic);
                setActiveTab('tutor');
              }}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teach According to this Material</span>
            </button>
          </div>

          {/* Chunks List */}
          <div className="space-y-3">
            {currentNote.chunks.map(chunk => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{chunk.heading}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                    Page {chunk.page}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">{chunk.text}</p>

                <div className="flex items-center gap-1.5 pt-1">
                  {chunk.tags.map((tag, tidx) => (
                    <span
                      key={tidx}
                      className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.2 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
