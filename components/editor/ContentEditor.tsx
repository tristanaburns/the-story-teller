'use client';

import React, { useState, useEffect } from 'react';
import { Save, FileText, Tag, ChevronDown, ChevronUp, Info } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'scene' | 'note' | 'description';
  metadata?: {
    [key: string]: string | string[] | number | boolean;
  };
}

interface StoryMetadata {
  title: string;
  genre?: string;
  setting?: string;
  themes?: string[];
  timeframe?: string;
  pov?: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  [key: string]: string | string[] | number | boolean | undefined;
}

interface ContentEditorProps {
  storyId: string;
  initialSections?: ContentSection[];
  initialMetadata?: StoryMetadata;
  onSave?: (sections: ContentSection[], metadata: StoryMetadata) => void;
  readOnly?: boolean;
}

export default function ContentEditor({
  storyId,
  initialSections = [],
  initialMetadata = { title: '' },
  onSave,
  readOnly = false
}: ContentEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>(initialSections);
  const [metadata, setMetadata] = useState<StoryMetadata>(initialMetadata);
  const [activeSection, setActiveSection] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null
  );
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
    type: null, message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  
  // Generate a unique ID for new sections
  function generateId(): string {
    return 'section_' + Math.random().toString(36).substring(2, 15);
  }

  // Get the current section data based on active section ID
  const currentSection = sections.find(section => section.id === activeSection) || null;

  // Handle save action
  const handleSave = () => {
    if (onSave) {
      onSave(sections, metadata);
      setUnsavedChanges(false);
    }
  };

  // Add a new section
  const addSection = (type: 'chapter' | 'scene' | 'note' | 'description') => {
    const newSection: ContentSection = {
      id: generateId(),
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: '',
      type
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    setActiveSection(newSection.id);
    setUnsavedChanges(true);
  };

  // Remove a section
  const removeSection = (id: string) => {
    const sectionIndex = sections.findIndex(section => section.id === id);
    
    const updatedSections = sections.filter(section => section.id !== id);
    setSections(updatedSections);
    
    // If we've removed the active section, select a new one
    if (activeSection === id) {
      if (updatedSections.length > 0) {
        // Try to select the section that was at the same index, or the last section
        const newIndex = Math.min(sectionIndex, updatedSections.length - 1);
        setActiveSection(updatedSections[newIndex].id);
      } else {
        setActiveSection(null);
      }
    }
    
    setUnsavedChanges(true);
  };

  // Update section content
  const updateSectionContent = (id: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
    setUnsavedChanges(true);
  };

  // Update section title
  const updateSectionTitle = (id: string, title: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, title } : section
    ));
    setUnsavedChanges(true);
  };

  // Move section up in order
  const moveSectionUp = (id: string) => {
    const index = sections.findIndex(section => section.id === id);
    if (index <= 0) return;
    
    const updatedSections = [...sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[index - 1];
    updatedSections[index - 1] = temp;
    
    setSections(updatedSections);
    setUnsavedChanges(true);
  };

  // Move section down in order
  const moveSectionDown = (id: string) => {
    const index = sections.findIndex(section => section.id === id);
    if (index === -1 || index >= sections.length - 1) return;
    
    const updatedSections = [...sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[index + 1];
    updatedSections[index + 1] = temp;
    
    setSections(updatedSections);
    setUnsavedChanges(true);
  };

  // Update metadata
  const updateMetadata = (field: string, value: string | string[] | number | boolean) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
    setUnsavedChanges(true);
  };

  // Add a theme to the story
  const addTheme = (theme: string) => {
    const currentThemes = metadata.themes || [];
    if (!currentThemes.includes(theme)) {
      updateMetadata('themes', [...currentThemes, theme]);
    }
  };

  // Remove a theme from the story
  const removeTheme = (theme: string) => {
    const currentThemes = metadata.themes || [];
    updateMetadata('themes', currentThemes.filter(t => t !== theme));
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-white font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-400" />
            Content Editor
          </h2>
          
          {unsavedChanges && !readOnly && (
            <span className="ml-3 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
              Unsaved Changes
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center px-3 py-1.5 text-sm gap-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Tag className="h-4 w-4" />
            <span>{showMetadata ? 'Hide Metadata' : 'Show Metadata'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={readOnly || !unsavedChanges}
            className={`flex items-center px-3 py-1.5 text-sm gap-1 rounded transition-colors ${
              readOnly || !unsavedChanges
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
      
      {/* Metadata Panel */}
      {showMetadata && (
        <div className="bg-gray-800/60 border-b border-gray-700 p-4">
          <h3 className="text-lg font-medium text-white mb-4">Story Metadata</h3>
          
          <div className="px-4 py-4 space-y-4">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={metadata.title || ''}
                onChange={(e) => updateMetadata('title', e.target.value)}
                readOnly={readOnly}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Story Title"
              />
            </div>
            
            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-white">
                Genre
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={metadata.genre || ''}
                onChange={(e) => updateMetadata('genre', e.target.value)}
                readOnly={readOnly}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Fantasy, Sci-fi, Mystery"
              />
            </div>
            
            {/* Setting */}
            <div>
              <label htmlFor="setting" className="block text-sm font-medium text-white">
                Setting
              </label>
              <input
                type="text"
                id="setting"
                name="setting"
                value={metadata.setting || ''}
                onChange={(e) => updateMetadata('setting', e.target.value)}
                readOnly={readOnly}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Medieval Europe, Future Mars Colony"
              />
            </div>
            
            {/* Timeframe */}
            <div>
              <label htmlFor="timeframe" className="block text-sm font-medium text-white">
                Timeframe
              </label>
              <input
                type="text"
                id="timeframe"
                name="timeframe"
                value={metadata.timeframe || ''}
                onChange={(e) => updateMetadata('timeframe', e.target.value)}
                readOnly={readOnly}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 18th Century, 3 days, A lifetime"
              />
            </div>
            
            {/* Point of View */}
            <div>
              <label htmlFor="pov" className="block text-sm font-medium text-white">
                Point of View
              </label>
              <select
                id="pov"
                name="pov"
                value={metadata.pov || ''}
                onChange={(e) => updateMetadata('pov', e.target.value)}
                disabled={readOnly}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Point of View</option>
                <option value="first_person">First Person</option>
                <option value="second_person">Second Person</option>
                <option value="third_person_limited">Third Person Limited</option>
                <option value="third_person_omniscient">Third Person Omniscient</option>
              </select>
            </div>
            
            {/* Themes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Themes
              </label>
              
              {!readOnly && (
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a theme"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTheme.trim()) {
                        addTheme(newTheme.trim());
                        setNewTheme('');
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTheme.trim()) {
                        addTheme(newTheme.trim());
                        setNewTheme('');
                      }
                    }}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Add
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {(metadata.themes?.length ?? 0) > 0 ? (
                  metadata.themes?.map((theme, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {theme}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => removeTheme(theme)}
                          className="ml-2 text-gray-400 hover:text-gray-200"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-sm">No themes defined</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Editor Area */}
      <div className="flex flex-grow min-h-0">
        {/* Sections Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 bg-gray-800">
            <h3 className="text-white font-medium">Sections</h3>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <ul className="py-2 px-1">
              {sections.map((section, index) => (
                <li key={section.id} className="mb-1">
                  <div
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-center overflow-hidden">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        section.type === 'chapter' ? 'bg-yellow-500' :
                        section.type === 'scene' ? 'bg-green-500' :
                        section.type === 'note' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}></span>
                      <span className="truncate">{section.title}</span>
                    </div>
                    
                    {!readOnly && activeSection === section.id && (
                      <div className="flex items-center ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionUp(section.id);
                          }}
                          disabled={index === 0}
                          className={`p-1 ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionDown(section.id);
                          }}
                          disabled={index === sections.length - 1}
                          className={`p-1 ${index === sections.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {!readOnly && (
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addSection('chapter')}
                  className="bg-gray-700 hover:bg-gray-600 text-sm text-white p-2 rounded"
                >
                  + Chapter
                </button>
                <button
                  type="button"
                  onClick={() => addSection('scene')}
                  className="bg-gray-700 hover:bg-gray-600 text-sm text-white p-2 rounded"
                >
                  + Scene
                </button>
                <button
                  type="button"
                  onClick={() => addSection('note')}
                  className="bg-gray-700 hover:bg-gray-600 text-sm text-white p-2 rounded"
                >
                  + Note
                </button>
                <button
                  type="button"
                  onClick={() => addSection('description')}
                  className="bg-gray-700 hover:bg-gray-600 text-sm text-white p-2 rounded"
                >
                  + Description
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Editor Content */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {currentSection ? (
            <>
              {/* Section Header */}
              <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={currentSection.title}
                    onChange={(e) => updateSectionTitle(currentSection.id, e.target.value)}
                    readOnly={readOnly}
                    className="w-full bg-transparent border-none p-0 text-lg text-white focus:outline-none focus:ring-0"
                    placeholder="Section Title"
                  />
                </div>
                
                {!readOnly && sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(currentSection.id)}
                    className="ml-2 text-red-400 hover:text-red-300 p-1 rounded"
                    title="Remove Section"
                  >
                    &times;
                  </button>
                )}
              </div>
              
              {/* Section Type Info */}
              <div className="p-2 bg-gray-800/60 border-b border-gray-700 flex items-center text-xs text-gray-400">
                <Info size={12} className="mr-1" />
                {currentSection.type === 'chapter' && 'Chapters are major divisions in your story.'}
                {currentSection.type === 'scene' && 'Scenes are events that occur in a specific time and place.'}
                {currentSection.type === 'note' && 'Notes are for your reference and won\'t be included in the final story.'}
                {currentSection.type === 'description' && 'Descriptions provide details about characters, locations, or other elements.'}
              </div>
              
              {/* Markdown Editor */}
              <div className="flex-grow overflow-hidden">
                <MarkdownEditor
                  initialValue={currentSection.content}
                  onChange={(content) => updateSectionContent(currentSection.id, content)}
                  onSave={handleSave}
                  readOnly={readOnly}
                  placeholder={`Start writing your ${currentSection.type}...`}
                  height="100%"
                  minHeight="100%"
                />
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gray-900 text-gray-500">
              <p>No section selected. Create or select a section to start editing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
