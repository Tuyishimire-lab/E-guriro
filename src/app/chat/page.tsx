'use client';
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UilMessage, UilSearch, UilStore, UilSmile, UilPhone,
  UilVideo, UilEllipsisV, UilCheck, UilCheckCircle, UilArrowLeft,
  UilTimes, UilBolt, UilImage, UilShoppingCart,
} from '@/components/Icons';
import { uploadImage } from '@/lib/upload';
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
function sellerColor(id: string) {
  if (!id) return '#00A550';
  return SELLER_COLORS[id.charCodeAt(id.length - 1) % SELLER_COLORS.length];
}

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

// ─── Chat Content ───────────────────────────────────────────────────────────
function ChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [convs, setConvs]               = useState<Conversation[]>([]);
  const [activeId, setActiveId]         = useState<string>('');
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [search, setSearch]             = useState('');
  const [showEmoji, setShowEmoji]       = useState(false);
  const [showQuick, setShowQuick]       = useState(false);
  const [mobileSide, setMobileSide]     = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const lastMsgTimeRef                  = useRef<string | null>(null);
  const pollRef                         = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load or Create Conversation on Mount ──────────────────────────────────
  useEffect(() => {
    async function initChat() {
      setLoadingConvs(true);
      try {
        const targetSellerId    = searchParams.get('sellerId');
        const targetSellerName  = searchParams.get('sellerName') || 'Verified Seller';
        const targetProductId   = searchParams.get('productId');
        const targetProductTitle = searchParams.get('productTitle') || 'Product Inquiry';

        let targetConvId: string | null = null;

        // If query parameters provided (e.g. from Product page), initiate or fetch that conversation
        if (targetSellerId && user) {
          try {
            const createRes = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sellerId: targetSellerId,
                sellerName: targetSellerName,
                productId: targetProductId || undefined,
                productTitle: targetProductTitle || undefined,
                senderId: user.uid,
                senderName: user.name || 'Shopper',
              }),
            });
            if (createRes.ok) {
              const resData = await createRes.json();
              targetConvId = resData.convId;
            }
          } catch (e) {
            console.error('Failed to initiate targeted conversation', e);
          }
        }

        // Fetch all user conversations from Postgres
        const res = await fetch(`/api/messages?userId=${user?.uid || ''}`);
        if (res.ok) {
          const data = await res.json();
          const mapped: Conversation[] = (data || []).map((c: {
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
              sellerInitial: otherName.charAt(0).toUpperCase() || 'S',
              sellerColor:   sellerColor(otherId),
              product:       c.productTitle ?? 'Product Inquiry',
              productId:     c.productId ?? '',
              productImage:  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80',
              productPrice:  '',
              lastMessage:   c.lastMessage || 'Conversation started',
              unread:        c.unreadCount || 0,
              time:          c.lastMessageAt ? fmtDate(new Date(c.lastMessageAt)) : 'Just now',
              online:        false,
              typing:        false,
              messages:      [],
            } satisfies Conversation;
          });

          setConvs(mapped);

          if (targetConvId) {
            setActiveId(targetConvId);
          } else if (mapped.length > 0) {
            setActiveId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load chat conversations', err);
      } finally {
        setLoadingConvs(false);
      }
    }
    initChat();
  }, [user?.uid, searchParams]);

  // ── Load messages for active conversation ──────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    async function loadMessages() {
      try {
        const res = await fetch(`/api/messages/${activeId}`);
        if (!res.ok) return;
        const data: { id: string; senderId: string; senderName: string; content: string; image_url?: string; sentAt: string }[] = await res.json();
        const msgs: Message[] = (data || []).map(m => ({
          id:        m.id,
          from:      m.senderId,
          fromName:  m.senderName,
          text:      m.content,
          image:     m.image_url,
          timestamp: new Date(m.sentAt),
          status:    'read' as MsgStatus,
        }));
        setMessages(msgs);
        if (msgs.length > 0) {
          lastMsgTimeRef.current = msgs[msgs.length - 1].timestamp.toISOString();
        }
      } catch (err) {
        console.error('Failed to load messages for conversation', err);
      }
    }
    loadMessages();
  }, [activeId]);

  // ── 3-second polling for new messages on Vercel ────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      const since = lastMsgTimeRef.current;
      if (!since) return;
      try {
        const res = await fetch(`/api/messages/${activeId}?since=${encodeURIComponent(since)}`);
        if (!res.ok) return;
        const newMsgs: { id: string; senderId: string; senderName: string; content: string; image_url?: string; sentAt: string }[] = await res.json();
        if (!newMsgs || newMsgs.length === 0) return;

        const mapped: Message[] = newMsgs.map(m => ({
          id:        m.id,
          from:      m.senderId,
          fromName:  m.senderName,
          text:      m.content,
          image:     m.image_url,
          timestamp: new Date(m.sentAt),
          status:    'delivered' as MsgStatus,
        }));

        setMessages(prev => {
          // Deduplicate by message ID
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = mapped.filter(m => !existingIds.has(m.id));
          if (filtered.length === 0) return prev;
          return [...prev, ...filtered];
        });

        lastMsgTimeRef.current = mapped[mapped.length - 1].timestamp.toISOString();
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeId]);

  const active = convs.find(c => c.id === activeId);
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
      body: JSON.stringify({ role, userId: user?.uid }),
    }).catch(() => {});
  };

  const sendMessage = useCallback(async (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || !activeId) return;
    const optimistic: Message = {
      id:        `opt-${Date.now()}`,
      from:      user?.uid ?? 'me',
      fromName:  user?.name ?? 'Me',
      text:      text.trim(),
      image:     imageUrl,
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
        body:    JSON.stringify({
          convId: activeId,
          content: text.trim(),
          imageUrl,
          senderId: user?.uid,
          senderName: user?.name,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => prev.map(m =>
          m.id === optimistic.id
            ? { ...m, id: saved.id, status: 'delivered', timestamp: new Date(saved.sentAt) }
            : m
        ));
        lastMsgTimeRef.current = new Date(saved.sentAt).toISOString();
        setConvs(prev => prev.map(c => c.id === activeId ? { ...c, lastMessage: text.trim() || 'Photo' } : c));
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, status: 'sent' } : m));
    }
  }, [activeId, user?.uid, user?.name]);

  const handleSend = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      await sendMessage('', url);
    } catch (err) {
      console.error('Failed to attach image', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            {loadingConvs ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading conversations...
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding: 32, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                <p>No conversations yet.</p>
                <Link href="/products" className="btn btn-ghost btn-xs" style={{ marginTop: 8 }}>
                  Explore Products
                </Link>
              </div>
            ) : (
              filteredConvs.map(conv => (
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
                      {conv.lastMessage}
                    </span>
                  </div>

                  {conv.unread > 0 && (
                    <span className={styles.unreadBadge}>{conv.unread}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ============ CHAT WINDOW ============ */}
        <div className={styles.chatWindow}>
          {active ? (
            <>
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
                    {active.online ? <span className={styles.onlineText}>Online</span> : 'Direct Store Messaging'}
                  </p>
                </div>

                {/* Header actions */}
                <div className={styles.headerActions}>
                  {active.sellerId && (
                    <Link
                      href={`/seller/${active.sellerId}/store`}
                      className={`btn btn-ghost btn-xs ${styles.viewStoreBtn}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <UilStore size="13" /> View Store
                    </Link>
                  )}
                </div>
              </div>

              {/* ---- Product context banner ---- */}
              {active.product && (
                <div className={styles.productBanner}>
                  <div className={styles.productBannerInfo}>
                    <span className={styles.productBannerName}>{active.product}</span>
                    <span className={styles.productBannerPrice}>Direct Inquiry</span>
                  </div>
                  {active.productId && (
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
                      <Link href={`/products/${active.productId}`} className="btn btn-ghost btn-xs">
                        View Product
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Messages ---- */}
              <div className={styles.messages}>
                <div className={styles.dateDivider}><span>Conversation History</span></div>

                {messages.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <p>No messages yet. Send a message or select a quick reply below!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.from === user?.uid || msg.fromName === 'Me';
                    const prevMsg = messages[idx - 1];
                    const sameAuthor = prevMsg && prevMsg.from === msg.from;
                    return (
                      <div
                        key={msg.id}
                        className={`${styles.msgRow} ${isMe ? styles.msgRowMe : styles.msgRowThem}`}
                        style={{ marginTop: sameAuthor ? 2 : 12 }}
                      >
                        {/* Avatar */}
                        {!isMe && !sameAuthor && (
                          <div className={styles.msgAvatar} style={{ background: active.sellerColor }}>
                            {active.sellerInitial}
                          </div>
                        )}
                        {!isMe && sameAuthor && <div className={styles.msgAvatarSpacer} />}

                        <div className={styles.msgContent}>
                          {!isMe && !sameAuthor && (
                            <span className={styles.msgSenderName}>{active.sellerName}</span>
                          )}
                          <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Attachment"
                                style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, marginBottom: 4 }}
                              />
                            )}
                            {msg.text && <p className={styles.bubbleText}>{msg.text}</p>}
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
                  })
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
                  <button
                    className={styles.inputIconBtn}
                    title="Attach image"
                    aria-label="Attach image"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <UilImage size="18" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImagePick}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className={styles.inputWrap}>
                  <input
                    ref={inputRef}
                    className={styles.messageInput}
                    placeholder={uploadingImage ? 'Uploading image...' : 'Type a message...'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={uploadingImage}
                    id="chat-message-input"
                  />
                </div>

                <button
                  className={`${styles.sendBtn} ${input.trim() || uploadingImage ? styles.sendBtnActive : ''}`}
                  onClick={handleSend}
                  id="chat-send-btn"
                  aria-label="Send message"
                  disabled={!input.trim() && !uploadingImage}
                >
                  <UilMessage size="18" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, color: 'var(--text-muted)', textAlign: 'center' }}>
              <UilMessage size="48" style={{ opacity: 0.3, marginBottom: 16 }} />
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>Select a Conversation</h2>
              <p style={{ maxWidth: 360, margin: '0 0 20px', fontSize: '0.88rem' }}>
                Chat directly with sellers about electronics, pricing, warranties, and delivery across Rwanda.
              </p>
              <Link href="/products" className="btn btn-primary btn-sm">
                <UilShoppingCart size="15" /> Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
