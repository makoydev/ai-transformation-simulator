import {
  Bot,
  BrainCircuit,
  Code2,
  FileSearch,
  Handshake,
  Headset,
  Landmark,
  LineChart,
  Megaphone,
  Scale,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ApproachId, DeptId } from '@/engine/types';

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

export const BrandIcon = BrainCircuit;
