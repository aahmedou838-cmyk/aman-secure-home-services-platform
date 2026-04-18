export const WORLD_SIZE = 2000;
export const GRID_SIZE = 50;
export interface NPC {
  id: string;
  name: string;
  position: { x: number; y: number };
  dialogue: string[];
  questId?: string;
  color: string;
}
export interface GameItem {
  key: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
}
export const ITEMS_REGISTRY: Record<string, GameItem> = {
  ancient_scroll: {
    key: "ancient_scroll",
    name: "مخطوطة قديمة",
    description: "مخطوطة مهترئة تحتوي على خرائط سرية لأحياء نواكشوط القديمة.",
    rarity: "rare",
    icon: "📜",
  },
  broken_compass: {
    key: "broken_compass",
    name: "بوصلة مكسورة",
    description: "بوصلة لا تشير إلى الشمال، بل إلى أقرب سر مخفي.",
    rarity: "epic",
    icon: "🧭",
  },
  tea_leaf: {
    key: "tea_leaf",
    name: "ورقة شاي ذهبية",
    description: "نادرة جداً، يقال أنها تمنح صاحبها حكمة الحكماء.",
    rarity: "legendary",
    icon: "🍃",
  },
  rusty_key: {
    key: "rusty_key",
    name: "مفتاح صدئ",
    description: "قد يفتح أحد الأبواب القديمة في الميناء.",
    rarity: "common",
    icon: "🔑",
  },
};
export const WORLD_DATA = {
  starter_zone: {
    name: "وسط المدينة",
    requiredLevel: 1,
    npcs: [
      {
        id: "wise_sage",
        name: "الحكيم باه",
        position: { x: 600, y: 450 },
        color: "#f59e0b",
        dialogue: [
          "أهلاً بك يا بني في مدينة الأسرار.",
          "هذه المدينة مليئة بالكنوز المخفية والألغاز القديمة.",
          "هل يمكنك مساعدتي في العثور على مخطوطة تفرغ زينة؟"
        ],
        questId: "intro_quest"
      },
      {
        id: "market_merchant",
        name: "التاجر المختار",
        position: { x: 400, y: 700 },
        color: "#0ea5e9",
        dialogue: [
          "أجود أنواع الشاي الموريتاني تجدها هنا!",
          "لكن الطريق مقطوع بسبب بعض اللصوص في الجنوب.",
          "عد إليّ عندما تصبح أقوى."
        ],
        questId: "merchant_task"
      }
    ],
    interactables: [
      { id: "old_chest", type: "chest", position: { x: 800, y: 800 }, label: "صندوق قديم" }
    ]
  },
  port_region: {
    name: "منطقة الميناء",
    requiredLevel: 3,
    npcs: [
      {
        id: "captain_idriss",
        name: "القبطان إدريس",
        position: { x: 1500, y: 1200 },
        color: "#1e3a8a",
        dialogue: [
          "البحر يحمل أسراراً لا يفهمها أهل البر.",
          "هل أنت مستعد لمواجهة المجهول؟",
          "أحتاج لبوصلة مكسورة لإصلاح سفينتي الروحية."
        ],
        questId: "port_mystery"
      }
    ],
    interactables: [
      { id: "anchored_ship", type: "quest_object", position: { x: 1700, y: 1400 }, label: "سفينة راسية" }
    ]
  }
};