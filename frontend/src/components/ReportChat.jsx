import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  Info
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export default function ReportChat({ reportData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your ReportSaathi assistant. You can ask me questions about this specific report ("${reportData?.title || 'Selected Report'}"), such as what specific biomarkers mean or why reference ranges matter.`,
      supported_by_report: true
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Construct grounded report context text to supply to backend
  const buildReportContext = () => {
    if (!reportData) return '';
    let ctx = `REPORT TITLE: ${reportData.title || ''}\n`;
    ctx += `OVERALL SUMMARY: ${reportData.overallSummary || reportData.overall_summary || ''}\n`;
    
    if (reportData.sections) {
      reportData.sections.forEach(sec => {
        ctx += `\nCATEGORY: ${sec.category}\n`;
        (sec.biomarkers || []).forEach(bio => {
          const val = bio.extracted_value || bio.value || '';
          const unit = bio.unit || '';
          const ref = bio.reference_range || bio.referenceRange || 'Unstated';
          ctx += `- ${bio.name}: Value=${val} ${unit}, RefRange=${ref}, Status=${bio.status}\n`;
        });
      });
    }

    if (reportData.extracted_text) {
      ctx += `\nEXTRACTED SOURCE TEXT PREVIEW:\n${reportData.extracted_text.slice(0, 1500)}`;
    }
    return ctx;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const query = inputQuestion.trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const reportContext = buildReportContext();
      const response = await axios.post(`${API_BASE_URL}/api/reports/chat`, {
        question: query,
        report_context: reportContext,
        chat_history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.data.answer,
        supported_by_report: response.data.supported_by_report
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach the report assistant right now. Please try again shortly.',
          supported_by_report: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What does my Hemoglobin level indicate?",
    "Why is my Blood Glucose flagged?",
    "What are general questions I should ask my physician?"
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ask Questions About This Report
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded exclusively in this report's extracted findings
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
          Strictly Grounded
        </span>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-900">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Answers only from this report. No diagnoses or prescriptions provided.</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.role === 'assistant' && msg.supported_by_report === false && (
                <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Outside report scope • Recommend asking your healthcare provider</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Consulting report context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInputQuestion(q)}
              className="text-[11px] font-medium text-slate-600 hover:text-teal-800 bg-white border border-slate-200 hover:border-teal-300 px-2.5 py-1 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question about this lab report..."
          disabled={loading}
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || loading}
          className={`p-2.5 rounded-xl text-white transition ${
            !inputQuestion.trim() || loading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-teal-700 hover:bg-teal-800 shadow-sm'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
