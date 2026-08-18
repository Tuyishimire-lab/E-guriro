'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UilMessage, UilSearch, UilStore, UilComment } from '@/components/Icons';
import styles from './page.module.css';

interface Message {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    sellerId: 'seller1',
    sellerName: 'TechHub Kigali',
    product: 'Samsung Galaxy A54',
    lastMessage: 'Yes, we deliver to Musanze. Cost is RWF 3,000.',
    unread: 2,
    time: '10:30 AM',
    messages: [
      { id: 'm1', from: 'buyer1', fromName: 'Me', text: 'Hello, do you deliver to Musanze district?', timestamp: new Date(), read: true },
      { id: 'm2', from: 'seller1', fromName: 'TechHub Kigali', text: 'Hello! Yes, we deliver to Musanze. Delivery cost is RWF 3,000 and takes 3-5 days.', timestamp: new Date(), read: true },
      { id: 'm3', from: 'buyer1', fromName: 'Me', text: 'Great! Is the Samsung Galaxy A54 still available?', timestamp: new Date(), read: true },
      { id: 'm4', from: 'seller1', fromName: 'TechHub Kigali', text: 'Yes, we currently have 15 units in stock. Would you like to place an order?', timestamp: new Date(), read: false },
      { id: 'm5', from: 'seller1', fromName: 'TechHub Kigali', text: 'Yes, we deliver to Musanze. Cost is RWF 3,000.', timestamp: new Date(), read: false },
    ] as Message[],
  },
  {
    id: 'conv2',
    sellerId: 'seller2',
    sellerName: 'Ikawa Rwanda',
    product: 'Premium Coffee Beans',
    lastMessage: 'Our coffee is 100% Arabica from the Western Province.',
    unread: 0,
    time: 'Yesterday',
    messages: [
      { id: 'm1', from: 'buyer1', fromName: 'Me', text: 'What type of coffee do you sell?', timestamp: new Date(), read: true },
      { id: 'm2', from: 'seller2', fromName: 'Ikawa Rwanda', text: 'Our coffee is 100% Arabica from the Western Province.', timestamp: new Date(), read: true },
    ] as Message[],
  },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv.messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      from: user?.uid || 'buyer1',
      fromName: 'Me',
      text: newMessage,
      timestamp: new Date(),
      read: true,
    };
    const updated = conversations.map(c =>
      c.id === activeConv.id
        ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage }
        : c
    );
    setConversations(updated);
    setActiveConv(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    setNewMessage('');

    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        from: activeConv.sellerId,
        fromName: activeConv.sellerName,
        text: 'Thank you for your message! We will get back to you shortly. You can also call us on 0788 000 000.',
        timestamp: new Date(),
        read: false,
      };
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, messages: [...c.messages, reply] } : c
      ));
      setActiveConv(prev => ({ ...prev, messages: [...prev.messages, reply] }));
    }, 2000);
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <UilComment size="28" style={{ color: 'var(--brand-green)' }} />
        Messages
      </h1>

      <div className={styles.chatLayout}>
        {/* Conversation List */}
        <div className={styles.convList}>
          {conversations.map(conv => (
            <button
              key={conv.id}
              className={`${styles.convItem} ${activeConv.id === conv.id ? styles.convItemActive : ''}`}
              onClick={() => setActiveConv(conv)}
              id={`conv-${conv.id}`}
            >
              <div className={styles.convAvatar}>
                <UilStore size="20" />
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convTop}>
                  <span className={styles.convName}>{conv.sellerName}</span>
                  <span className={styles.convTime}>{conv.time}</span>
                </div>
                <span className={styles.convProduct}>Re: {conv.product}</span>
                <span className={styles.convLast}>{conv.lastMessage}</span>
              </div>
              {conv.unread > 0 && (
                <span className={styles.unreadBadge}>{conv.unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatAvatar}>
              <UilStore size="20" />
            </div>
            <div>
              <h3 className={styles.chatName}>{activeConv.sellerName}</h3>
              <p className={styles.chatSub}>Re: {activeConv.product} &nbsp;&nbsp; <span className={styles.online}>Online</span></p>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {activeConv.messages.map(msg => {
              const isMe = msg.fromName === 'Me';
              return (
                <div key={msg.id} className={`${styles.messageBubble} ${isMe ? styles.myMessage : styles.theirMessage}`}>
                  {!isMe && (
                    <div className={styles.bubbleAvatar}>
                      <UilStore size="14" />
                    </div>
                  )}
                  <div className={styles.bubble}>
                    <p className={styles.bubbleText}>{msg.text}</p>
                    <span className={styles.bubbleTime}>
                      {msg.timestamp.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className={styles.readTick}>{msg.read ? ' delivered' : ' sent'}</span>}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.chatInput}>
            <input
              className={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              id="chat-message-input"
            />
            <button
              className={`btn btn-primary ${styles.sendBtn}`}
              onClick={sendMessage}
              id="chat-send-btn"
              aria-label="Send message"
            >
              <UilMessage size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
