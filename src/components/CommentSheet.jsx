import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { getComments, addComment } from '../services/socialService';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const CommentSheet = ({ activityId, onClose }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        const fetchComments = async () => {
            const data = await getComments(activityId);
            setComments(data);
            setLoading(false);
        };
        fetchComments();
    }, [activityId]);

    // Auto scroll to bottom
    useEffect(() => {
        if (!loading) {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, loading]);

    // Disable body scroll when sheet is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const comment = await addComment(activityId, user.id, newComment);

        if (comment) {
            const data = await getComments(activityId);
            setComments(data);
            setNewComment('');
        }
        setSubmitting(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md bg-white dark:bg-navy-900 rounded-t-3xl h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md rounded-t-3xl sticky top-0 z-10 transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="bg-navy-100 dark:bg-navy-800 p-2 rounded-full text-navy-600 dark:text-navy-300">
                            <MessageCircle size={18} />
                        </div>
                        <h3 className="font-bold text-navy-900 dark:text-white text-lg">Komentar</h3>
                        <span className="bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">{comments.length}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50 dark:bg-navy-950/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-navy-600" size={32} />
                            <p className="text-xs text-gray-400 font-medium animate-pulse">Memuat obrolan...</p>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                            <div className="w-16 h-16 bg-navy-50 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4 text-navy-300 dark:text-navy-600">
                                <MessageCircle size={32} />
                            </div>
                            <p className="text-navy-900 dark:text-white font-bold">Belum ada komentar.</p>
                            <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama menyemangati temanmu!</p>
                        </div>
                    ) : (
                        comments.map((c, idx) => {
                            const isMe = c.user_id === user?.id; // Assuming c.user_id is available from view
                            return (
                                <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom-2 fade-in duration-500`} style={{ animationDelay: `${idx * 50}ms` }}>

                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-navy-700 flex-shrink-0 overflow-hidden shadow-sm border border-white dark:border-navy-600">
                                        {c.avatar_url ? (
                                            <img src={c.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-[10px]">
                                                {c.full_name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                            <span className="text-[11px] font-bold text-navy-900 dark:text-white leading-none">
                                                {c.full_name || 'User'}
                                            </span>
                                            <span className="text-[9px] text-gray-400 leading-none">
                                                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: idLocale })}
                                            </span>
                                        </div>

                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words leading-relaxed
                                            ${isMe
                                                ? 'bg-navy-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-navy-700'
                                            }`}
                                        >
                                            {c.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={commentsEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-900 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <div className="flex-1 bg-gray-50 dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-500/20 transition-all">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Tulis komentar semangat..."
                                disabled={submitting}
                                className="w-full px-4 py-3 bg-transparent text-navy-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className={`p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center flex-shrink-0
                                ${!newComment.trim() || submitting
                                    ? 'bg-gray-100 text-gray-400 dark:bg-navy-800 dark:text-navy-600 shadow-none cursor-not-allowed'
                                    : 'bg-navy-600 text-white hover:bg-navy-700 hover:scale-105'
                                }`}
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={newComment.trim() ? 'ml-0.5' : ''} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentSheet;
