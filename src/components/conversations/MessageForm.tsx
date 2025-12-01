"use client";

import React, { useState } from "react";
import { PaperClipIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { CreateMessageParams } from "@/lib/hooks/useConversationMessages";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

interface MessageFormProps {
  conversationId: number;
  parentId?: number;
  onSubmit: (params: CreateMessageParams) => Promise<any>;
  loading: boolean;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
}

export default function MessageForm({
  conversationId,
  parentId,
  onSubmit,
  loading,
  placeholder = "Write your message...",
  buttonText = "Send",
  onCancel,
}: MessageFormProps) {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showErrorToast("Please enter a message");
      return;
    }

    const params: CreateMessageParams = {
      conversation_id: conversationId,
      parent_id: parentId,
      content: content.trim(),
      attachment: attachment || undefined,
    };

    const result = await onSubmit(params);

    if (result) {
      setContent("");
      setAttachment(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          required
          rows={4}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50"
        />
      </div>

      {attachment && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
            <PaperClipIcon className="w-4 h-4 mr-2" />
            {attachment.name}
          </span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00B5A5] dark:hover:text-[#00B5A5] cursor-pointer transition-colors">
          <PaperClipIcon className="w-5 h-5 mr-1" />
          Attach file
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            disabled={loading}
          />
        </label>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                {buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}