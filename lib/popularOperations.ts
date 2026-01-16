export type PopularOp = {
  id: string;
  label: string;
  emoji: string;
  type: "expense" | "income";
  category?: string;
  source?: string;
};

export const POPULAR_OPS: PopularOp[] = [
  {
    id: "food",
    label: "Food",
    emoji: "🍔",
    type: "expense",
    category: "Food",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    type: "expense",
    category: "Travel",
  },
  {
    id: "health",
    label: "Health",
    emoji: "❤️",
    type: "expense",
    category: "Health",
  },
  {
    id: "salary",
    label: "Salary",
    emoji: "💼",
    type: "income",
    source: "Salary",
  },
];
