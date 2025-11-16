'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';

export interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  disabled?: boolean;
}

const EMOJI_DATA = {
  smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱'],
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿','🦔'],
  food: ['🍎','🍏','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽','🥣','🥡','🥢','🧂'],
  objects: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋','🤼','🤸','🤺','⛹','🤾','🏌','🏇','🧘','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🏵','🎗','🎫','🎟','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸','⏯','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','👁‍🗨','💬','💭','🗯','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧']
};

const CATEGORIES = [
  { id: 'recent', icon: '🕐', label: '最近' },
  { id: 'smileys', icon: '😀', label: '表情' },
  { id: 'animals', icon: '🐶', label: '动物' },
  { id: 'food', icon: '🍎', label: '食物' },
  { id: 'objects', icon: '⚽', label: '物品' },
  { id: 'symbols', icon: '❤️', label: '符号' }
];

const RECENT_KEY = 'emoji_recent';
const MAX_RECENT = 24;

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('smileys');
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  const saveRecent = useCallback((emoji: string) => {
    const updated = [emoji, ...recent.filter(e => e !== emoji)].slice(0, MAX_RECENT);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recent]);

  const handleSelect = useCallback((emoji: string) => {
    onChange(emoji);
    saveRecent(emoji);
    setOpen(false);
  }, [onChange, saveRecent]);

  const emojis = useMemo(() => {
    if (category === 'recent') return recent;
    const list = EMOJI_DATA[category as keyof typeof EMOJI_DATA] || [];
    if (!search) return list;
    return list.filter(e => e.includes(search));
  }, [category, search, recent]);

  return (
    <Popover 
      isOpen={open} 
      onOpenChange={setOpen} 
      placement="bottom-start"
      shouldBlockScroll={false}
      classNames={{
        content: 'z-[9999]'
      }}
    >
      <PopoverTrigger>
        <Button
          variant="flat"
          className="w-full justify-start h-12 text-xl font-normal"
          isDisabled={disabled}
          onPress={() => setOpen(!open)}
        >
          <span className="flex items-center gap-2">
            {value ? <span className="text-2xl">{value}</span> : <span className="text-default-400">选择 Emoji</span>}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0">
        <div className="flex flex-col">
          <div className="p-3 border-b border-divider">
            <Input
              size="sm"
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={{ input: 'text-sm' }}
            />
          </div>
          <div className="flex border-b border-divider">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-1 py-2 text-lg transition-colors ${
                  category === cat.id 
                    ? 'bg-primary/10 border-b-2 border-primary' 
                    : 'hover:bg-default-100'
                }`}
                title={cat.label}
              >
                {cat.icon}
              </button>
            ))}
          </div>
          <div className="h-[280px] overflow-y-auto p-2">
            {emojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(emoji)}
                    className="w-10 h-10 flex items-center justify-center text-xl rounded hover:bg-default-100 active:scale-95 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-default-400">
                {category === 'recent' ? '暂无最近使用' : '未找到'}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
