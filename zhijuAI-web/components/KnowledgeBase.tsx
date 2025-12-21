
import React, { useState } from 'react';
import { KnowledgeItem, KnowledgeType } from '../types';
import { analyzeImageForKnowledgeBase } from '../services/geminiService';
import { KNOWLEDGE_CATEGORIES } from '../constants';

interface KnowledgeBaseProps {
  entries: KnowledgeItem[];
  onSaveEntry: (entry: KnowledgeItem) => void;
  onDeleteEntry: (id: string) => void;
  canEdit: boolean;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ entries, onSaveEntry, onDeleteEntry, canEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<KnowledgeType>('TEXT');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Category State
  const [categories, setCategories] = useState<string[]>(KNOWLEDGE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newCategoryName, setNewCategoryName] = useState(''); // For adding new category
  
  // Form State
  const [title, setTitle] = useState('');
  const [formCategory, setFormCategory] = useState(KNOWLEDGE_CATEGORIES[0]);
  const [content, setContent] = useState(''); // Text content or File summary or Image Analysis
  const [sourceName, setSourceName] = useState(''); // File name or URL
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined); // Display URL for image type
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter entries
  const filteredEntries = entries.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceName(file.name);
      setIsProcessing(true);
      // Simulate extraction delay for PDF/PPT
      setTimeout(() => {
        setIsProcessing(false);
        setContent(`[系统提示: 已模拟提取 ${file.name} 的内容]\n这是一个演示文本。在实际应用中，这里会显示 PDF 或 PPT 的解析内容...\n\n(请在此处补充或修改文档的关键知识点)`);
      }, 1000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSourceName(file.name);
        
        // Convert to Base64 for display and API
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setImageUrl(base64String);
            
            // Call AI Service
            setIsProcessing(true);
            setContent("AI 正在识别图片内容，请稍候...");
            
            try {
                const analysisText = await analyzeImageForKnowledgeBase(base64String);
                setContent(analysisText);
            } catch (err) {
                setContent("图片识别失败，请手动输入描述。");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
      setEditingId(null);
      resetForm();
      setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KnowledgeItem) => {
      setEditingId(item.id);
      setTitle(item.title);
      setFormCategory(item.category || KNOWLEDGE_CATEGORIES[0]);
      setContent(item.content);
      setSourceName(item.sourceName || '');
      setImageUrl(item.imageUrl);
      setActiveTab(item.type);
      setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!title || !content) {
      alert("请填写标题和内容");
      return;
    }

    const newItem: KnowledgeItem = {
      id: editingId || `kb_${Date.now()}`,
      title,
      category: formCategory,
      type: activeTab,
      content,
      sourceName: activeTab !== 'TEXT' ? sourceName : undefined,
      imageUrl: activeTab === 'IMAGE' ? imageUrl : undefined,
      createdAt: editingId 
        ? (entries.find(e => e.id === editingId)?.createdAt || new Date().toISOString().split('T')[0]) 
        : new Date().toISOString().split('T')[0]
    };

    onSaveEntry(newItem);
    resetForm();
    setIsModalOpen(false);
  };

  const handleAddCategory = () => {
      if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
          setCategories([...categories, newCategoryName.trim()]);
          setNewCategoryName('');
      }
  };

  const resetForm = () => {
    setTitle('');
    setFormCategory(KNOWLEDGE_CATEGORIES[0]);
    setContent('');
    setSourceName('');
    setImageUrl(undefined);
    setActiveTab('TEXT');
  };

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      
      {/* Sidebar - Category Management */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">📚 知识分类</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors ${selectedCategory === 'ALL' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  <span>全部知识</span>
                  <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{entries.length}</span>
              </button>
              {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                      <span>{cat}</span>
                      <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{entries.filter(e => e.category === cat).length}</span>
                  </button>
              ))}
          </div>
          
          {canEdit && (
              <div className="p-3 border-t border-slate-100 bg-slate-50">
                  <div className="flex gap-2">
                      <input 
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="新分类名称..."
                        className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={handleAddCategory}
                        className="px-2 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                        title="添加分类"
                      >
                          +
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="flex justify-between items-center flex-shrink-0">
            <div>
               <h2 className="text-xl font-bold text-slate-800">AI 知识库管理</h2>
               <p className="text-sm text-slate-500 mt-1">上传话术、政策文档、培训资料，让 AI 助手更懂业务</p>
            </div>
            {canEdit && (
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center"
                >
                  <span className="mr-2 text-xl">+</span> 添加知识
                </button>
            )}
        </div>

        {/* Knowledge List */}
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                {filteredEntries.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded text-white
                          ${item.type === 'TEXT' ? 'bg-blue-500' : item.type === 'FILE' ? 'bg-orange-500' : item.type === 'URL' ? 'bg-green-500' : 'bg-purple-500'}
                        `}>
                          {item.type === 'TEXT' ? '文本' : item.type === 'FILE' ? '文档' : item.type === 'URL' ? '网页' : '图片'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-500 rounded border border-slate-200">{item.category}</span>
                      </div>
                      
                      {canEdit && (
                          <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenEdit(item)}
                                className="text-slate-300 hover:text-indigo-500 transition-colors"
                                title="编辑"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => onDeleteEntry(item.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                title="删除"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                          </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-1" title={item.title}>{item.title}</h3>
                    
                    {item.type === 'IMAGE' && item.imageUrl && (
                        <div className="w-full h-32 bg-slate-100 rounded mb-3 overflow-hidden border border-slate-100">
                            <img src={item.imageUrl} alt="Knowledge" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    {item.sourceName && item.type !== 'IMAGE' && (
                      <div className="mb-3 text-xs text-slate-500 bg-slate-50 p-1.5 rounded flex items-center truncate">
                        <span className="mr-1">{item.type === 'FILE' ? '📎' : '🔗'}</span>
                        {item.sourceName}
                      </div>
                    )}

                    <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 min-h-[4.5rem] flex-1">
                      {item.content}
                    </p>
                    <div className="mt-3 text-xs text-slate-400 text-right">
                        更新于: {item.createdAt}
                    </div>
                  </div>
                ))}
                {filteredEntries.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    该分类下暂无内容{canEdit && '，请点击右上角添加'}
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-[600px] max-w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? '编辑知识' : '添加新知识'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-1">
                     <label className="block text-sm font-bold text-slate-700 mb-1">所属分类</label>
                     <select 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                     >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-1">标题</label>
                     <input 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="例如：2024最新购房资格说明"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                     />
                  </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
                {(['TEXT', 'FILE', 'IMAGE', 'URL'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === type ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type === 'TEXT' && '纯文本'}
                    {type === 'FILE' && '文档 (PDF/PPT)'}
                    {type === 'IMAGE' && '图片识别'}
                    {type === 'URL' && '网页链接'}
                  </button>
                ))}
              </div>

              {/* Conditional Inputs */}
              <div className="space-y-4">
                {activeTab === 'FILE' && (
                  <div className="bg-slate-50 p-4 rounded border border-dashed border-slate-300">
                    <label className="block text-xs font-bold text-slate-500 mb-2">选择文件</label>
                    <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileChange} className="text-sm w-full" />
                    {isProcessing && <p className="text-xs text-indigo-600 mt-2">正在解析文件内容...</p>}
                  </div>
                )}
                
                {activeTab === 'IMAGE' && (
                  <div className="bg-slate-50 p-4 rounded border border-dashed border-slate-300">
                    <label className="block text-xs font-bold text-slate-500 mb-2">上传图片 (支持自动识别)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm w-full" />
                    
                    {imageUrl && (
                        <div className="mt-3 w-full h-40 bg-slate-200 rounded overflow-hidden">
                            <img src={imageUrl} alt="preview" className="w-full h-full object-contain" />
                        </div>
                    )}
                    
                    {isProcessing && <p className="text-xs text-indigo-600 mt-2 flex items-center animate-pulse">
                        <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        AI 正在分析图片中的文字和内容...
                    </p>}
                  </div>
                )}

                {activeTab === 'URL' && (
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">网页链接</label>
                     <input 
                        className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-900"
                        placeholder="https://..."
                        value={sourceName}
                        onChange={e => setSourceName(e.target.value)}
                     />
                     <p className="text-xs text-slate-400 mt-1">注：系统将自动抓取链接中的文本内容用于 AI 学习。</p>
                  </div>
                )}

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">
                     {activeTab === 'TEXT' ? '知识内容' : (activeTab === 'IMAGE' ? 'AI 识别结果 / 图片描述' : '内容摘要 / 提取的文本')}
                   </label>
                   <textarea 
                      className="w-full p-2 border border-slate-300 rounded h-48 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 text-sm"
                      placeholder={activeTab === 'IMAGE' ? "AI 识别结果将显示在这里..." : "在此输入详细的知识内容、话术或规则说明..."}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                   />
                   {activeTab !== 'TEXT' && <p className="text-xs text-orange-500 mt-1">* 您可以在此手动修正或补充提取的内容。</p>}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded">取消</button>
              <button onClick={handleSubmit} disabled={isProcessing} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 disabled:opacity-50">保存到知识库</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
