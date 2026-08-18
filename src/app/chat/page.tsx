'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  UilMessage, UilSearch, UilStore, UilSmile, UilPhone,
  UilVideo, UilEllipsisV, UilCheck, UilCheckCircle, UilArrowLeft,
  UilTimes, UilBolt, UilImage,
} from '@/components/Icons';
import styles from './page.module.css';

// ─── Types ─────────────────────────────────────────────────────────────────
type MsgStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface Message {
  id: string;
  from: string;
  fromName: string;
  text: string;
  image?: string;
  timestamp: Date;
  status: MsgStatus;
  isQuickReply?: boolean;
}

interface Conversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerInitial: string;
  sellerColor: string;
  product: string;
  productId: string;
  productImage: string;
  productPrice: string;
  lastMessage: string;
  unread: number;
  time: string;
  online: boolean;
  typing: boolean;
  messages: Message[];
}

// ─── Quick replies ──────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  'Is this still available?',
  'Can you do a discount?',
  'Do you deliver to Kigali?',
  'What warranty do you offer?',
  'Can I see more photos?',
];

// ─── Emoji picker (minimal) ─────────────────────────────────────────────────
const EMOJIS = ['😊', '👍', '🙏', '✅', '🔥', '💯', '❤️', '😂', '🤝', '📦', '💰', '🚚'];

// ─── Helpers ────────────────────────────────────────────────────────────────
const SELLER_COLORS = ['#00A550','#3B82F6','#6366F1','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];
function sellerColor(id: string) { return SELLER_COLORS[id.charCodeAt(id.length - 1) % SELLER_COLORS.length]; }

const INITIAL_CONVS: Conversation[] = [
  {
    id: 'conv1',
    sellerId: 'seller1',
    sellerName: 'TechHub Kigali',
    sellerInitial: 'T',
    sellerColor: '#00A550',
    product: 'Samsung Galaxy A54 5G',
    productId: '2',
    productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=80',
    productPrice: 'RWF 350,000',
    lastMessage: 'Yes, we have 15 units in stock!',
    unread: 2,
    time: '12:16',
    online: true,
    typing: false,
    messages: [
      { id: 'm1', from: 'buyer1', fromName: 'Me', text: 'Hello, do you deliver to Musanze district?', timestamp: new Date(Date.now() - 600000), status: 'read' },
      { id: 'm2', from: 'seller1', fromName: 'TechHub Kigali', text: 'Hello! Yes, we deliver to Musanze. Delivery cost is RWF 3,000 and takes 3-5 days.', timestamp: new Date(Date.now() - 540000), status: 'read' },
      { id: 'm3', from: 'buyer1', fromName: 'Me', text: 'Great! Is the Samsung Galaxy A54 still available?', timestamp: new Date(Date.now() - 480000), status: 'read' },
      { id: 'm4', from: 'seller1', fromName: 'TechHub Kigali', text: 'Yes, we currently have 15 units in stock. Would you like to place an order?', timestamp: new Date(Date.now() - 420000), status: 'delivered' },
      { id: 'm5', from: 'seller1', fromName: 'TechHub Kigali', text: 'Yes, we deliver to Musanze. Cost is RWF 3,000.', timestamp: new Date(Date.now() - 300000), status: 'delivered' },
    ],
  },
  {
    id: 'conv2',
    sellerId: 'seller2',
    sellerName: 'PhoneZone Rwanda',
    sellerInitial: 'P',
    sellerColor: '#3B82F6',
    product: 'Infinix Hot 40 Pro',
    productId: '5',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80',
    productPrice: 'RWF 120,000',
    lastMessage: 'We can offer a 5% discount for cash payment.',
    unread: 0,
    time: 'Yesterday',
    online: false,
    typing: false,
    messages: [
      { id: 'm1', from: 'buyer1', fromName: 'Me', text: 'Hi, is there a discount on the Infinix Hot 40 Pro?', timestamp: new Date(Date.now() - 86400000), status: 'read' },
      { id: 'm2', from: 'seller2', fromName: 'PhoneZone Rwanda', text: 'We can offer a 5% discount for cash payment. Interested?', timestamp: new Date(Date.now() - 85000000), status: 'read' },
    ],
  },
  {
    id: 'conv3',
    sellerId: 'seller3',
    sellerName: 'iStore Kigali',
    sellerInitial: 'i',
    sellerColor: '#6366F1',
    product: 'iPhone 15 Pro 256GB',
    productId: '3',
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80',
    productPrice: 'RWF 1,450,000',
    lastMessage: 'The iPhone 15 Pro comes with a 1-year warranty.',
    unread: 1,
    time: 'Mon',
    online: true,
    typing: false,
    messages: [
      { id: 'm1', from: 'buyer1', fromName: 'Me', text: 'What warranty does the iPhone 15 Pro come with?', timestamp: new Date(Date.now() - 172800000), status: 'read' },
      { id: 'm2', from: 'seller3', fromName: 'iStore Kigali', text: 'The iPhone 15 Pro comes with a 1-year manufacturer warranty. We also offer extended warranty plans.', timestamp: new Date(Date.now() - 172000000), status: 'delivered' },
    ],
  },
];

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return fmtTime(d);
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-RW', { weekday: 'short' });
}

