import {
  Bot,
  BrainCircuit,
  Code2,
  Container,
  FileSearch,
  Handshake,
  Headset,
  Landmark,
  LineChart,
  Megaphone,
  Scale,
  ShoppingCart,
  Store,
  SlidersHorizontal,
  Truck,
  Umbrella,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ApproachId, DeptId, ScenarioId } from '@/engine/types';

export const DEPT_ICONS: Record<DeptId, LucideIcon> = {
  support: Headset,
  finance: Landmark,
  legal: Scale,
  hr: Users,
  engineering: Code2,
  sales: Handshake,
  operations: Truck,
  marketing: Megaphone,
};

export const APPROACH_ICONS: Record<ApproachId, LucideIcon> = {
  process: Workflow,
  buy: ShoppingCart,
  rag: FileSearch,
  agentic: Bot,
  finetune: SlidersHorizontal,
  predictive: LineChart,
};

/** One per company on the setup screen: a retailer, a freight company and an insurer. */
export const SCENARIO_ICONS: Record<ScenarioId, LucideIcon> = {
  lumen: Store,
  pemberton: Container,
  crestline: Umbrella,
};

export const BrandIcon = BrainCircuit;
