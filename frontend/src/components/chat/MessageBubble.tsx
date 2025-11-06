/**
 * MessageBubble Component
 * Individual message display with different types support
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Image as ImageIcon, Mic, MapPin } from 'lucide-react';
import { ChatMessage, ChatMessageType } from '@/types/enhanced-entities';
import { format } from 'date-fns';

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const { t } = useTranslation();

  const renderMessageContent = () => {
    switch (message.messageType) {
      case ChatMessageType.Text:
        return <p className="break-words whitespace-pre-wrap">{message.message}</p>;

      case ChatMessageType.Image:
        return (
          <div className="space-y-2">
            <img
              src={message.attachmentUrl}
              alt="Shared image"
              className="rounded-lg max-w-sm cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.attachmentUrl, '_blank')}
            />
            {message.message && (
              <p className="text-sm break-words">{message.message}</p>
            )}
          </div>
        );

      case ChatMessageType.Voice:
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <audio controls className="flex-1 h-8">
              <source src={message.attachmentUrl} type="audio/webm" />
              <source src={message.attachmentUrl} type="audio/mp4" />
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case ChatMessageType.Location:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{t('customer.chat.locationShared')}</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-full h-32 bg-muted rounded-lg overflow-hidden hover:opacity-90 transition">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${message.latitude},${message.longitude}&zoom=15&size=300x150&markers=color:red%7C${message.latitude},${message.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                  alt="Location"
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
          </div>
        );

      default:
        return <p>{message.message}</p>;
    }
  };

  return (
    <div
      className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar (only for other user's messages) */}
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs">O</AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[70%] space-y-1 ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {renderMessageContent()}
        </div>

        {/* Metadata */}
        <div
          className={`flex items-center gap-2 text-xs text-muted-foreground ${
            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>

          {/* Read/Delivery Status (only for own messages) */}
          {isOwnMessage && (
            <>
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : message.deliveredAt ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
