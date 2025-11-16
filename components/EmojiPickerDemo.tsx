'use client';

/**
 * EmojiPicker Demo Component
 * 
 * A simple demo to test the EmojiPicker component
 * This can be used for manual testing and verification
 */

import React, { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';

export const EmojiPickerDemo: React.FC = () => {
  const [selectedEmoji, setSelectedEmoji] = useState('🦄');

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <h2 className="text-xl font-bold">EmojiPicker Demo</h2>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-4">
        <div>
          <p className="text-sm text-default-600 mb-2">
            Click the button below to open the emoji picker:
          </p>
          <EmojiPicker
            value={selectedEmoji}
            onChange={setSelectedEmoji}
          />
        </div>

        <Divider />

        <div>
          <p className="text-sm text-default-600 mb-2">Selected Emoji:</p>
          <div className="text-6xl text-center p-4 bg-default-100 rounded-lg">
            {selectedEmoji || '(none)'}
          </div>
        </div>

        <div>
          <p className="text-sm text-default-600 mb-2">Emoji Code:</p>
          <code className="text-xs bg-default-100 p-2 rounded block">
            {selectedEmoji}
          </code>
        </div>

        <div>
          <p className="text-sm text-default-600 mb-2">Disabled State:</p>
          <EmojiPicker
            value={selectedEmoji}
            onChange={setSelectedEmoji}
            disabled={true}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default EmojiPickerDemo;
