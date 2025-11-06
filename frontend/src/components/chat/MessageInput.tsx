/**
 * MessageInput Component
 * Input field with attachment options (text, image, voice, location)
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MapPin,
  Paperclip,
  X,
} from 'lucide-react';
import { ChatMessageType } from '@/types/enhanced-entities';
import { toast } from 'sonner';

export interface MessageInputProps {
  onSendText: (message: string, type: ChatMessageType) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  onSendVoice: (file: File) => Promise<void>;
  onSendLocation: () => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendText,
  onSendImage,
  onSendVoice,
  onSendLocation,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSendText = async () => {
    if (!message.trim()) return;

    try {
      await onSendText(message, ChatMessageType.Text);
      setMessage('');
    } catch (error) {
      toast.error(t('customer.chat.sendFailed'));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(t('customer.chat.fileTooLarge'));
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage) return;

    try {
      await onSendImage(selectedImage);
      setSelectedImage(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(t('customer.chat.sendFailed'));
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', {
          type: 'audio/webm',
        });

        try {
          await onSendVoice(audioFile);
        } catch (error) {
          toast.error(t('customer.chat.sendFailed'));
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error(t('customer.chat.microphoneError'));
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendLocation = async () => {
    try {
      await onSendLocation();
      toast.success(t('customer.chat.locationSent'));
    } catch (error) {
      toast.error(t('customer.chat.locationError'));
    }
  };

  return (
    <div className="space-y-2">
      {/* Image Preview */}
      {selectedImage && (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* Attachment Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={disabled || isRecording}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
                {t('customer.chat.sendImage')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleSendLocation}
              >
                <MapPin className="h-4 w-4" />
                {t('customer.chat.shareLocation')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Hidden File Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Message Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendText()}
          placeholder={t('customer.chat.typeMessage')}
          disabled={disabled || isRecording || !!selectedImage}
          className="flex-1"
        />

        {/* Voice Record Button */}
        <Button
          variant={isRecording ? 'destructive' : 'ghost'}
          size="icon"
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onMouseLeave={handleStopRecording}
          disabled={disabled || !!selectedImage || !!message}
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
        </Button>

        {/* Send Button */}
        <Button
          onClick={selectedImage ? handleSendImage : handleSendText}
          disabled={disabled || (!message.trim() && !selectedImage)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="text-sm text-red-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {t('customer.chat.recording')}...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
