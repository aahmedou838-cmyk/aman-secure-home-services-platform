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
export const WORLD_DATA = {
  starter_zone: {
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
  }
};