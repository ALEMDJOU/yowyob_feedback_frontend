'use client';

import React from 'react';
import { POPULAR_EMOJIS } from '@/lib/constants';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    onClose?: () => void;
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                marginBottom: '10px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                zIndex: 9999
            }}
        >
            {POPULAR_EMOJIS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={(e) => {
                        e.preventDefault();
                        onEmojiSelect(emoji);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}
