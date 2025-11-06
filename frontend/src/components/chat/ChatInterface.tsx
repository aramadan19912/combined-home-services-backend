/**
 * ChatInterface Component
 * Complete chat system with text, image, voice, and location support
 * Real-time messaging with read/delivery status
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MapPin,
  Paperclip,
  Check,
  CheckCheck,
} from 'lucide-react';
import { ChatMessage, ChatMessageType } from '@/types/enhanced-entities';
import { format } from 'date-fns';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

export interface ChatInterfaceProps {
  orderId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  messages: ChatMessage[];
  onSendMessage: (message: string, type: ChatMessageType, attachment?: File) => Promise<void>;
  onSendLocation: (lat: number, lng: number) => Promise<void>;
  onMarkAsRead: (messageId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  orderId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  messages,
  onSendMessage,
  onSendLocation,
  onMarkAsRead,
  isLoading = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.receiverId === currentUserId && !msg.isRead) {
        onMarkAsRead(msg.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  const handleSendMessage = async (
    message: string,
    type: ChatMessageType,
    attachment?: File
  ) => {
    setIsSending(true);
    try {
      await onSendMessage(message, type, attachment);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await onSendLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>
              {otherUserName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{otherUserName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('customer.chat.orderNumber')}: {orderId.substring(0, 8)}...
            </p>
          </div>
          <Badge variant="outline">{t('customer.chat.active')}</Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">
                {t('customer.chat.loadingMessages')}...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-muted-foreground mb-2">
                {t('customer.chat.noMessages')}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('customer.chat.startConversation')}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="space-y-4">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(date), 'MMM dd, yyyy')}
                    </Badge>
                  </div>

                  {/* Messages */}
                  {msgs.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.senderId === currentUserId}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <MessageInput
          onSendText={handleSendMessage}
          onSendImage={(file) =>
            handleSendMessage('', ChatMessageType.Image, file)
          }
          onSendVoice={(file) =>
            handleSendMessage('', ChatMessageType.Voice, file)
          }
          onSendLocation={handleSendLocation}
          disabled={isSending}
        />
      </div>
    </Card>
  );
};

export default ChatInterface;