// ─── Status Tick ────────────────────────────────────────────────────────────
function StatusTick({ status }: { status: MsgStatus }) {
  if (status === 'sending')   return <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>...</span>;
  if (status === 'sent')      return <UilCheck size="11" style={{ opacity: 0.7 }} />;
  if (status === 'delivered') return <span style={{ display: 'inline-flex' }}><UilCheck size="11" /><UilCheck size="11" style={{ marginLeft: -4 }} /></span>;
  return <span style={{ display: 'inline-flex', color: '#60a5fa' }}><UilCheck size="11" /><UilCheck size="11" style={{ marginLeft: -4 }} /></span>;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const [convs, setConvs]           = useState<Conversation[]>(INITIAL_CONVS);
  const [activeId, setActiveId]     = useState<string>('');
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [search, setSearch]         = useState('');
  const [showEmoji, setShowEmoji]   = useState(false);
  const [showQuick, setShowQuick]   = useState(false);
  const [mobileSide, setMobileSide] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const lastMsgTimeRef              = useRef<string | null>(null);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load conversations ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadConvs() {
      setLoadingConvs(true);
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) return;
        const data = await res.json();
        const mapped: Conversation[] = data.map((c: {
          id: string; sellerId: string; buyerId: string;
          participantNames: Record<string, string>;
          productId?: string; productTitle?: string;
          lastMessage: string; lastMessageAt: string; unreadCount: number;
        }) => {
          const isbuyer = user?.uid === c.buyerId;
          const otherId = isbuyer ? c.sellerId : c.buyerId;
          const otherName = c.participantNames?.[otherId] ?? (isbuyer ? 'Seller' : 'Buyer');
          return {
            id:            c.id,
            sellerId:      c.sellerId,
            sellerName:    otherName,
            sellerInitial: otherName.charAt(0).toUpperCase(),
            sellerColor:   sellerColor(otherId),
            product:       c.productTitle ?? 'Product',
            productId:     c.productId ?? '',
            productImage:  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80',
            productPrice:  '',
            lastMessage:   c.lastMessage,
            unread:        c.unreadCount,
            time:          fmtDate(new Date(c.lastMessageAt)),
            online:        false,
            typing:        false,
            messages:      [],
          } satisfies Conversation;
        });
        setConvs(mapped);
        if (mapped.length > 0) setActiveId(mapped[0].id);
      } finally { setLoadingConvs(false); }
    }
    loadConvs();
  }, [user?.uid]);

  // ── Load messages for active conversation ──────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    async function loadMessages() {
      const res = await fetch(`/api/messages/${activeId}`);
      if (!res.ok) return;
      const data: { id: string; senderId: string; senderName: string; content: string; sentAt: string }[] = await res.json();
      const msgs: Message[] = data.map(m => ({
        id:        m.id,
        from:      m.senderId,
        fromName:  m.senderName,
        text:      m.content,
        timestamp: new Date(m.sentAt),
        status:    'read' as MsgStatus,
      }));
      setMessages(msgs);
      if (msgs.length > 0) lastMsgTimeRef.current = msgs[msgs.length - 1].timestamp.toISOString();
    }
    loadMessages();
  }, [activeId]);

  // ── 3-second polling for new messages ─────────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const since = lastMsgTimeRef.current;
      if (!since) return;
      const res = await fetch(`/api/messages/${activeId}?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const newMsgs: { id: string; senderId: string; senderName: string; content: string; sentAt: string }[] = await res.json();
      if (newMsgs.length === 0) return;
      const mapped: Message[] = newMsgs.map(m => ({
        id:        m.id,
        from:      m.senderId,
        fromName:  m.senderName,
        text:      m.content,
        timestamp: new Date(m.sentAt),
        status:    'delivered' as MsgStatus,
      }));
      setMessages(prev => [...prev, ...mapped]);
      lastMsgTimeRef.current = mapped[mapped.length - 1].timestamp.toISOString();
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId]);

  const active = convs.find(c => c.id === activeId) ?? convs[0];
  // Merge DB messages into active conversation shape
  const activeWithMessages: Conversation | undefined = active ? { ...active, messages } : undefined;
  const filteredConvs = convs.filter(c =>
    c.sellerName.toLowerCase().includes(search.toLowerCase()) ||
    c.product.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Close emoji/quick panels on outside click
  useEffect(() => {
    const close = () => { setShowEmoji(false); setShowQuick(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const selectConv = (id: string) => {
    setActiveId(id);
    setMessages([]);
    lastMsgTimeRef.current = null;
    setMobileSide(false);
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    // Mark read on server
    const role = user?.role === 'seller' ? 'seller' : 'buyer';
    fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).catch(() => {});
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeId) return;
    const optimistic: Message = {
      id:        `opt-${Date.now()}`,
      from:      user?.uid ?? 'me',
      fromName:  'Me',
      text,
      timestamp: new Date(),
      status:    'sending',
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setShowEmoji(false);
    setShowQuick(false);

    try {
      const res = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ convId: activeId, content: text }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => prev.map(m =>
          m.id === optimistic.id
            ? { ...m, id: saved.id, status: 'delivered', timestamp: new Date(saved.sentAt) }
            : m
        ));
        lastMsgTimeRef.current = new Date(saved.sentAt).toISOString();
        setConvs(prev => prev.map(c => c.id === activeId ? { ...c, lastMessage: text } : c));
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, status: 'sent' } : m));
    }
  }, [activeId, user?.uid]);

  const handleSend = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const appendEmoji = (emoji: string) => {
    setInput(p => p + emoji);
    inputRef.current?.focus();
  };

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <div className={styles.page}>
      <div className={styles.chatShell}>

        {/* ============ SIDEBAR ============ */}
        <aside className={`${styles.sidebar} ${mobileSide ? styles.sidebarOpen : ''}`}>

          {/* Sidebar header */}
          <div className={styles.sidebarHeader}>
            <div>
              <h1 className={styles.sidebarTitle}>Messages</h1>
              {totalUnread > 0 && (
                <span className={styles.totalUnread}>{totalUnread} unread</span>
              )}
            </div>
            <button className={styles.closeSidebarBtn} onClick={() => setMobileSide(false)}>
              <UilTimes size="18" />
            </button>
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <UilSearch size="15" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className={styles.searchInput}
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="chat-search"
            />
          </div>

          {/* Conversation list */}
          <div className={styles.convList}>
            {filteredConvs.length === 0 && (
              <p style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No conversations found
              </p>
            )}
            {filteredConvs.map(conv => (
              <button
                key={conv.id}
                className={`${styles.convItem} ${activeId === conv.id ? styles.convItemActive : ''}`}
                onClick={() => selectConv(conv.id)}
                id={`conv-${conv.id}`}
              >
                {/* Avatar with online dot */}
                <div className={styles.convAvatarWrap}>
                  <div className={styles.convAvatar} style={{ background: conv.sellerColor }}>
                    {conv.sellerInitial}
                  </div>
                  {conv.online && <span className={styles.onlineDot} />}
                </div>

                <div className={styles.convMeta}>
                  <div className={styles.convRow}>
                    <span className={styles.convName}>{conv.sellerName}</span>
                    <span className={styles.convTime}>{conv.time}</span>
                  </div>
                  <span className={styles.convProduct}>Re: {conv.product}</span>
                  <span className={`${styles.convLast} ${conv.unread > 0 ? styles.convLastUnread : ''}`}>
                    {conv.typing ? (
                      <span className={styles.typingPreview}>typing...</span>
                    ) : conv.lastMessage}
                  </span>
                </div>

                {conv.unread > 0 && (
                  <span className={styles.unreadBadge}>{conv.unread}</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* ============ CHAT WINDOW ============ */}
        <div className={styles.chatWindow}>

          {/* ---- Header ---- */}
          <div className={styles.chatHeader}>
            {/* Mobile back */}
            <button className={styles.mobileBackBtn} onClick={() => setMobileSide(true)} aria-label="Back to conversations">
              <UilArrowLeft size="20" />
            </button>

            {/* Seller info */}
            <div className={styles.headerAvatarWrap}>
              <div className={styles.headerAvatar} style={{ background: active.sellerColor }}>
                {active.sellerInitial}
              </div>
              {active.online && <span className={styles.onlineDotLg} />}
            </div>

            <div className={styles.headerInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong className={styles.headerName}>{active.sellerName}</strong>
                <span className={styles.verifiedTag}>
                  <UilCheckCircle size="11" /> Verified
                </span>
              </div>
              <p className={styles.headerSub}>
                {convs.find(c => c.id === activeId)?.typing
                  ? <span className={styles.typingText}>typing...</span>
                  : active.online ? <span className={styles.onlineText}>Online now</span> : 'Last seen recently'
                }
              </p>
            </div>

            {/* Header actions */}
            <div className={styles.headerActions}>
              <Link
                href={`/seller/${active.sellerId}/store`}
                className={`btn btn-ghost btn-xs ${styles.viewStoreBtn}`}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <UilStore size="13" /> View Store
              </Link>
              <button className={styles.headerIconBtn} title="Voice call" aria-label="Call seller">
                <UilPhone size="17" />
              </button>
              <button className={styles.headerIconBtn} title="Video call" aria-label="Video call">
                <UilVideo size="17" />
              </button>
              <button className={styles.headerIconBtn} title="More options" aria-label="More">
                <UilEllipsisV size="17" />
              </button>
            </div>
          </div>

          {/* ---- Product context banner ---- */}
          <div className={styles.productBanner}>
            <img src={active.productImage} alt={active.product} className={styles.productBannerImg} />
            <div className={styles.productBannerInfo}>
              <span className={styles.productBannerName}>{active.product}</span>
              <span className={styles.productBannerPrice}>{active.productPrice}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
              <Link href={`/products/${active.productId}`} className="btn btn-ghost btn-xs">
                View
              </Link>
              <Link href="/checkout" className="btn btn-primary btn-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <UilBolt size="11" /> Buy Now
              </Link>
            </div>
          </div>

          {/* ---- Messages ---- */}
          <div className={styles.messages}>
            {/* Date divider */}
            <div className={styles.dateDivider}><span>Today</span></div>

            {messages.map((msg, idx) => {
              const isMe = msg.from === user?.uid || msg.fromName === 'Me';
              const prevMsg = messages[idx - 1];
              const sameAuthor = prevMsg && prevMsg.from === msg.from;
              return (
                <div
                  key={msg.id}
                  className={`${styles.msgRow} ${isMe ? styles.msgRowMe : styles.msgRowThem}`}
                  style={{ marginTop: sameAuthor ? 2 : 12 }}
                >
                  {/* Their avatar (only on first of a group) */}
                  {!isMe && !sameAuthor && (
                    <div className={styles.msgAvatar} style={{ background: active.sellerColor }}>
                      {active.sellerInitial}
                    </div>
                  )}
                  {!isMe && sameAuthor && <div className={styles.msgAvatarSpacer} />}

                  <div className={styles.msgContent}>
                    {/* Sender name (first in group only) */}
                    {!isMe && !sameAuthor && (
                      <span className={styles.msgSenderName}>{active.sellerName}</span>
                    )}
                    <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                      <p className={styles.bubbleText}>{msg.text}</p>
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleTime}>{fmtTime(msg.timestamp)}</span>
                        {isMe && (
                          <span className={styles.statusTick}>
                            <StatusTick status={msg.status} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {convs.find(c => c.id === activeId)?.typing && (
              <div className={`${styles.msgRow} ${styles.msgRowThem}`} style={{ marginTop: 12 }}>
                <div className={styles.msgAvatar} style={{ background: active.sellerColor }}>
                  {active.sellerInitial}
                </div>
                <div className={`${styles.bubble} ${styles.bubbleThem} ${styles.typingBubble}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Quick replies ---- */}
          {showQuick && (
            <div className={styles.quickReplies} onClick={e => e.stopPropagation()}>
              {QUICK_REPLIES.map(q => (
                <button key={q} className={styles.quickChip} onClick={() => { setInput(q); setShowQuick(false); inputRef.current?.focus(); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ---- Emoji picker ---- */}
          {showEmoji && (
            <div className={styles.emojiPicker} onClick={e => e.stopPropagation()}>
              {EMOJIS.map(e => (
                <button key={e} className={styles.emojiBtn} onClick={() => appendEmoji(e)}>{e}</button>
              ))}
            </div>
          )}

          {/* ---- Input bar ---- */}
          <div className={styles.inputBar}>
            <div className={styles.inputActions}>
              <button
                className={styles.inputIconBtn}
                title="Quick replies"
                onClick={e => { e.stopPropagation(); setShowQuick(p => !p); setShowEmoji(false); }}
                aria-label="Quick replies"
              >
                <UilBolt size="18" />
              </button>
              <button
                className={styles.inputIconBtn}
                title="Emoji"
                onClick={e => { e.stopPropagation(); setShowEmoji(p => !p); setShowQuick(false); }}
                aria-label="Emoji"
              >
                <UilSmile size="18" />
              </button>
              <button className={styles.inputIconBtn} title="Attach image" aria-label="Attach image">
                <UilImage size="18" />
              </button>
            </div>

            <div className={styles.inputWrap}>
              <input
                ref={inputRef}
                className={styles.messageInput}
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                id="chat-message-input"
              />
            </div>

            <button
              className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
              onClick={handleSend}
              id="chat-send-btn"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <UilMessage size="18" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile FAB to open sidebar */}
      <button
        className={styles.mobileSidebarFab}
        onClick={() => setMobileSide(true)}
        style={{ display: mobileSide ? 'none' : undefined }}
        aria-label="Open conversations"
      >
        <UilMessage size="20" />
        {totalUnread > 0 && <span className={styles.fabBadge}>{totalUnread}</span>}
      </button>
    </div>
  );
}
